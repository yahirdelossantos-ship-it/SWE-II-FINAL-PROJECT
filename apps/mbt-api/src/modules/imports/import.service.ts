import {
	normalizeImportedServiceAirport,
	selectPuntaCanaAirportPlaceId,
} from "../../routes/v2/core/import-service";
import type { CreateServiceInput } from "../services/service.schema";
import { createService } from "../services/service.service";

import {
	findPuntaCanaAirports,
	findServicesByCodes,
} from "./import.repository";

type ImportIdentity = { code: string; type: CreateServiceInput["type"] };

function importKey({ code, type }: ImportIdentity) {
	return `${code}\u0000${type}`;
}

export async function importService(
	input: CreateServiceInput,
	employeeId: string,
) {
	if (input.type === "TRANSFER") return createService(input, employeeId);

	const airportId = selectPuntaCanaAirportPlaceId(
		await findPuntaCanaAirports(),
	);
	return createService(
		normalizeImportedServiceAirport(input, airportId),
		employeeId,
	);
}

export async function findExistingImports(services: ImportIdentity[]) {
	const codes = [...new Set(services.map(({ code }) => code))];
	const requested = new Set(services.map(importKey));
	const existing = await findServicesByCodes(codes);

	return existing
		.map(({ code, kindOf }) => ({ code, type: kindOf }))
		.filter((service) => requested.has(importKey(service)));
}
