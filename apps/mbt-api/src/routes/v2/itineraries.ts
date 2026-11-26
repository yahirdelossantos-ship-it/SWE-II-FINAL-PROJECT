import { Router } from "express";
import { z } from "zod";

import prisma from "@repo/database";

import { operationalDateToStorage } from "./core/date";
import { asyncRoute, success } from "./core/http";
import { serviceSelection } from "./services";

const router = Router();

router.get(
	"/calendar",
	asyncRoute(async (req, res) => {
		const { startDate, endDate } = z
			.object({ startDate: z.string(), endDate: z.string() })
			.parse(req.query);
		const start = operationalDateToStorage(startDate);
		const end = operationalDateToStorage(endDate);
		if (start > end) {
			throw new z.ZodError([
				{
					code: "custom",
					path: ["endDate"],
					message: "endDate must be on or after startDate",
				},
			]);
		}

		const itineraries = await prisma.itinerary.findMany({
			where: { date: { gte: start, lte: end } },
			orderBy: { date: "asc" },
			select: { date: true, _count: { select: { services: true } } },
		});

		return success(res, {
			days: itineraries.map((itinerary) => ({
				date: itinerary.date.toISOString().slice(0, 10),
				serviceCount: itinerary._count.services,
			})),
		});
	}),
);

router.get(
	"/:date",
	asyncRoute(async (req, res) => {
		const { date } = z.object({ date: z.string() }).parse(req.params);
		const storageDate = operationalDateToStorage(date);
		const itinerary = await prisma.itinerary.findUnique({
			where: { date: storageDate },
			select: {
				id: true,
				date: true,
				sorted: true,
				flightsChecked: true,
				timesConverted: true,
				edgeCases: true,
				createdAt: true,
				updatedAt: true,
				services: {
					orderBy: { pickupTime: "asc" },
					select: serviceSelection,
				},
			},
		});

		return success(res, {
			date,
			itinerary: itinerary ?? null,
			services: itinerary?.services ?? [],
		});
	}),
);

export default router;
