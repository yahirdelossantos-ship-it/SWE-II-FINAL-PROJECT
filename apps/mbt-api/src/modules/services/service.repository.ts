import prisma, { type Prisma, type ServiceType } from "@repo/database";

export const serviceSelection = {
	id: true,
	code: true,
	kindOf: true,
	clientName: true,
	pickupTime: true,
	originalPickupTime: true,
	pickupTimeModifiedAt: true,
	flightCode: true,
	pax: true,
	luggage: true,
	pickupLocationName: true,
	dropoffLocationName: true,
	pickupDisplayName: true,
	dropoffDisplayName: true,
	vehicleTypeName: true,
	itineraryId: true,
	createdById: true,
	createdAt: true,
	updatedAt: true,
	note: true,
	ally: { select: { id: true, name: true, color: true } },
	vehicle: { select: { id: true, name: true } },
	pickup: {
		select: { id: true, name: true, kind: true, iata: true },
	},
	dropoff: {
		select: { id: true, name: true, kind: true, iata: true },
	},
} satisfies Prisma.ServiceSelect;

export function serviceRepository(db: Prisma.TransactionClient = prisma) {
	return {
		findByCode(code: string, kindOf?: ServiceType, excludeId?: string) {
			return db.service.findFirst({
				where: {
					code,
					kindOf,
					id: excludeId ? { not: excludeId } : undefined,
				},
				select: { id: true },
			});
		},

		findForChange(id: string) {
			return db.service.findUnique({
				where: { id },
				select: {
					code: true,
					pickupTime: true,
					originalPickupTime: true,
					itinerary: { select: { date: true } },
				},
			});
		},

		findPlaceById(id: string) {
			return db.place.findUnique({
				where: { id },
				select: { id: true, kind: true },
			});
		},

		findPlaceByName(name: string) {
			return db.place.findFirst({
				where: { name: { equals: name, mode: "insensitive" } },
				select: { id: true, kind: true },
			});
		},

		findVehicleById(id: string) {
			return db.vehicle.findUnique({
				where: { id },
				select: { id: true },
			});
		},

		findVehicleByName(name: string) {
			return db.vehicle.findFirst({
				where: { name: { equals: name, mode: "insensitive" } },
				select: { id: true },
			});
		},

		findAlly(id: string) {
			return db.ally.findUnique({
				where: { id },
				select: { id: true, name: true },
			});
		},

		upsertItinerary(date: Date) {
			return db.itinerary.upsert({
				where: { date },
				create: { date },
				update: {},
				select: { id: true },
			});
		},

		create(data: Prisma.ServiceUncheckedCreateInput) {
			return db.service.create({ data, select: serviceSelection });
		},

		update(id: string, data: Prisma.ServiceUncheckedUpdateInput) {
			return db.service.update({
				where: { id },
				data,
				select: serviceSelection,
			});
		},

		remove(id: string) {
			return db.service.delete({ where: { id }, select: { id: true } });
		},
	};
}

export type ServiceRepository = ReturnType<typeof serviceRepository>;

export function withServiceTransaction<T>(
	operation: (repository: ServiceRepository) => Promise<T>,
) {
	return prisma.$transaction((transaction) =>
		operation(serviceRepository(transaction)),
	);
}
