import { z } from "zod";

const locationSchema = z
	.object({
		placeId: z.string().cuid().optional(),
		name: z.string().trim().min(1).max(160).optional(),
	})
	.refine((value) => value.placeId || value.name, {
		message: "A placeId or name is required",
	});

export const serviceTypeSchema = z.enum(["ARRIVAL", "DEPARTURE", "TRANSFER"]);

export const createServiceSchema = z.object({
	itineraryDate: z.string(),
	code: z.string().trim().min(1).max(80).optional(),
	type: serviceTypeSchema,
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
	note: z.string().trim().max(4000).optional(),
});

export type CreateServiceInput = z.infer<typeof createServiceSchema>;
