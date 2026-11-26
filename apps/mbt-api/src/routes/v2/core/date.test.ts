import assert from "node:assert/strict";
import test from "node:test";

import {
	assertOperationalDateWritable,
	operationalDateForInstant,
	operationalDayExclusiveEnd,
	operationalDayStart,
	operationalDateToStorage,
} from "./date";

test("stores operational dates without environment timezone drift", () => {
	assert.equal(
		operationalDateToStorage("2026-08-24").toISOString(),
		"2026-08-24T00:00:00.000Z",
	);
});

test("builds Santo Domingo service-search day boundaries", () => {
	assert.equal(
		operationalDayStart("2026-09-03").toISOString(),
		"2026-09-03T04:00:00.000Z",
	);
	assert.equal(
		operationalDayExclusiveEnd("2026-09-03").toISOString(),
		"2026-09-04T04:00:00.000Z",
	);
});

test("maps offset-aware instants to the Santo Domingo operational date", () => {
	assert.equal(
		operationalDateForInstant(new Date("2026-08-24T00:30:00-04:00")),
		"2026-08-24",
	);
	assert.equal(
		operationalDateForInstant(new Date("2026-08-24T02:30:00Z")),
		"2026-08-23",
	);
});

test("rejects invalid calendar dates", () => {
	assert.throws(() => operationalDateToStorage("2026-02-30"));
	assert.throws(() => operationalDateToStorage("08/24/2026"));
});

test("allows yesterday but locks older operational dates", () => {
	const now = new Date("2026-08-24T16:00:00-04:00");
	assert.doesNotThrow(() => assertOperationalDateWritable("2026-08-23", now));
	assert.throws(
		() => assertOperationalDateWritable("2026-08-22", now),
		(error: unknown) =>
			error instanceof Error &&
			error.message.includes("older than yesterday"),
	);
});
