import { badRequest, notFound } from "./errors";

export type ServiceKind = "ARRIVAL" | "DEPARTURE" | "TRANSFER";
export type ServicePlaceField = "pickup" | "dropoff";
export type PlaceReference = { placeId?: string; name?: string };

type PlaceRecord = {
	id: string;
	kind: string;
};

type PlaceLookup = {
	findById: (id: string) => Promise<PlaceRecord | null>;
	findByName: (name: string) => Promise<PlaceRecord | null>;
};

type ResolveServicePlaceInput = {
	serviceType: ServiceKind;
	field: ServicePlaceField;
	reference: PlaceReference;
	lookup: PlaceLookup;
};

export function servicePlaceRequiresAirport(
	serviceType: ServiceKind,
	field: ServicePlaceField,
) {
	return (
		(serviceType === "ARRIVAL" && field === "pickup") ||
		(serviceType === "DEPARTURE" && field === "dropoff")
	);
}

export async function resolveServicePlace({
	serviceType,
	field,
	reference,
	lookup,
}: ResolveServicePlaceInput) {
	const requiresAirport = servicePlaceRequiresAirport(serviceType, field);

	if (requiresAirport && !reference.placeId) {
		throw badRequest(
			"AIRPORT_PLACE_REQUIRED",
			`${field} must reference an airport place`,
			{ field },
		);
	}

	if (reference.placeId) {
		const place = await lookup.findById(reference.placeId);
		if (!place) {
			throw notFound("PLACE_NOT_FOUND", `${field} place was not found`);
		}
		if (requiresAirport && place.kind !== "AIRPORT") {
			throw badRequest(
				"AIRPORT_PLACE_REQUIRED",
				`${field} must reference an airport place`,
				{ field, placeId: place.id },
			);
		}
		return { id: place.id, rawName: null };
	}

	const place = await lookup.findByName(reference.name!);
	return place
		? { id: place.id, rawName: null }
		: { id: null, rawName: reference.name! };
}
