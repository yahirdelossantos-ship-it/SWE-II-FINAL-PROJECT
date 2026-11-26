import { Router } from "express";
import { z } from "zod";

import { PlaceKind } from "@repo/database";

import {
	findAllies,
	findPlaces,
	findVehicles,
} from "../../modules/catalog/catalog.repository";
import { asyncRoute, success } from "./core/http";

const router = Router();
const searchSchema = z.object({
	search: z.string().trim().max(100).optional(),
	limit: z.coerce.number().int().min(1).max(200).default(100),
});
const placeSearchSchema = searchSchema.extend({
	kind: z.enum(PlaceKind).optional(),
});

router.get(
	"/allies",
	asyncRoute(async (req, res) => {
		const query = searchSchema.parse(req.query);
		return success(res, { items: await findAllies(query) });
	}),
);

router.get(
	"/places",
	asyncRoute(async (req, res) => {
		const query = placeSearchSchema.parse(req.query);
		return success(res, { items: await findPlaces(query) });
	}),
);

router.get(
	"/vehicles",
	asyncRoute(async (req, res) => {
		const query = searchSchema.parse(req.query);
		return success(res, { items: await findVehicles(query) });
	}),
);

export default router;
