import assert from "node:assert/strict";
import test from "node:test";

import { ApiError } from "./errors";
import {
	normalizeImportedServiceAirport,
	selectPuntaCanaAirportPlaceId,
} from "./import-service";

const pujAirportPlaceId = "puj-airport";

function hasApiError(code: string) {
	return (error: unknown) =>
		error instanceof ApiError &&
		error.status === 409 &&
		error.code === code;
}

test("selects the only configured PUJ airport", () => {
	assert.equal(
		selectPuntaCanaAirportPlaceId([{ id: pujAirportPlaceId }]),
		pujAirportPlaceId,
	);
});

test("rejects missing and ambiguous PUJ airport configuration", () => {
	assert.throws(
		() => selectPuntaCanaAirportPlaceId([]),
		hasApiError("PUJ_AIRPORT_MISSING"),
	);
	assert.throws(
		() =>
			selectPuntaCanaAirportPlaceId([
				{ id: pujAirportPlaceId },
				{ id: "duplicate-puj-airport" },
			]),
		hasApiError("PUJ_AIRPORT_AMBIGUOUS"),
	);
});

test("sets imported arrival pickup to PUJ and preserves its dropoff", () => {
	const input = {
		type: "ARRIVAL" as const,
		pickup: { name: "Airport text supplied by partner" },
		dropoff: { name: "Guest hotel" },
	};

	assert.deepEqual(
		normalizeImportedServiceAirport(input, pujAirportPlaceId),
		{
			...input,
			pickup: { placeId: pujAirportPlaceId },
		},
	);
});

test("sets imported departure dropoff to PUJ and preserves its pickup", () => {
	const input = {
		type: "DEPARTURE" as const,
		pickup: { name: "Guest hotel" },
		dropoff: { placeId: "another-airport" },
	};

	assert.deepEqual(
		normalizeImportedServiceAirport(input, pujAirportPlaceId),
		{
			...input,
			dropoff: { placeId: pujAirportPlaceId },
		},
	);
});

test("leaves imported transfers unchanged", () => {
	const input = {
		type: "TRANSFER" as const,
		pickup: { name: "First hotel" },
		dropoff: { name: "Second hotel" },
	};

	assert.equal(
		normalizeImportedServiceAirport(input, pujAirportPlaceId),
		input,
	);
});
