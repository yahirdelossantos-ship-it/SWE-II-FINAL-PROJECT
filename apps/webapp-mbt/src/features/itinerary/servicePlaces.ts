import type { CreateServiceInput, Option, PlaceOption } from "./api";

const PUNTA_CANA_AIRPORT_IATA = "PUJ";

export type LocationSelection = Option | { id: null; name: string } | null;

export function findDefaultAirport(airports: PlaceOption[]) {
	return (
		airports.find(
			(airport) =>
				airport.iata?.toUpperCase() === PUNTA_CANA_AIRPORT_IATA,
		) ?? null
	);
}

export function airportSelectionOrDefault(
	selection: LocationSelection,
	airports: PlaceOption[],
): LocationSelection {
	if (
		selection?.id &&
		airports.some((airport) => airport.id === selection.id)
	) {
		return selection;
	}
	return findDefaultAirport(airports);
}

export function locationInput(
	selection: LocationSelection,
): CreateServiceInput["pickup"] | null {
	if (selection?.id) return { placeId: selection.id };
	const name = selection?.name.trim();
	return name ? { name } : null;
}
