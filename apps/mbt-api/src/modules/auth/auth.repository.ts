import prisma from "@repo/database";

const employeeSelection = {
	id: true,
	name: true,
	email: true,
	identification: true,
	role: true,
	state: true,
	photo: true,
	darkMode: true,
	minimized: true,
	background: true,
} as const;

export function findEmployeeCredentials(identifier: string) {
	return prisma.employee.findFirst({
		where: { OR: [{ email: identifier }, { identification: identifier }] },
		select: {
			...employeeSelection,
			accessKey: { select: { key: true } },
		},
	});
}

export function findEmployee(id: string) {
	return prisma.employee.findUnique({
		where: { id },
		select: employeeSelection,
	});
}

export function updateEmployeePreferences(
	id: string,
	preferences: { background?: string; minimized?: boolean },
) {
	return prisma.employee.update({
		where: { id },
		data: preferences,
		select: { background: true, minimized: true },
	});
}
