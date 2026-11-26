import { Router } from "express";
import { z } from "zod";

import { createServiceSchema } from "../../modules/services/service.schema";
import {
	createService,
	deleteService,
	updateService,
} from "../../modules/services/service.service";
import { asyncRoute, success } from "./core/http";

const router = Router();
const serviceParams = z.object({ id: z.string().cuid() });

router.post(
	"/",
	asyncRoute(async (req, res) => {
		const input = createServiceSchema.parse(req.body);
		const service = await createService(input, req.user!.employeeId);
		return success(res, { service }, 201);
	}),
);

router.put(
	"/:id",
	asyncRoute(async (req, res) => {
		const { id } = serviceParams.parse(req.params);
		const input = createServiceSchema.parse(req.body);
		const service = await updateService(id, input);
		return success(res, { service });
	}),
);

router.delete(
	"/:id",
	asyncRoute(async (req, res) => {
		const { id } = serviceParams.parse(req.params);
		return success(res, await deleteService(id));
	}),
);

export default router;
