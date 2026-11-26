import prisma, { type PlaceKind } from "@repo/database";

type CatalogQuery = { search?: string; limit: number };

function nameFilter(search?: string) {
	return search
		? { contains: search, mode: "insensitive" as const }
		: undefined;
}

export function findAllies({ search, limit }: CatalogQuery) {
	return prisma.ally.findMany({
		where: { name: nameFilter(search) },
		take: limit,
		orderBy: { name: "asc" },
		select: { id: true, name: true, color: true },
	});
}

export function findPlaces({
	search,
	limit,
	kind,
}: CatalogQuery & { kind?: PlaceKind }) {
	return prisma.place.findMany({
		where: { name: nameFilter(search), kind },
		take: limit,
		orderBy: { name: "asc" },
		select: { id: true, name: true, kind: true, iata: true },
	});
}

export function findVehicles({ search, limit }: CatalogQuery) {
	return prisma.vehicle.findMany({
		where: { name: nameFilter(search) },
		take: limit,
		orderBy: { name: "asc" },
		select: { id: true, name: true },
	});
}
