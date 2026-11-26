import { Router } from "express";
import { z } from "zod";
import prisma from "@repo/database";
import { asyncRoute, success } from "./core/http";
import {
	normalizeImportedServiceAirport,
	selectPuntaCanaAirportPlaceId,
} from "./core/import-service";
import { createService, createServiceSchema } from "./services";

const router = Router();
const PUNTA_CANA_AIRPORT_IATA = "PUJ";
const serviceTypeSchema = z.enum(["ARRIVAL", "DEPARTURE", "TRANSFER"]);
const importIdentity = (code: string, type: string) => `${code}\u0000${type}`;
async function findPuntaCanaAirportPlaceId() {
	const matches = await prisma.place.findMany({
		where: {
			kind: "AIRPORT",
			iata: {
				equals: PUNTA_CANA_AIRPORT_IATA,
				mode: "insensitive",
			},
		},
		select: { id: true },
		take: 2,
	});

	return selectPuntaCanaAirportPlaceId(matches);
}

router.post(
	"/services",
	asyncRoute(async (req, res) => {
		const input = createServiceSchema.parse(req.body);
		const normalizedInput =
			input.type === "TRANSFER"
				? input
				: normalizeImportedServiceAirport(
						input,
						await findPuntaCanaAirportPlaceId(),
					);
		const service = await createService(
			normalizedInput,
			req.user!.employeeId,
		);

		return success(res, { service }, 201);
	}),
);

router.post(
	"/preflight",
	asyncRoute(async (req, res) => {
		const { services } = z
			.object({
				services: z
					.array(
						z.object({
							code: z.string().trim().min(1).max(80),
							type: serviceTypeSchema,
						}),
					)
					.max(1000),
			})
			.parse(req.body);
		const uniqueCodes = [...new Set(services.map((item) => item.code))];
		const existing = await prisma.service.findMany({
			where: { code: { in: uniqueCodes } },
			select: { code: true, kindOf: true },
		});
		const requested = new Set(
			services.map((item) => importIdentity(item.code, item.type)),
		);
		return success(res, {
			existingServices: existing
				.filter(
					(item): item is typeof item & { code: string } =>
						Boolean(item.code) &&
						requested.has(importIdentity(item.code!, item.kindOf)),
				)
				.map((item) => ({ code: item.code, type: item.kindOf })),
		});
	}),
);

export default router;
