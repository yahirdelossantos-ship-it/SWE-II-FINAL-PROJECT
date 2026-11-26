import { randomBytes } from "node:crypto";

import {
	assertOperationalDateWritable,
	operationalDateForInstant,
	operationalDateToStorage,
} from "../../routes/v2/core/date";
import { ApiError, badRequest, notFound } from "../../routes/v2/core/errors";
import { resolveServicePlace } from "../../routes/v2/core/service-place";

import {
	type ServiceRepository,
	withServiceTransaction,
} from "./service.repository";
import type { CreateServiceInput } from "./service.schema";

function serviceCodePrefix(name: string) {
	const words = name
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.toUpperCase()
		.match(/[A-Z0-9]+/g) ?? ["OTHER"];

	const prefix =
		words.length > 1 ? words.map((word) => word[0]).join("") : words[0];
	return prefix.slice(0, 6);
}

async function generateServiceCode(
	repository: ServiceRepository,
	allyName: string,
	itineraryDate: string,
) {
	const base = `${serviceCodePrefix(allyName)}-${itineraryDate.replace(/-/g, "")}`;
	for (let attempt = 0; attempt < 5; attempt += 1) {
		const suffix = randomBytes(3).toString("hex").toUpperCase();
		const code = `${base}-${suffix}`;
		if (!(await repository.findByCode(code))) return code;
	}
	throw new Error("Could not generate a unique service code");
}

async function validateServiceCode(
	repository: ServiceRepository,
	code: string,
	type: CreateServiceInput["type"],
	excludeId?: string,
) {
	const existing = await repository.findByCode(code, type, excludeId);
	if (existing) {
		throw new ApiError(
			409,
			"SERVICE_CODE_EXISTS",
			"A service with this code already exists",
			{ serviceId: existing.id, serviceCode: code, type },
		);
	}
}

function getWritablePickup(input: CreateServiceInput) {
	assertOperationalDateWritable(input.itineraryDate);
	const pickupTime = new Date(input.pickupAt);
	if (operationalDateForInstant(pickupTime) !== input.itineraryDate) {
		throw badRequest(
			"ITINERARY_DATE_MISMATCH",
			"pickupAt must fall on itineraryDate in America/Santo_Domingo",
		);
	}
	return pickupTime;
}

async function resolveVehicle(
	repository: ServiceRepository,
	reference: CreateServiceInput["vehicle"],
) {
	if (reference?.vehicleId) {
		const vehicle = await repository.findVehicleById(reference.vehicleId);
		if (!vehicle)
			throw notFound("VEHICLE_NOT_FOUND", "Vehicle was not found");
		return { id: vehicle.id, rawName: null };
	}

	if (!reference?.name) return { id: null, rawName: null };
	const vehicle = await repository.findVehicleByName(reference.name);
	return vehicle
		? { id: vehicle.id, rawName: null }
		: { id: null, rawName: reference.name };
}

async function resolveReferences(
	repository: ServiceRepository,
	input: CreateServiceInput,
) {
	const lookup = {
		findById: repository.findPlaceById,
		findByName: repository.findPlaceByName,
	};

	const [pickup, dropoff, ally, vehicle] = await Promise.all([
		resolveServicePlace({
			serviceType: input.type,
			field: "pickup",
			reference: input.pickup,
			lookup,
		}),
		resolveServicePlace({
			serviceType: input.type,
			field: "dropoff",
			reference: input.dropoff,
			lookup,
		}),
		input.allyId ? repository.findAlly(input.allyId) : null,
		resolveVehicle(repository, input.vehicle),
	]);
	if (input.allyId && !ally)
		throw notFound("ALLY_NOT_FOUND", "Ally was not found");

	return {
		ally,
		fields: {
			pickupId: pickup.id,
			pickupLocationName: pickup.rawName,
			dropoffId: dropoff.id,
			dropoffLocationName: dropoff.rawName,
			allyId: ally?.id ?? null,
			vehicleId: vehicle.id,
			vehicleTypeName: vehicle.rawName,
		},
	};
}

function serviceFields(input: CreateServiceInput) {
	return {
		kindOf: input.type,
		clientName: input.clientName,
		pax: input.passengers,
		luggage: input.luggage ?? null,
		flightCode: input.flightCode || null,
		pickupDisplayName: input.pickupDisplayName || null,
		dropoffDisplayName: input.dropoffDisplayName || null,
		note: input.note,
	};
}

async function getServiceForChange(repository: ServiceRepository, id: string) {
	const current = await repository.findForChange(id);
	if (!current) throw notFound("SERVICE_NOT_FOUND", "Service was not found");
	assertOperationalDateWritable(
		current.itinerary.date.toISOString().slice(0, 10),
	);
	return current;
}

export function createService(input: CreateServiceInput, createdById: string) {
	return withServiceTransaction(async (repository) => {
		const pickupTime = getWritablePickup(input);
		if (input.code)
			await validateServiceCode(repository, input.code, input.type);

		const { ally, fields } = await resolveReferences(repository, input);
		let code = input.code;
		if (!code) {
			if (!ally) {
				throw badRequest(
					"ALLY_REQUIRED",
					"An ally is required when generating a service code",
				);
			}
			code = await generateServiceCode(
				repository,
				ally.name,
				input.itineraryDate,
			);
		}

		const itinerary = await repository.upsertItinerary(
			operationalDateToStorage(input.itineraryDate),
		);
		return repository.create({
			...serviceFields(input),
			...fields,
			code,
			createdById,
			itineraryId: itinerary.id,
			pickupTime,
			originalPickupTime: pickupTime,
		});
	});
}

export function updateService(id: string, input: CreateServiceInput) {
	return withServiceTransaction(async (repository) => {
		const current = await getServiceForChange(repository, id);
		const pickupTime = getWritablePickup(input);
		const code = input.code ?? current.code;
		await validateServiceCode(repository, code, input.type, id);

		const { fields } = await resolveReferences(repository, input);
		const itinerary = await repository.upsertItinerary(
			operationalDateToStorage(input.itineraryDate),
		);
		const differsFromOriginal =
			current.originalPickupTime.getTime() !== pickupTime.getTime();
		const pickupChanged =
			current.pickupTime.getTime() !== pickupTime.getTime();

		return repository.update(id, {
			...serviceFields(input),
			...fields,
			code,
			itineraryId: itinerary.id,
			pickupTime,
			pickupTimeModifiedAt: differsFromOriginal
				? pickupChanged
					? new Date()
					: undefined
				: null,
		});
	});
}

export function deleteService(id: string) {
	return withServiceTransaction(async (repository) => {
		await getServiceForChange(repository, id);
		const deleted = await repository.remove(id);
		return { deletedId: deleted.id };
	});
}
