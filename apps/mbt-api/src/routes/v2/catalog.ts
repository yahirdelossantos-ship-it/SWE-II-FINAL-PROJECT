import { Router } from "express";
import { z } from "zod";

import prisma from "@repo/database";

import { asyncRoute, success } from "./core/http";

const router = Router();
const searchSchema = z.object({
	search: z.string().trim().max(100).optional(),
	limit: z.coerce.number().int().min(1).max(200).default(100),
});

router.get(
	"/allies",
	asyncRoute(async (req, res) => {
		const query = searchSchema.parse(req.query);
		const allies = await prisma.ally.findMany({
			where: query.search
				? { name: { contains: query.search, mode: "insensitive" } }
				: undefined,
			take: query.limit,
			orderBy: { name: "asc" },
			select: { id: true, name: true, color: true, logo: true },
		});
		return success(res, { items: allies });
	}),
);

router.get(
	"/places",
	asyncRoute(async (req, res) => {
		const query = searchSchema
			.extend({
				kind: z
					.enum([
						"AIRPORT",
						"HOTEL",
						"RESORT",
						"BEACH",
						"CONDO",
						"RESIDENTIAL",
						"VILLAS",
						"BAR",
						"CLUB",
						"RESTAURANT",
						"MARINA",
						"RESIDENCE",
						"APARTHOTEL",
						"APARTMENT",
						"AIRBNB",
						"OTHER",
					])
					.optional(),
			})
			.parse(req.query);
		const places = await prisma.place.findMany({
			where: {
				...(query.search
					? {
							name: {
								contains: query.search,
								mode: "insensitive" as const,
							},
						}
					: {}),
				...(query.kind ? { kind: query.kind } : {}),
			},
			take: query.limit,
			orderBy: { name: "asc" },
			select: {
				id: true,
				name: true,
				kind: true,
				iata: true,
				zoneId: true,
			},
		});
		return success(res, { items: places });
	}),
);

router.get(
	"/vehicles",
	asyncRoute(async (req, res) => {
		const query = searchSchema.parse(req.query);
		const vehicles = await prisma.vehicle.findMany({
			where: query.search
				? { name: { contains: query.search, mode: "insensitive" } }
				: undefined,
			take: query.limit,
			orderBy: [{ state: "asc" }, { name: "asc" }],
			select: {
				id: true,
				name: true,
				brand: true,
				state: true,
				paxCapacity: true,
				luggageCapacity: true,
			},
		});
		return success(res, { items: vehicles });
	}),
);

export default router;
