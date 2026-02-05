import { faker } from "@faker-js/faker";
import { delay, HttpResponse, http } from "msw";
import { BasicStatus } from "@/types/enum";

const MOCK_USERS: Map<
	string,
	{
		id: string;
		email: string;
		password: string;
		fullName: string;
		twoFactorEnabled: boolean;
		emailVerified: boolean;
		status: BasicStatus;
		createdAt: string;
	}
> = new Map();

const MOCK_COMPANIES: Map<
	string,
	{
		id: string;
		name: string;
		status: BasicStatus;
		createdAt: string;
		updatedAt: string;
	}
> = new Map();

const MOCK_USER_COMPANIES: Map<string, { userId: string; companyId: string; role: string }[]> = new Map();

const PENDING_2FA: Map<string, string> = new Map();

const createMockUser = (email: string, password: string, fullName: string) => {
	const id = faker.string.uuid();
	const user = {
		id,
		email,
		password,
		fullName,
		twoFactorEnabled: false,
		emailVerified: true,
		status: BasicStatus.ENABLE,
		createdAt: new Date().toISOString(),
	};
	MOCK_USERS.set(email, user);
	return user;
};

const createMockCompany = (name: string) => {
	const id = faker.string.uuid();
	const company = {
		id,
		name,
		status: BasicStatus.ENABLE,
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
	};
	MOCK_COMPANIES.set(id, company);
	return company;
};

const linkUserToCompany = (userId: string, companyId: string, role: string) => {
	const existing = MOCK_USER_COMPANIES.get(userId) || [];
	existing.push({ userId, companyId, role });
	MOCK_USER_COMPANIES.set(userId, existing);
};

const generateToken = () => ({
	accessToken: faker.string.uuid(),
	refreshToken: faker.string.uuid(),
	expiresAt: Date.now() + 24 * 60 * 60 * 1000,
});

const seedDemoUser = () => {
	if (!MOCK_USERS.has("demo@paypilot.co.za")) {
		const user = createMockUser("demo@paypilot.co.za", "Demo@123", "Demo User");
		user.twoFactorEnabled = true;
		const company1 = createMockCompany("Acme Corporation");
		const company2 = createMockCompany("TechStart Solutions");
		linkUserToCompany(user.id, company1.id, "owner");
		linkUserToCompany(user.id, company2.id, "admin");
	}
	if (!MOCK_USERS.has("single@paypilot.co.za")) {
		const user = createMockUser("single@paypilot.co.za", "Single@123", "Single Company User");
		const company = createMockCompany("Single Corp");
		linkUserToCompany(user.id, company.id, "owner");
	}
};

seedDemoUser();

export const signUp = http.post("/api/auth/signup", async ({ request }) => {
	await delay(500);

	const body = (await request.json()) as {
		companyName: string;
		fullName: string;
		email: string;
		password: string;
	};

	if (MOCK_USERS.has(body.email)) {
		return HttpResponse.json({ status: "error", message: "Email already exists" }, { status: 400 });
	}

	const user = createMockUser(body.email, body.password, body.fullName);
	const company = createMockCompany(body.companyName);
	linkUserToCompany(user.id, company.id, "owner");

	const { password: _, ...userWithoutPassword } = user;

	return HttpResponse.json({
		status: "success",
		data: {
			user: userWithoutPassword,
			company,
			token: generateToken(),
		},
	});
});

export const login = http.post("/api/auth/login", async ({ request }) => {
	await delay(500);

	const body = (await request.json()) as { email: string; password: string };

	const user = MOCK_USERS.get(body.email);

	if (!user || user.password !== body.password) {
		return HttpResponse.json({ status: "error", message: "Invalid email or password" }, { status: 401 });
	}

	if (user.status === BasicStatus.DISABLE) {
		return HttpResponse.json({ status: "error", message: "Account is disabled" }, { status: 403 });
	}

	const { password: _, ...userWithoutPassword } = user;

	if (user.twoFactorEnabled) {
		const code = faker.string.numeric(6);
		PENDING_2FA.set(user.id, code);
		console.log(`[Mock 2FA] Code for ${user.email}: ${code}`);

		return HttpResponse.json({
			status: "success",
			data: {
				user: userWithoutPassword,
				requiresTwoFactor: true,
				companies: [],
				token: null,
			},
		});
	}

	const userCompanyLinks = MOCK_USER_COMPANIES.get(user.id) || [];
	const companies = userCompanyLinks.map((link) => ({
		id: faker.string.uuid(),
		companyId: link.companyId,
		userId: link.userId,
		role: link.role,
		company: MOCK_COMPANIES.get(link.companyId),
	}));

	return HttpResponse.json({
		status: "success",
		data: {
			user: userWithoutPassword,
			requiresTwoFactor: false,
			companies,
			token: generateToken(),
			hasCompletedOnboarding: true,
		},
	});
});

export const verify2FA = http.post("/api/auth/verify-2fa", async ({ request }) => {
	await delay(500);

	const body = (await request.json()) as { code: string; userId: string };

	const expectedCode = PENDING_2FA.get(body.userId);

	if (!expectedCode) {
		return HttpResponse.json({ status: "error", message: "No pending 2FA verification" }, { status: 400 });
	}

	if (body.code !== expectedCode && body.code !== "123456") {
		return HttpResponse.json({ status: "error", message: "Invalid verification code" }, { status: 401 });
	}

	PENDING_2FA.delete(body.userId);

	const user = Array.from(MOCK_USERS.values()).find((u) => u.id === body.userId);
	if (!user) {
		return HttpResponse.json({ status: "error", message: "User not found" }, { status: 404 });
	}

	const { password: _, ...userWithoutPassword } = user;

	const userCompanyLinks = MOCK_USER_COMPANIES.get(user.id) || [];
	const companies = userCompanyLinks.map((link) => ({
		id: faker.string.uuid(),
		companyId: link.companyId,
		userId: link.userId,
		role: link.role,
		company: MOCK_COMPANIES.get(link.companyId),
	}));

	return HttpResponse.json({
		status: "success",
		data: {
			user: userWithoutPassword,
			companies,
			token: generateToken(),
			hasCompletedOnboarding: true,
		},
	});
});

export const getUserCompanies = http.get("/api/user/companies", async ({ request }) => {
	await delay(300);

	const authHeader = request.headers.get("Authorization");
	if (!authHeader) {
		return HttpResponse.json({ status: "error", message: "Unauthorized" }, { status: 401 });
	}

	const demoUser = MOCK_USERS.get("demo@paypilot.co.za");
	if (!demoUser) {
		return HttpResponse.json({ status: "success", data: [] });
	}

	const userCompanyLinks = MOCK_USER_COMPANIES.get(demoUser.id) || [];
	const companies = userCompanyLinks.map((link) => ({
		id: faker.string.uuid(),
		companyId: link.companyId,
		userId: link.userId,
		role: link.role,
		company: MOCK_COMPANIES.get(link.companyId),
	}));

	return HttpResponse.json({
		status: "success",
		data: companies,
	});
});

export const selectCompany = http.post("/api/auth/select-company", async ({ request }) => {
	await delay(300);

	const body = (await request.json()) as { companyId: string };

	const company = MOCK_COMPANIES.get(body.companyId);

	if (!company) {
		return HttpResponse.json({ status: "error", message: "Company not found" }, { status: 404 });
	}

	return HttpResponse.json({
		status: "success",
		data: {
			company,
			role: "owner",
		},
	});
});

export const authHandlers = [signUp, login, verify2FA, getUserCompanies, selectCompany];
