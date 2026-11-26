import { Router } from "express";
import { randomBytes } from "node:crypto";
import { z } from "zod";

import prisma, { Prisma } from "@repo/database";

import { ApiError, badRequest, notFound } from "./core/errors";
import {
	assertOperationalDateWritable,
	operationalDateForInstant,
	operationalDateToStorage,
} from "./core/date";
import { asyncRoute, success } from "./core/http";
import { resolveServicePlace } from "./core/service-place";

const router = Router();

function serviceCodePrefix(name: string) {
	const words = name
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.toUpperCase()
		.match(/[A-Z0-9]+/g) ?? ["OTHER"];
	return (
		words.length > 1 ? words.map((word) => word[0]).join("") : words[0]
	).slice(0, 6);
}

async function generateServiceCode(
	database: Prisma.TransactionClient,
	allyName: string,
	itineraryDate: string,
) {
	const base = `${serviceCodePrefix(allyName)}-${itineraryDate.replace(/-/g, "")}`;
	for (let attempt = 0; attempt < 5; attempt += 1) {
		const code = `${base}-${randomBytes(3).toString("hex").toUpperCase()}`;
		const existing = await database.service.findFirst({
			where: { code },
			select: { id: true },
		});
		if (!existing) return code;
	}
	throw new Error("Could not generate a unique service code");
}
const locationSchema = z
	.object({
		placeId: z.string().cuid().optional(),
		name: z.string().trim().min(1).max(160).optional(),
	})
	.refine((value) => value.placeId || value.name, {
		message: "A placeId or name is required",
	});

export const createServiceSchema = z.object({
	itineraryDate: z.string(),
	code: z.string().trim().max(80).optional(),
	type: z.enum(["ARRIVAL", "DEPARTURE", "TRANSFER"]),
	clientName: z.string().trim().min(1).max(160),
	pickupAt: z.string().datetime({ offset: true }),
	flightCode: z.string().trim().max(50).optional(),
	passengers: z.number().int().min(1),
	luggage: z.number().int().min(0).optional(),
	pickup: locationSchema,
	dropoff: locationSchema,
	pickupDisplayName: z.string().trim().max(160).optional(),
	dropoffDisplayName: z.string().trim().max(160).optional(),
	allyId: z.string().cuid().optional(),
	vehicle: z
		.object({
			vehicleId: z.string().cuid().optional(),
			name: z.string().trim().min(1).max(120).optional(),
		})
		.optional(),
	price: z.number().nonnegative().optional(),
	note: z.string().trim().max(4000).optional(),
});

export type CreateServiceInput = z.infer<typeof createServiceSchema>;

const serviceSelection = {
	id: true,
	code: true,
	kindOf: true,
	state: true,
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
	price: true,
	itineraryId: true,
	bookingId: true,
	leg: true,
	createdById: true,
	createdAt: true,
	updatedAt: true,
	note: true,
	ally: { select: { id: true, name: true, color: true, logo: true } },
	vehicle: {
		select: {
			id: true,
			name: true,
			paxCapacity: true,
			luggageCapacity: true,
			state: true,
		},
	},
	pickup: {
		select: { id: true, name: true, kind: true, iata: true, zoneId: true },
	},
	dropoff: {
		select: { id: true, name: true, kind: true, iata: true, zoneId: true },
	},
} as const;

function placeLookup(database: Prisma.TransactionClient) {
	return {
		findById: (id: string) =>
			database.place.findUnique({
				where: { id },
				select: { id: true, kind: true },
			}),
		findByName: (name: string) =>
			database.place.findFirst({
				where: { name: { equals: name, mode: "insensitive" } },
				select: { id: true, kind: true },
			}),
	};
}

async function resolveVehicle(
	database: Prisma.TransactionClient,
	reference: z.infer<typeof createServiceSchema>["vehicle"],
) {
	if (!reference) return { id: null, rawName: null };
	if (reference.vehicleId) {
		const vehicle = await database.vehicle.findUnique({
			where: { id: reference.vehicleId },
			select: { id: true },
		});
		if (!vehicle)
			throw notFound("VEHICLE_NOT_FOUND", "Vehicle was not found");
		return { id: vehicle.id, rawName: null };
	}

	if (!reference.name) return { id: null, rawName: null };
	const vehicle = await database.vehicle.findFirst({
		where: { name: { equals: reference.name, mode: "insensitive" } },
		select: { id: true },
	});
	return vehicle
		? { id: vehicle.id, rawName: null }
		: { id: null, rawName: reference.name };
}

