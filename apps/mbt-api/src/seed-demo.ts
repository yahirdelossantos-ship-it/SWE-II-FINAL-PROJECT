import "./env";

import prisma from "@repo/database";

import {
	operationalDateForInstant,
	operationalDateToStorage,
} from "./routes/v2/core/date";
import { hashAccessKey, verifyAccessKey } from "./utils/access-key";

const DEMO_EMAIL = "operaciones@example.test";
const DEMO_ACCESS_KEY = "mbt-demo-2026";
const DEMO_CODES = {
	arrival: "DEMO-SACBE-001",
	departure: "DEMO-SACBE-002",
	locked: "DEMO-SACBE-003",
};

async function seedDemo() {
	const date = operationalDateForInstant(new Date());
	const today = operationalDateToStorage(date);
	const past = new Date(today);
	past.setUTCDate(past.getUTCDate() - 3);

	await prisma.$transaction(async (db) => {
		const employee = await db.employee.upsert({
			where: { email: DEMO_EMAIL },
			create: {
				email: DEMO_EMAIL,
				name: "Encargado de demostración",
				role: "MANAGER",
			},
			update: {},
			select: { id: true, accessKey: { select: { key: true } } },
		});

		if (
			!employee.accessKey ||
			!(await verifyAccessKey(DEMO_ACCESS_KEY, employee.accessKey.key))
		) {
			const key = await hashAccessKey(DEMO_ACCESS_KEY);
			await db.accessKey.upsert({
				where: { employeeId: employee.id },
				create: { employeeId: employee.id, key },
				update: { key },
			});
		}

		const ally = await db.ally.upsert({
			where: { name: "Sacbé" },
			create: { name: "Sacbé", color: "#0f766e" },
			update: {},
		});
		const airport = await db.place.upsert({
			where: { iata: "PUJ" },
			create: {
				name: "Aeropuerto Internacional de Punta Cana",
				iata: "PUJ",
				kind: "AIRPORT",
			},
			update: {},
		});
		const hotel = await db.place.upsert({
			where: { id: "cmbtdemohotel" },
			create: {
				id: "cmbtdemohotel",
				name: "Hotel Costa del Sol (demo)",
				kind: "HOTEL",
			},
			update: {},
		});
		await db.place.upsert({
			where: { id: "cmbtdemoresort" },
			create: {
				id: "cmbtdemoresort",
				name: "Resort Brisa Caribe (demo)",
				kind: "RESORT",
			},
			update: {},
		});
		const vehicle = await db.vehicle.upsert({
			where: { id: "cmbtdemovan" },
			create: { id: "cmbtdemovan", name: "Miniván de demostración" },
			update: {},
		});

		const fixtures = [
			{
				code: DEMO_CODES.arrival,
				kindOf: "ARRIVAL",
				day: today,
				time: "09:30",
				original: "09:30",
				clientName: "Cliente Demo Uno",
				pickupId: airport.id,
				dropoffId: hotel.id,
			},
			{
				code: DEMO_CODES.departure,
				kindOf: "DEPARTURE",
				day: today,
				time: "14:30",
				original: "14:00",
				clientName: "Cliente Demo Dos",
				pickupId: hotel.id,
				dropoffId: airport.id,
			},
			{
				code: DEMO_CODES.locked,
				kindOf: "ARRIVAL",
				day: past,
				time: "11:00",
				original: "11:00",
				clientName: "Cliente Demo Tres",
				pickupId: airport.id,
				dropoffId: hotel.id,
			},
		] as const;

		for (const fixture of fixtures) {
			const itinerary = await db.itinerary.upsert({
				where: { date: fixture.day },
				create: { date: fixture.day },
				update: {},
			});
			const fixtureDate = fixture.day.toISOString().slice(0, 10);
			const pickupTime = new Date(
				`${fixtureDate}T${fixture.time}:00-04:00`,
			);
			const originalPickupTime = new Date(
				`${fixtureDate}T${fixture.original}:00-04:00`,
			);

			const data = {
				itineraryId: itinerary.id,
				createdById: employee.id,
				allyId: ally.id,
				vehicleId: vehicle.id,
				clientName: fixture.clientName,
				pickupId: fixture.pickupId,
				dropoffId: fixture.dropoffId,
				pickupTime,
				originalPickupTime,
				pickupTimeModifiedAt:
					fixture.original === fixture.time ? null : new Date(),
				pax: 2,
			};
			const identity = {
				code: `${fixture.code}-${fixtureDate.replace(/-/g, "")}`,
				kindOf: fixture.kindOf,
			};
			await db.service.upsert({
				where: { code_kindOf: identity },
				create: { ...identity, ...data },
				update: {},
			});
		}
	});

	console.log(
		`Datos de demostración preparados. Fecha operativa: ${date}. Usuario: ${DEMO_EMAIL}.`,
	);
}

seedDemo()
	.catch((error) => {
		console.error(error);
		process.exitCode = 1;
	})
	.finally(() => prisma.$disconnect());
