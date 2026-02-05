import { setupWorker } from "msw/browser";
import { mockTokenExpired } from "./handlers/_demo";
import { menuList } from "./handlers/_menu";
import { signIn, userList } from "./handlers/_user";
import { accessHandlers } from "./handlers/access";
import { adminHandlers } from "./handlers/admin";
import { authHandlers } from "./handlers/auth";
import { calendarHandlers } from "./handlers/calendar";
import { dashboardHandlers } from "./handlers/dashboard";
import { dataHandlers } from "./handlers/data";
import { employeeHandlers } from "./handlers/employees";
import { essHandlers } from "./handlers/ess";
import { filingHandlers } from "./handlers/filings";
import { groupHandlers } from "./handlers/group";
import { helpHandlers } from "./handlers/help";
import { leaveHandlers } from "./handlers/leave";
import { notificationHandlers } from "./handlers/notifications";
import { payrollHandlers } from "./handlers/payroll";
import { reportHandlers } from "./handlers/reports";
import { settingsHandlers } from "./handlers/settings";
import { terminationHandlers } from "./handlers/terminations";

const handlers = [
	...accessHandlers,
	...adminHandlers,
	...calendarHandlers,
	...groupHandlers,
	...dataHandlers,
	...helpHandlers,
	...reportHandlers,
	...notificationHandlers,
	...authHandlers,
	...dashboardHandlers,
	...employeeHandlers,
	...essHandlers,
	...filingHandlers,
	...leaveHandlers,
	...payrollHandlers,
	...settingsHandlers,
	...terminationHandlers,
	signIn,
	userList,
	mockTokenExpired,
	menuList,
];
const worker = setupWorker(...handlers);

export { worker };