function resolveInputPlace(
	database: Prisma.TransactionClient,
	input: CreateServiceInput,
	field: "pickup" | "dropoff",
) {
	return resolveServicePlace({
		serviceType: input.type,
		field,
		reference: input[field],
		lookup: placeLookup(database),
	});
}

async function createServiceInTransaction(
	transaction: Prisma.TransactionClient,
	input: CreateServiceInput,
	createdById: string,
) {
	assertOperationalDateWritable(input.itineraryDate);
	if (input.code) {
		const existing = await transaction.service.findFirst({
			where: { code: input.code, kindOf: input.type },
			select: { id: true },
		});
		if (existing)
			throw new ApiError(
				409,
				"SERVICE_CODE_EXISTS",
				"A service with this code already exists",
				{
					serviceId: existing.id,
					code: input.code,
					type: input.type,
				},
			);
	}
	const itineraryDate = operationalDateToStorage(input.itineraryDate);
	const pickupAt = new Date(input.pickupAt);
	if (operationalDateForInstant(pickupAt) !== input.itineraryDate) {
		throw badRequest(
			"ITINERARY_DATE_MISMATCH",
			"pickupAt must fall on itineraryDate in America/Santo_Domingo",
		);
	}

	const [pickup, dropoff, ally, vehicle] = await Promise.all([
		resolveInputPlace(transaction, input, "pickup"),
		resolveInputPlace(transaction, input, "dropoff"),
		input.allyId
			? transaction.ally.findUnique({
					where: { id: input.allyId },
					select: { id: true, name: true },
				})
			: null,
		resolveVehicle(transaction, input.vehicle),
	]);
	if (input.allyId && !ally)
		throw notFound("ALLY_NOT_FOUND", "Ally was not found");
	if (!input.code && !ally)
		throw badRequest(
			"ALLY_REQUIRED",
			"An ally is required when generating a service code",
		);
	const code =
		input.code ??
		(await generateServiceCode(
			transaction,
			ally!.name,
			input.itineraryDate,
		));

	const itinerary = await transaction.itinerary.upsert({
		where: { date: itineraryDate },
		create: { date: itineraryDate },
		update: {},
		select: { id: true },
	});
	return transaction.service.create({
		data: {
			createdById,
			code,
			kindOf: input.type,
			clientName: input.clientName,
			pickupTime: pickupAt,
			originalPickupTime: pickupAt,
			flightCode: input.flightCode,
			pax: input.passengers,
			luggage: input.luggage,
			pickupId: pickup.id,
			pickupLocationName: pickup.rawName,
			dropoffId: dropoff.id,
			dropoffLocationName: dropoff.rawName,
			pickupDisplayName: input.pickupDisplayName || null,
			dropoffDisplayName: input.dropoffDisplayName || null,
			allyId: ally?.id,
			vehicleId: vehicle.id,
			vehicleTypeName: vehicle.rawName,
			price: input.price,
			note: input.note,
			itineraryId: itinerary.id,
		},
		select: serviceSelection,
	});
}

export async function createService(
	input: CreateServiceInput,
	createdById: string,
) {
	return prisma.$transaction((transaction) =>
		createServiceInTransaction(transaction, input, createdById),
	);
}

router.post(
	"/",
	asyncRoute(async (req, res) => {
		const input = createServiceSchema.parse(req.body);
		const service = await createService(input, req.user!.employeeId);

		return success(res, { service }, 201);
	}),
);

