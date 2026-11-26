import prisma from "@repo/database";

import { serviceSelection } from "../services/service.repository";

export function findItinerarySummaries(start: Date, end: Date) {
	return prisma.itinerary.findMany({
		where: { date: { gte: start, lte: end } },
		orderBy: { date: "asc" },
		select: { date: true, _count: { select: { services: true } } },
	});
}

export function findItinerary(date: Date) {
	return prisma.itinerary.findUnique({
		where: { date },
		select: {
			id: true,
			date: true,
			createdAt: true,
			updatedAt: true,
			services: {
				orderBy: [{ pickupTime: "asc" }, { id: "asc" }],
				select: serviceSelection,
			},
		},
	});
}
