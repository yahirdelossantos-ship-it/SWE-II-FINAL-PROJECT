import { Router } from "express";
import { z } from "zod";

import {
	getItinerary,
	getItineraryCalendar,
} from "../../modules/itineraries/itinerary.service";
import { asyncRoute, success } from "./core/http";

const router = Router();
const calendarQuery = z.object({ startDate: z.string(), endDate: z.string() });
const itineraryParams = z.object({ date: z.string() });

router.get(
	"/calendar",
	asyncRoute(async (req, res) => {
		const { startDate, endDate } = calendarQuery.parse(req.query);
		return success(res, {
			days: await getItineraryCalendar(startDate, endDate),
		});
	}),
);

router.get(
	"/:date",
	asyncRoute(async (req, res) => {
		const { date } = itineraryParams.parse(req.params);
		return success(res, await getItinerary(date));
	}),
);

export default router;
