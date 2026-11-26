import { unauthorized } from "../../routes/v2/core/errors";
import {
	assertLoginAllowed,
	clearLoginFailures,
	loginAttemptKey,
	recordLoginFailure,
} from "../../routes/v2/core/login-limit";
import { verifyAccessKey } from "../../utils/access-key";
import { generateToken } from "../../utils/jwt";

import { findEmployee, findEmployeeCredentials } from "./auth.repository";

function tokenFor(employee: {
	id: string;
	email: string | null;
	identification: string | null;
	role: string;
	name: string;
	photo: string | null;
}) {
	return generateToken({
		employeeId: employee.id,
		email: employee.email ?? "",
		identification: employee.identification,
		role: employee.role,
		name: employee.name,
		photo: employee.photo,
	});
}

export async function logInEmployee(
	identifier: string,
	accessKey: string,
	ip?: string,
) {
	const attemptKey = loginAttemptKey(ip, identifier);
	assertLoginAllowed(attemptKey);

	const employee = await findEmployeeCredentials(identifier);
	if (!employee?.accessKey) {
		recordLoginFailure(attemptKey);
		throw unauthorized("Invalid credentials");
	}
	if (employee.state !== "WORKING") {
		recordLoginFailure(attemptKey);
		throw unauthorized("Account is not active");
	}
	if (!(await verifyAccessKey(accessKey, employee.accessKey.key))) {
		recordLoginFailure(attemptKey);
		throw unauthorized("Invalid credentials");
	}

	const { accessKey: _accessKey, ...publicEmployee } = employee;
	clearLoginFailures(attemptKey);
	return { token: tokenFor(employee), employee: publicEmployee };
}

export async function getActiveEmployee(id: string) {
	const employee = await findEmployee(id);
	if (!employee || employee.state !== "WORKING") {
		throw unauthorized("Account is not active");
	}
	return employee;
}
