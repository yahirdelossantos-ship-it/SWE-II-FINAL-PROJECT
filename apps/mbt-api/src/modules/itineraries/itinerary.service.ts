import { ZodError } from "zod";

import { operationalDateToStorage } from "../../routes/v2/core/date";

import { findItinerary, findItinerarySummaries } from "./itinerary.repository";

export async function getItineraryCalendar(startDate: string, endDate: string) {
	const start = operationalDateToStorage(startDate);
	const end = operationalDateToStorage(endDate);
	if (start > end) {
		throw new ZodError([
			{
				code: "custom",
				path: ["endDate"],
				message: "endDate must be on or after startDate",
			},
		]);
	}

	const itineraries = await findItinerarySummaries(start, end);
	return itineraries.map((itinerary) => ({
		date: itinerary.date.toISOString().slice(0, 10),
		serviceCount: itinerary._count.services,
	}));
}

export async function getItinerary(date: string) {
	const itinerary = await findItinerary(operationalDateToStorage(date));
	return { date, itinerary, services: itinerary?.services ?? [] };
}
