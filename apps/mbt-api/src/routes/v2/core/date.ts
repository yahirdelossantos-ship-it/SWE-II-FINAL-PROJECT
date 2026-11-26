import { ApiError, badRequest } from "./errors";

export const OPERATIONAL_TIME_ZONE = "America/Santo_Domingo";
const OPERATIONAL_UTC_OFFSET = "-04:00";
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function operationalDateToStorage(date: string): Date {
	if (!DATE_PATTERN.test(date)) {
		throw badRequest("INVALID_DATE", "Date must use YYYY-MM-DD format");
	}

	const value = new Date(`${date}T00:00:00.000Z`);
	if (
		Number.isNaN(value.getTime()) ||
		value.toISOString().slice(0, 10) !== date
	) {
		throw badRequest("INVALID_DATE", "Date is not a valid calendar date");
	}

	return value;
}

export function operationalDateForInstant(value: Date): string {
	const parts = new Intl.DateTimeFormat("en-CA", {
		timeZone: OPERATIONAL_TIME_ZONE,
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	}).formatToParts(value);
	const part = (type: Intl.DateTimeFormatPartTypes) =>
		parts.find((item) => item.type === type)?.value;

	return `${part("year")}-${part("month")}-${part("day")}`;
}

export function operationalDayStart(date: string): Date {
	operationalDateToStorage(date);
	return new Date(`${date}T00:00:00.000${OPERATIONAL_UTC_OFFSET}`);
}

export function operationalDayExclusiveEnd(date: string): Date {
	const nextDate = operationalDateToStorage(date);
	nextDate.setUTCDate(nextDate.getUTCDate() + 1);
	return operationalDayStart(nextDate.toISOString().slice(0, 10));
}

export function assertOperationalDateWritable(date: string, now = new Date()) {
	const target = operationalDateToStorage(date);
	const today = operationalDateToStorage(operationalDateForInstant(now));
	const yesterday = new Date(today);
	yesterday.setUTCDate(yesterday.getUTCDate() - 1);
	if (target < yesterday) {
		throw new ApiError(
			403,
			"ITINERARY_LOCKED",
			"Itineraries older than yesterday cannot be modified",
			{ oldestWritableDate: yesterday.toISOString().slice(0, 10) },
		);
	}
}
