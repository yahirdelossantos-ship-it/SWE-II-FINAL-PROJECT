import { ApiError } from "./errors";
import type { PlaceReference, ServiceKind } from "./service-place";

type ImportedServiceLocations = {
	type: ServiceKind;
	pickup: PlaceReference;
	dropoff: PlaceReference;
};

type AirportPlace = { id: string };

export function selectPuntaCanaAirportPlaceId(matches: AirportPlace[]) {
	if (matches.length === 0) {
		throw new ApiError(
			409,
			"PUJ_AIRPORT_MISSING",
			"Punta Cana International Airport is not configured",
		);
	}
	if (matches.length > 1) {
		throw new ApiError(
			409,
			"PUJ_AIRPORT_AMBIGUOUS",
			"Multiple airport places are configured with IATA PUJ",
		);
	}

	return matches[0].id;
}

export function normalizeImportedServiceAirport<
	T extends ImportedServiceLocations,
>(input: T, pujAirportPlaceId: string): T {
	if (input.type === "ARRIVAL") {
		return {
			...input,
			pickup: { placeId: pujAirportPlaceId },
		};
	}

	if (input.type === "DEPARTURE") {
		return {
			...input,
			dropoff: { placeId: pujAirportPlaceId },
		};
	}

	return input;
}
