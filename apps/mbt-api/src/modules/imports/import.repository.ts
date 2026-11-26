import prisma from "@repo/database";

export function findPuntaCanaAirports() {
	return prisma.place.findMany({
		where: {
			kind: "AIRPORT",
			iata: { equals: "PUJ", mode: "insensitive" },
		},
		select: { id: true },
		take: 2,
	});
}

export function findServicesByCodes(codes: string[]) {
	return prisma.service.findMany({
		where: { code: { in: codes } },
		select: { code: true, kindOf: true },
	});
}
