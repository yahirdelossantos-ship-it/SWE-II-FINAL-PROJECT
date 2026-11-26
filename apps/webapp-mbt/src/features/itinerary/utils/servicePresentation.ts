import type { ItineraryService } from "../api";

const timeFormatter = new Intl.DateTimeFormat("es-DO", {
	hour: "numeric",
	minute: "2-digit",
	timeZone: "America/Santo_Domingo",
});

export function operationalPickupTime(service: ItineraryService) {
	const value = new Date(service.pickupTime);
	if (service.kindOf !== "ARRIVAL") {
		value.setMinutes(value.getMinutes() - 15);
	}
	return value;
}

export function formatOperationalPickupTime(service: ItineraryService) {
	return timeFormatter.format(operationalPickupTime(service));
}

export function formatStoredPickupTime(value: string) {
	return timeFormatter.format(new Date(value));
}

export function serviceDocumentPlaceName(
	service: ItineraryService,
	side: "pickup" | "dropoff",
) {
	const displayName =
		side === "pickup"
			? service.pickupDisplayName
			: service.dropoffDisplayName;
	const place = side === "pickup" ? service.pickup : service.dropoff;
	const rawName =
		side === "pickup"
			? service.pickupLocationName
			: service.dropoffLocationName;
	return displayName?.trim() || place?.name || rawName || "";
}
