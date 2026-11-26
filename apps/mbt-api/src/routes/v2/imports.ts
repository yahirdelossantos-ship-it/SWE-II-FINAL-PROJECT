import { Router } from "express";
import { z } from "zod";

import {
	findExistingImports,
	importService,
} from "../../modules/imports/import.service";
import {
	createServiceSchema,
	serviceTypeSchema,
} from "../../modules/services/service.schema";
import { asyncRoute, success } from "./core/http";

const router = Router();
const preflightSchema = z.object({
	services: z
		.array(
			z.object({
				code: z.string().trim().min(1).max(80),
				type: serviceTypeSchema,
			}),
		)
		.max(1000),
});

router.post(
	"/services",
	asyncRoute(async (req, res) => {
		const input = createServiceSchema.parse(req.body);
		const service = await importService(input, req.user!.employeeId);
		return success(res, { service }, 201);
	}),
);

router.post(
	"/preflight",
	asyncRoute(async (req, res) => {
		const { services } = preflightSchema.parse(req.body);
		return success(res, {
			existingServices: await findExistingImports(services),
		});
	}),
);

export default router;
