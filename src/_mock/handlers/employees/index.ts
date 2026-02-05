import { faker } from "@faker-js/faker";
import { delay, HttpResponse, http } from "msw";
import type {
	Employee,
	EmployeeHistoryItem,
	EmployeeLeaveBalance,
	EmployeeListItem,
	EmployeePayslip,
} from "@/types/employee";

const generateEmployee = (index: number): Employee => {
	const firstName = faker.person.firstName();
	const lastName = faker.person.lastName();
	const statuses = ["active", "active", "active", "inactive", "terminated"] as const;
	const employmentTypes = ["full_time", "full_time", "part_time", "director", "contractor"] as const;
	const idTypes = ["sa_id", "passport", "asylum"] as const;
	const salaryTypes = ["fixed", "hourly"] as const;
	const genders = ["male", "female"] as const;

	return {
		id: `emp-${index}`,
		employeeNumber: `EMP${1000 + index}`,
		firstName,
		lastName,
		fullName: `${firstName} ${lastName}`,
		status: statuses[Math.floor(Math.random() * statuses.length)],
		email: faker.internet.email({ firstName, lastName }).toLowerCase(),
		phone: faker.phone.number(),
		idType: idTypes[Math.floor(Math.random() * idTypes.length)],
		idNumber: faker.string.numeric(13),
		dateOfBirth: faker.date.birthdate({ min: 18, max: 60, mode: "age" }).toISOString().split("T")[0],
		gender: genders[Math.floor(Math.random() * genders.length)],
		physicalAddress: faker.location.streetAddress({ useFullAddress: true }),
		employmentType: employmentTypes[Math.floor(Math.random() * employmentTypes.length)],
		startDate: faker.date.past({ years: 5 }).toISOString().split("T")[0],
		payFrequencyId: "freq-1",
		payFrequencyName: "Monthly",
		payPointId: "pp-1",
		payPointName: "Head Office",
		jobGradeId: "jg-2",
		jobGradeName: "Intermediate",
		workingDaysPerWeek: 5,
		workingHoursPerDay: 8,
		salaryType: salaryTypes[Math.floor(Math.random() * salaryTypes.length)],
		salaryAmount: faker.number.int({ min: 8000, max: 80000 }),
		costToCompany: Math.random() > 0.7,
		overtimeEligible: Math.random() > 0.3,
		bankName: ["Standard Bank", "FNB", "ABSA", "Nedbank", "Capitec"][Math.floor(Math.random() * 5)],
		bankAccountNumber: faker.string.numeric(10),
		bankBranchCode: faker.string.numeric(6),
		bankAccountType: "current",
		taxNumber: Math.random() > 0.3 ? faker.string.numeric(10) : undefined,
		uifIncluded: Math.random() > 0.1,
		sdlIncluded: Math.random() > 0.1,
		etiEligible: Math.random() > 0.7,
		hasErrors: Math.random() > 0.85,
		errors: Math.random() > 0.85 ? ["Missing tax number", "Bank details incomplete"] : undefined,
		createdAt: faker.date.past({ years: 2 }).toISOString(),
		updatedAt: faker.date.recent().toISOString(),
	};
};

const mockEmployees: Employee[] = Array.from({ length: 35 }, (_, i) => generateEmployee(i + 1));

const getLeaveBalances = (): EmployeeLeaveBalance[] => [
	{ leaveTypeId: "lt-1", leaveTypeName: "Annual Leave", entitled: 15, taken: 5, pending: 2, balance: 8 },
	{ leaveTypeId: "lt-2", leaveTypeName: "Sick Leave", entitled: 30, taken: 3, pending: 0, balance: 27 },
	{ leaveTypeId: "lt-3", leaveTypeName: "Family Responsibility", entitled: 3, taken: 1, pending: 0, balance: 2 },
];

const getPayslips = (): EmployeePayslip[] => [
	{ id: "ps-1", period: "Jan 2026", grossPay: 45000, netPay: 35000, deductions: 10000, paidAt: "2026-01-28" },
	{ id: "ps-2", period: "Dec 2025", grossPay: 45000, netPay: 35000, deductions: 10000, paidAt: "2025-12-28" },
	{ id: "ps-3", period: "Nov 2025", grossPay: 44000, netPay: 34200, deductions: 9800, paidAt: "2025-11-28" },
];

const getHistory = (): EmployeeHistoryItem[] => [
	{
		id: "h-1",
		action: "Salary Update",
		description: "Salary increased from R40,000 to R45,000",
		performedBy: "John Admin",
		performedAt: "2025-12-01",
	},
	{
		id: "h-2",
		action: "Job Grade Change",
		description: "Promoted from Junior to Intermediate",
		performedBy: "Jane Owner",
		performedAt: "2025-06-15",
	},
	{
		id: "h-3",
		action: "Created",
		description: "Employee record created",
		performedBy: "System",
		performedAt: "2023-03-01",
	},
];

