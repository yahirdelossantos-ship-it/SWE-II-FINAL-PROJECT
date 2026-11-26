import assert from "node:assert/strict";
import test from "node:test";

import { ApiError } from "./errors";
import {
	resolveServicePlace,
	servicePlaceRequiresAirport,
} from "./service-place";

const places = [
	{ id: "airport-1", name: "Punta Cana Airport", kind: "AIRPORT" },
	{ id: "airport-2", name: "Las Americas Airport", kind: "AIRPORT" },
	{ id: "hotel-1", name: "Beach Hotel", kind: "HOTEL" },
];

const lookup = {
	findById: async (id: string) =>
		places.find((place) => place.id === id) ?? null,
	findByName: async (name: string) =>
		places.find(
			(place) => place.name.toLowerCase() === name.toLowerCase(),
		) ?? null,
};

function hasApiError(code: string, status: number) {
	return (error: unknown) =>
		error instanceof ApiError &&
		error.code === code &&
		error.status === status;
}

test("requires an airport only on arrival pickup and departure dropoff", () => {
	assert.equal(servicePlaceRequiresAirport("ARRIVAL", "pickup"), true);
	assert.equal(servicePlaceRequiresAirport("ARRIVAL", "dropoff"), false);
	assert.equal(servicePlaceRequiresAirport("DEPARTURE", "pickup"), false);
	assert.equal(servicePlaceRequiresAirport("DEPARTURE", "dropoff"), true);
	assert.equal(servicePlaceRequiresAirport("TRANSFER", "pickup"), false);
	assert.equal(servicePlaceRequiresAirport("TRANSFER", "dropoff"), false);
});

test("accepts any airport record on a required airport side", async () => {
	const pickup = await resolveServicePlace({
		serviceType: "ARRIVAL",
		field: "pickup",
		reference: { placeId: "airport-2" },
		lookup,
	});
	const dropoff = await resolveServicePlace({
		serviceType: "DEPARTURE",
		field: "dropoff",
		reference: { placeId: "airport-1" },
		lookup,
	});

	assert.deepEqual(pickup, { id: "airport-2", rawName: null });
	assert.deepEqual(dropoff, { id: "airport-1", rawName: null });
});

test("rejects a non-airport record on a required airport side", async () => {
	await assert.rejects(
		resolveServicePlace({
			serviceType: "ARRIVAL",
			field: "pickup",
			reference: { placeId: "hotel-1" },
			lookup,
		}),
		hasApiError("AIRPORT_PLACE_REQUIRED", 400),
	);
});

test("requires a database place ID on a required airport side", async () => {
	await assert.rejects(
		resolveServicePlace({
			serviceType: "DEPARTURE",
			field: "dropoff",
			reference: { name: "Las Americas Airport" },
			lookup,
		}),
		hasApiError("AIRPORT_PLACE_REQUIRED", 400),
	);
});

test("reports a missing referenced place", async () => {
	await assert.rejects(
		resolveServicePlace({
			serviceType: "ARRIVAL",
			field: "pickup",
			reference: { placeId: "missing" },
			lookup,
		}),
		hasApiError("PLACE_NOT_FOUND", 404),
	);
});

test("preserves normal and raw-name resolution on unrestricted sides", async () => {
	const transferPickup = await resolveServicePlace({
		serviceType: "TRANSFER",
		field: "pickup",
		reference: { placeId: "hotel-1" },
		lookup,
	});
	const departurePickup = await resolveServicePlace({
		serviceType: "DEPARTURE",
		field: "pickup",
		reference: { name: "beach hotel" },
		lookup,
	});
	const arrivalDropoff = await resolveServicePlace({
		serviceType: "ARRIVAL",
		field: "dropoff",
		reference: { name: "Private villa" },
		lookup,
	});

	assert.deepEqual(transferPickup, { id: "hotel-1", rawName: null });
	assert.deepEqual(departurePickup, { id: "hotel-1", rawName: null });
	assert.deepEqual(arrivalDropoff, { id: null, rawName: "Private villa" });
});
