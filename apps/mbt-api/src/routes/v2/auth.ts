import { Router } from "express";
import { z } from "zod";

import prisma from "@repo/database";

import { verifyAccessKey } from "../../utils/access-key";
import { generateToken } from "../../utils/jwt";
import { unauthorized } from "./core/errors";
import { requireV2Auth } from "./core/auth";
import { asyncRoute, success } from "./core/http";
import {
	assertLoginAllowed,
	clearLoginFailures,
	loginAttemptKey,
	recordLoginFailure,
} from "./core/login-limit";

const router = Router();
const loginSchema = z.object({
	identifier: z.string().trim().min(1),
	accessKey: z.string().min(1),
});
const preferencesSchema = z
	.object({
		background: z
			.enum([
				"GLOBES",
				"FOREST",
				"LEAVES",
				"MOUNTAINS",
				"WATER",
				"NIGHTSKY",
			])
			.optional(),
		minimized: z.boolean().optional(),
	})
	.refine((value) => Object.keys(value).length > 0, {
		message: "At least one preference is required",
	});

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

router.post(
	"/login",
	asyncRoute(async (req, res) => {
		const input = loginSchema.parse(req.body);
		const attemptKey = loginAttemptKey(req.ip, input.identifier);
		assertLoginAllowed(attemptKey);
		const employee = await prisma.employee.findFirst({
			where: {
				OR: [
					{ email: input.identifier },
					{ identification: input.identifier },
				],
			},
			select: {
				...employeeSelection,
				accessKey: { select: { id: true, key: true } },
			},
		});

		if (!employee?.accessKey) {
			recordLoginFailure(attemptKey);
			throw unauthorized("Invalid credentials");
		}
		if (employee.state !== "WORKING") {
			recordLoginFailure(attemptKey);
			throw unauthorized("Account is not active");
		}

		if (!(await verifyAccessKey(input.accessKey, employee.accessKey.key))) {
			recordLoginFailure(attemptKey);
			throw unauthorized("Invalid credentials");
		}

		const { accessKey: _accessKey, ...publicEmployee } = employee;
		clearLoginFailures(attemptKey);
		return success(res, {
			token: tokenFor(employee),
			employee: publicEmployee,
		});
	}),
);

router.get(
	"/me",
	requireV2Auth,
	asyncRoute(async (req, res) => {
		if (!req.user) throw unauthorized();
		const employee = await prisma.employee.findUnique({
			where: { id: req.user.employeeId },
			select: employeeSelection,
		});
		if (!employee || employee.state !== "WORKING")
			throw unauthorized("Account is not active");

		return success(res, { employee });
	}),
);

router.patch(
	"/preferences",
	requireV2Auth,
	asyncRoute(async (req, res) => {
		if (!req.user) throw unauthorized();
		const input = preferencesSchema.parse(req.body);
		const employee = await prisma.employee.update({
			where: { id: req.user.employeeId },
			data: input,
			select: { background: true, minimized: true },
		});
		return success(res, { preferences: employee });
	}),
);

export default router;