export const employeeHandlers = [
	http.get("/api/employees", async ({ request }) => {
		await delay(400);
		const url = new URL(request.url);
		const status = url.searchParams.get("status");
		const payFrequency = url.searchParams.get("payFrequency");
		const payPoint = url.searchParams.get("payPoint");
		const search = url.searchParams.get("search")?.toLowerCase();

		let filtered = [...mockEmployees];

		if (status && status !== "all") {
			filtered = filtered.filter((e) => e.status === status);
		}
		if (payFrequency) {
			filtered = filtered.filter((e) => e.payFrequencyId === payFrequency);
		}
		if (payPoint) {
			filtered = filtered.filter((e) => e.payPointId === payPoint);
		}
		if (search) {
			filtered = filtered.filter(
				(e) => e.fullName.toLowerCase().includes(search) || e.employeeNumber.toLowerCase().includes(search),
			);
		}

		const listItems: EmployeeListItem[] = filtered.map((e) => ({
			id: e.id,
			employeeNumber: e.employeeNumber,
			fullName: e.fullName,
			status: e.status,
			payFrequencyName: e.payFrequencyName,
			payPointName: e.payPointName,
			jobGradeName: e.jobGradeName,
			hasErrors: e.hasErrors,
		}));

		return HttpResponse.json({ status: "success", data: listItems, total: listItems.length });
	}),

	http.get("/api/employees/:id", async ({ params }) => {
		await delay(300);
		const employee = mockEmployees.find((e) => e.id === params.id);
		if (!employee) {
			return HttpResponse.json({ status: "error", message: "Employee not found" }, { status: 404 });
		}
		return HttpResponse.json({ status: "success", data: employee });
	}),

	http.post("/api/employees", async ({ request }) => {
		await delay(500);
		const body = (await request.json()) as Record<string, unknown>;
		const newId = `emp-${mockEmployees.length + 1}`;
		const newEmployee: Employee = {
			id: newId,
			employeeNumber: (body.employeeNumber as string) || `EMP${1000 + mockEmployees.length + 1}`,
			firstName: body.firstName as string,
			lastName: body.lastName as string,
			fullName: `${body.firstName} ${body.lastName}`,
			status: "active",
			email: body.email as string,
			phone: body.phone as string,
			idType: body.idType as Employee["idType"],
			idNumber: body.idNumber as string,
			dateOfBirth: body.dateOfBirth as string,
			gender: body.gender as Employee["gender"],
			physicalAddress: body.physicalAddress as string,
			employmentType: body.employmentType as Employee["employmentType"],
			startDate: body.startDate as string,
			payFrequencyId: body.payFrequencyId as string,
			payFrequencyName: "Monthly",
			payPointId: body.payPointId as string,
			payPointName: "Head Office",
			jobGradeId: body.jobGradeId as string,
			jobGradeName: "Intermediate",
			workingDaysPerWeek: body.workingDaysPerWeek as number,
			workingHoursPerDay: body.workingHoursPerDay as number,
			salaryType: body.salaryType as Employee["salaryType"],
			salaryAmount: body.salaryAmount as number,
			costToCompany: body.costToCompany as boolean,
			overtimeEligible: body.overtimeEligible as boolean,
			bankName: body.bankName as string,
			bankAccountNumber: body.bankAccountNumber as string,
			bankBranchCode: body.bankBranchCode as string,
			bankAccountType: body.bankAccountType as string,
			taxNumber: body.taxNumber as string,
			uifIncluded: body.uifIncluded as boolean,
			sdlIncluded: body.sdlIncluded as boolean,
			etiEligible: body.etiEligible as boolean,
			hasErrors: false,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		};
		mockEmployees.push(newEmployee);
		return HttpResponse.json({ status: "success", data: newEmployee });
	}),

	http.put("/api/employees/:id", async ({ params, request }) => {
		await delay(400);
		const body = (await request.json()) as Record<string, unknown>;
		const index = mockEmployees.findIndex((e) => e.id === params.id);
		if (index === -1) {
			return HttpResponse.json({ status: "error", message: "Employee not found" }, { status: 404 });
		}
		Object.assign(mockEmployees[index], body, { updatedAt: new Date().toISOString() });
		return HttpResponse.json({ status: "success", data: mockEmployees[index] });
	}),

	http.post("/api/employees/:id/terminate", async ({ params, request }) => {
		await delay(400);
		const body = (await request.json()) as { terminationDate: string; reason: string };
		const index = mockEmployees.findIndex((e) => e.id === params.id);
		if (index === -1) {
			return HttpResponse.json({ status: "error", message: "Employee not found" }, { status: 404 });
		}
		mockEmployees[index].status = "terminated";
		mockEmployees[index].terminationDate = body.terminationDate;
		mockEmployees[index].terminationReason = body.reason;
		return HttpResponse.json({ status: "success", data: mockEmployees[index] });
	}),

	http.post("/api/employees/:id/reinstate", async ({ params }) => {
		await delay(400);
		const index = mockEmployees.findIndex((e) => e.id === params.id);
		if (index === -1) {
			return HttpResponse.json({ status: "error", message: "Employee not found" }, { status: 404 });
		}
		mockEmployees[index].status = "active";
		mockEmployees[index].terminationDate = undefined;
		mockEmployees[index].terminationReason = undefined;
		return HttpResponse.json({ status: "success", data: mockEmployees[index] });
	}),

	http.post("/api/employees/:id/transfer", async ({ params, request }) => {
		await delay(500);
		const body = (await request.json()) as { targetCompanyId: string };
		const employee = mockEmployees.find((e) => e.id === params.id);
		if (!employee) {
			return HttpResponse.json({ status: "error", message: "Employee not found" }, { status: 404 });
		}
		return HttpResponse.json({
			status: "success",
			message: `Employee transferred to company ${body.targetCompanyId}`,
			data: employee,
		});
	}),

	http.get("/api/employees/:id/leave-balances", async () => {
		await delay(300);
		return HttpResponse.json({ status: "success", data: getLeaveBalances() });
	}),

	http.get("/api/employees/:id/payslips", async () => {
		await delay(300);
		return HttpResponse.json({ status: "success", data: getPayslips() });
	}),

	http.get("/api/employees/:id/history", async () => {
		await delay(300);
		return HttpResponse.json({ status: "success", data: getHistory() });
	}),
];
