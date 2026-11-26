"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { appApi } from "@/lib/api/client";

export type Option = { id: string; name: string; color?: string | null };
export type PlaceOption = Option & {
	kind: string;
	iata: string | null;
	zoneId: string | null;
};

export type CreateServiceInput = {
	itineraryDate: string;
	code?: string;
	type: "ARRIVAL" | "DEPARTURE" | "TRANSFER";
	clientName: string;
	pickupAt: string;
	passengers: number;
	luggage?: number;
	flightCode?: string;
	pickup: { placeId?: string; name?: string };
	dropoff: { placeId?: string; name?: string };
	pickupDisplayName?: string;
	dropoffDisplayName?: string;
	allyId?: string;
	vehicle?: { vehicleId?: string; name?: string };
	routeId?: string;
	price?: number;
	note?: string;
};

export type ImportRow = Omit<CreateServiceInput, "itineraryDate"> & {
	code: string;
	flightCode?: string;
	errors: string[];
	alreadyExists: boolean;
};

export type ItineraryService = {
	id: string;
	code: string | null;
	kindOf: "ARRIVAL" | "DEPARTURE" | "TRANSFER";
	state: string;
	clientName: string;
	pickupTime: string;
	originalPickupTime: string | null;
	pickupTimeModifiedAt: string | null;
	flightCode: string | null;
	pax: number;
	luggage: number | null;
	pickupLocationName: string | null;
	dropoffLocationName: string | null;
	pickupDisplayName: string | null;
	dropoffDisplayName: string | null;
	vehicleTypeName: string | null;
	ally: { id: string; name: string; color: string | null } | null;
	vehicle: { id: string; name: string } | null;
	pickup: PlaceOption | null;
	dropoff: PlaceOption | null;
	note: string;
};

/** Get a catalog of all DB-dependant fields  **/
export function useCreationOptions() {
	return useQuery({
		queryKey: ["creation-options"],
		queryFn: async () => {
			const [allies, places, airports, vehicles] = await Promise.all([
				appApi<{ items: Option[] }>("/catalog/allies"),
				appApi<{ items: PlaceOption[] }>("/catalog/places"),
				appApi<{ items: PlaceOption[] }>(
					"/catalog/places?kind=AIRPORT&limit=200",
				),
				appApi<{ items: Option[] }>("/catalog/vehicles"),
			]);
			return {
				allies: allies.items,
				places: places.items,
				airports: airports.items,
				vehicles: vehicles.items,
			};
		},
	});
}

export function usePlaceOptions(search: string, kind?: "AIRPORT") {
	return useQuery({
		queryKey: ["place-options", search, kind],
		queryFn: () => {
			const params = new URLSearchParams({ search, limit: "100" });
			if (kind) params.set("kind", kind);
			return appApi<{ items: PlaceOption[] }>(
				`/catalog/places?${params.toString()}`,
			);
		},
		enabled: search.trim().length > 0,
		staleTime: 60_000,
	});
}
export function useItinerary(date: string) {
	return useQuery({
		queryKey: ["itinerary", date],
		queryFn: () =>
			appApi<{
				date: string;
				itinerary: { id: string } | null;
				services: ItineraryService[];
			}>(`/itineraries/${date}`),
	});
}

export function useCreateService(date: string) {
	const client = useQueryClient();
	return useMutation({
		mutationFn: (input: CreateServiceInput) =>
			appApi<{ service: { id: string } }>("/services", {
				method: "POST",
				body: JSON.stringify(input),
			}),
		onSuccess: () =>
			Promise.all([
				client.invalidateQueries({ queryKey: ["itinerary", date] }),
				client.invalidateQueries({ queryKey: ["itinerary-calendar"] }),
			]),
	});
}

export function useUpdateService(date: string) {
	const client = useQueryClient();
	return useMutation({
		mutationFn: ({
			id,
			input,
		}: {
			id: string;
			input: CreateServiceInput;
		}) =>
			appApi(`/services/${id}`, {
				method: "PUT",
				body: JSON.stringify(input),
			}),
		onSuccess: () =>
			Promise.all([
				client.invalidateQueries({ queryKey: ["itinerary", date] }),
				client.invalidateQueries({ queryKey: ["itinerary-calendar"] }),
			]),
	});
}

export function useDeleteService(date: string) {
	const client = useQueryClient();
	return useMutation({
		mutationFn: (id: string) =>
			appApi<{ deletedId: string }>(`/services/${id}`, {
				method: "DELETE",
			}),
		onSuccess: () =>
			Promise.all([
				client.invalidateQueries({ queryKey: ["itinerary", date] }),
				client.invalidateQueries({ queryKey: ["itinerary-calendar"] }),
			]),
	});
}

export async function markExistingImportRows(rows: ImportRow[]) {
	const result = await appApi<{
		existingServices: Array<{
			code: string;
			type: CreateServiceInput["type"];
		}>;
	}>("/imports/preflight", {
		method: "POST",
		body: JSON.stringify({
			services: rows
				.filter((row) => Boolean(row.code))
				.map((row) => ({ code: row.code, type: row.type })),
		}),
	});
	const identity = (row: Pick<ImportRow, "code" | "type">) =>
		`${row.code}\u0000${row.type}`;
	const existing = new Set(
		result.existingServices.map((row) => identity(row)),
	);
	const batchServices = new Set<string>();
	return rows.map((row) => {
		const key = identity(row);
		const repeatedInFile = batchServices.has(key);
		if (row.code) batchServices.add(key);
		return {
			...row,
			alreadyExists: existing.has(key) || repeatedInFile,
			errors: repeatedInFile
				? [...row.errors, "Código repetido dentro del archivo"]
				: row.errors,
		};
	});
}

export function useSaveImport(date: string) {
	const client = useQueryClient();
	return useMutation({
		mutationFn: async ({
			rows,
			allyId,
		}: {
			rows: ImportRow[];
			allyId: string;
		}) => {
			let created = 0;
			let skipped = 0;
			const errors: string[] = [];
			for (const row of rows) {
				if (row.alreadyExists) {
					skipped += 1;
					continue;
				}
				if (row.errors.length) {
					errors.push(
						`${row.code || "Sin código"}: ${row.errors.join(", ")}`,
					);
					continue;
				}
				try {
					await appApi("/imports/services", {
						method: "POST",
						body: JSON.stringify({
							...row,
							itineraryDate: date,
							allyId,
						}),
					});
					created += 1;
				} catch (error) {
					const message =
						error instanceof Error
							? error.message
							: "No se pudo guardar";
					if (
						message.includes("already exists") ||
						message.includes("ya existe")
					)
						skipped += 1;
					else errors.push(`${row.code}: ${message}`);
				}
			}
			return { created, skipped, errors };
		},
		onSuccess: () =>
			Promise.all([
				client.invalidateQueries({ queryKey: ["itinerary", date] }),
				client.invalidateQueries({ queryKey: ["itinerary-calendar"] }),
			]),
	});
}