router.put(
	"/:id",
	asyncRoute(async (req, res) => {
		const { id } = z.object({ id: z.string().cuid() }).parse(req.params);

		const input = createServiceSchema.parse(req.body);

		// check for existing
		const current = await prisma.service.findUnique({
			where: { id },
			select: {
				id: true,
				pickupTime: true,
				originalPickupTime: true,
				itinerary: { select: { date: true } },
			},
		});
		if (!current)
			// return if so
			throw notFound("SERVICE_NOT_FOUND", "Service was not found");

		const currentDate =
			current.itinerary?.date.toISOString().slice(0, 10) ??
			input.itineraryDate;

		// validate date
		assertOperationalDateWritable(currentDate);
		assertOperationalDateWritable(input.itineraryDate);

		// validate matching dates for service and itinerary
		const pickupAt = new Date(input.pickupAt);
		if (operationalDateForInstant(pickupAt) !== input.itineraryDate)
			throw badRequest(
				"ITINERARY_DATE_MISMATCH",
				"pickupAt must fall on itineraryDate in America/Santo_Domingo",
			);

		// validate code
		if (input.code) {
			const duplicate = await prisma.service.findFirst({
				where: {
					code: input.code,
					kindOf: input.type,
					id: { not: id },
				},
				select: { id: true },
			});
			if (duplicate)
				throw new ApiError(
					409,
					"SERVICE_CODE_EXISTS",
					"A service with this code already exists",
				);
		}

		// get relations | create itinerary
		const [pickup, dropoff, ally, vehicle, itinerary] = await Promise.all([
			resolveInputPlace(prisma, input, "pickup"),
			resolveInputPlace(prisma, input, "dropoff"),
			input.allyId
				? prisma.ally.findUnique({
						where: { id: input.allyId },
						select: { id: true },
					})
				: null,
			resolveVehicle(prisma, input.vehicle),
			prisma.itinerary.upsert({
				where: { date: operationalDateToStorage(input.itineraryDate) },
				create: { date: operationalDateToStorage(input.itineraryDate) },
				update: {},
				select: { id: true },
			}),
		]);

		// validate ally
		if (input.allyId && !ally)
			throw notFound("ALLY_NOT_FOUND", "Ally was not found");

		// create and return object
		const service = await prisma.service.update({
			where: { id },
			data: {
				code: input.code,
				kindOf: input.type,
				clientName: input.clientName,
				pickupTime: pickupAt,
				originalPickupTime:
					current.originalPickupTime ?? current.pickupTime,
				pickupTimeModifiedAt:
					(
						current.originalPickupTime ?? current.pickupTime
					).getTime() === pickupAt.getTime()
						? null
						: current.pickupTime.getTime() === pickupAt.getTime()
							? undefined
							: new Date(),
				flightCode: input.flightCode || null,
				pax: input.passengers,
				luggage: input.luggage ?? null,
				pickupId: pickup.id,
				pickupLocationName: pickup.rawName,
				dropoffId: dropoff.id,
				dropoffLocationName: dropoff.rawName,
				pickupDisplayName: input.pickupDisplayName || null,
				dropoffDisplayName: input.dropoffDisplayName || null,
				allyId: ally?.id ?? null,
				vehicleId: vehicle.id,
				vehicleTypeName: vehicle.rawName,
				note: input.note,
				itineraryId: itinerary.id,
			},
			select: serviceSelection,
		});
		return success(res, { service });
	}),
);

router.delete(
	"/:id",
	asyncRoute(async (req, res) => {
		const { id } = z.object({ id: z.string().cuid() }).parse(req.params);
		const service = await prisma.service.findUnique({
			where: { id },
			select: {
				id: true,
				itinerary: { select: { date: true } },
				bookingId: true,
				settlement: { select: { id: true } },
			},
		});
		if (!service)
			throw notFound("SERVICE_NOT_FOUND", "Service was not found");
		if (service.itinerary)
			assertOperationalDateWritable(
				service.itinerary.date.toISOString().slice(0, 10),
			);
		if (service.bookingId)
			throw new ApiError(
				409,
				"SERVICE_FROM_BOOKING",
				"A converted website booking references this service",
			);
		if (service.settlement)
			throw new ApiError(
				409,
				"SERVICE_SETTLED",
				"A financial settlement references this service",
			);

		await prisma.service.delete({ where: { id } });
		return success(res, { deletedId: id });
	}),
);

export { serviceSelection };
export default router;
