import { Router } from "express";
import { z } from "zod";

import { updateEmployeePreferences } from "../../modules/auth/auth.repository";
import {
	getActiveEmployee,
	logInEmployee,
} from "../../modules/auth/auth.service";
import { requireV2Auth } from "./core/auth";
import { unauthorized } from "./core/errors";
import { asyncRoute, success } from "./core/http";

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

router.post(
	"/login",
	asyncRoute(async (req, res) => {
		const { identifier, accessKey } = loginSchema.parse(req.body);
		return success(res, await logInEmployee(identifier, accessKey, req.ip));
	}),
);

router.get(
	"/me",
	requireV2Auth,
	asyncRoute(async (req, res) => {
		if (!req.user) throw unauthorized();
		return success(res, {
			employee: await getActiveEmployee(req.user.employeeId),
		});
	}),
);

router.patch(
	"/preferences",
	requireV2Auth,
	asyncRoute(async (req, res) => {
		if (!req.user) throw unauthorized();
		const input = preferencesSchema.parse(req.body);
		const preferences = await updateEmployeePreferences(
			req.user.employeeId,
			input,
		);
		return success(res, { preferences });
	}),
);

export default router;
