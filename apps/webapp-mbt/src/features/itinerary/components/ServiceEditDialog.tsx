"use client";
import { FormEvent, useState } from "react";
import { Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Dialog } from "@/components/ui/Dialog";
import { useNotifications } from "@/components/notifications";
import {
	type CreateServiceInput,
	type ItineraryService,
	useCreationOptions,
	useDeleteService,
	useUpdateService,
} from "../api";
import {
	airportSelectionOrDefault,
	locationInput,
	type LocationSelection,
} from "../servicePlaces";
import { PlaceCombobox } from "./PlaceCombobox";

const inputClass =
	"h-11 w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] px-3 outline-none focus:ring-2 focus:ring-[var(--app-focus)]";
function timeAtSantoDomingo(value: string) {
	const parts = new Intl.DateTimeFormat("en-CA", {
		timeZone: "America/Santo_Domingo",
		hour: "2-digit",
		minute: "2-digit",
		hourCycle: "h23",
	}).formatToParts(new Date(value));
	return `${parts.find((part) => part.type === "hour")?.value}:${parts.find((part) => part.type === "minute")?.value}`;
}

function initialLocation(
	service: ItineraryService | null,
	side: "pickup" | "dropoff",
): LocationSelection {
	const place = side === "pickup" ? service?.pickup : service?.dropoff;
	if (place) return { id: place.id, name: place.name };
	const rawName =
		side === "pickup"
			? service?.pickupLocationName
			: service?.dropoffLocationName;
	return rawName ? { id: null, name: rawName } : null;
}

export function ServiceEditDialog({
	service,
	date,
	onClose,
}: {
	service: ItineraryService | null;
	date: string;
	onClose: () => void;
}) {
	const options = useCreationOptions();
	const update = useUpdateService(date);
	const remove = useDeleteService(date);
	const [serviceType, setServiceType] = useState<CreateServiceInput["type"]>(
		service?.kindOf ?? "ARRIVAL",
	);
	const [pickupSelection, setPickupSelection] = useState<LocationSelection>(
		() => initialLocation(service, "pickup"),
	);
	const [dropoffSelection, setDropoffSelection] = useState<LocationSelection>(
		() => initialLocation(service, "dropoff"),
	);
	const airports = options.data?.airports ?? [];
	const pickupRequiresAirport = serviceType === "ARRIVAL";
	const dropoffRequiresAirport = serviceType === "DEPARTURE";
	const effectivePickupSelection = pickupRequiresAirport
		? airportSelectionOrDefault(pickupSelection, airports)
		: pickupSelection;
	const effectiveDropoffSelection = dropoffRequiresAirport
		? airportSelectionOrDefault(dropoffSelection, airports)
		: dropoffSelection;

	const notify = useNotifications((state) => state.addNotification);

	if (!service) return null;

	async function submit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const form = new FormData(event.currentTarget);
		const pickup = locationInput(effectivePickupSelection);
		const dropoff = locationInput(effectiveDropoffSelection);

		if (!pickup || !dropoff) {
			notify({
				type: "warning",
				title: "Falta de Lugares",
				message: "Selecciona los lugares de recogida y destino.",
			});
			return;
		}

		try {
			await update.mutateAsync({
				id: service!.id,
				input: {
					itineraryDate: date,
					code: String(form.get("code")) || undefined,
					type: serviceType,
					clientName: String(form.get("clientName")),
					pickupAt: `${date}T${String(form.get("time"))}:00-04:00`,
					flightCode: String(form.get("flightCode")) || undefined,
					passengers: Number(form.get("passengers")),
					luggage: String(form.get("luggage"))
						? Number(form.get("luggage"))
						: undefined,
					pickup,
					dropoff,
					pickupDisplayName:
						String(form.get("pickupDisplayName")).trim() ||
						undefined,
					dropoffDisplayName:
						String(form.get("dropoffDisplayName")).trim() ||
						undefined,
					allyId: String(form.get("allyId")) || undefined,
					vehicle: String(form.get("vehicleId"))
						? { vehicleId: String(form.get("vehicleId")) }
						: undefined,
					note: String(form.get("note")),
				},
			});
			notify({
				type: "success",
				title: "Campos actualizados",
			});
			onClose();
		} catch (error) {
			const msj =
				error instanceof Error
					? error.message
					: "No se pudo actualizar el servicio.";

			notify({
				type: "error",
				title: "No se pudo editar el servicio",
				message: msj,
			});
			onClose();
		}
	}
	async function deleteService() {
		try {
			await remove.mutateAsync(service!.id);
			onClose();
		} catch (error) {
			const msj =
				error instanceof Error
					? error.message
					: "No se pudo eliminar el servicio.";

			notify({
				type: "error",
				title: "No se pudo eliminar el servicio",
				message: msj,
			});
		}
	}
	return (
		<Dialog
			open
			onOpenChange={(open) => !open && onClose()}
			title="Editar servicio"
			description={`${service.code ?? service.clientName} · ${date}`}
			size="xl"
		>
			<form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
				<label className="space-y-1 text-sm">
					<span>Código</span>
					<input
						name="code"
						defaultValue={service.code ?? ""}
						className={inputClass}
					/>
				</label>
				<label className="space-y-1 text-sm">
					<span>Aliado</span>
					<select
						name="allyId"
						defaultValue={service.ally?.id ?? ""}
						className={inputClass}
					>
						<option value="">Sin aliado</option>
						{options.data?.allies.map((item) => (
							<option key={item.id} value={item.id}>
								{item.name}
							</option>
						))}
					</select>
				</label>
				<label className="space-y-1 text-sm">
					<span>Cliente</span>
					<input
						name="clientName"
						required
						defaultValue={service.clientName}
						className={inputClass}
					/>
				</label>
				<label className="space-y-1 text-sm">
					<span>Tipo</span>
					<select
						name="type"
						value={serviceType}
						onChange={(event) =>
							setServiceType(
								event.target
									.value as CreateServiceInput["type"],
							)
						}
						className={inputClass}
					>
						<option value="ARRIVAL">Llegada</option>
						<option value="DEPARTURE">Salida</option>
						<option value="TRANSFER">Traslado</option>
					</select>
				</label>
				<label className="space-y-1 text-sm">
					<span>Hora</span>
					<input
						name="time"
						type="time"
						required
						defaultValue={timeAtSantoDomingo(service.pickupTime)}
						className={inputClass}
					/>
				</label>
				<label className="space-y-1 text-sm">
					<span>Vuelo</span>
					<input
						name="flightCode"
						defaultValue={service.flightCode ?? ""}
						className={inputClass}
					/>
				</label>
				<label className="space-y-1 text-sm">
					<span>Pasajeros</span>
					<input
						name="passengers"
						type="number"
						min="1"
						required
						defaultValue={service.pax}
						className={inputClass}
					/>
				</label>
				<label className="space-y-1 text-sm">
					<span>Equipaje</span>
					<input
						name="luggage"
						type="number"
						min="0"
						defaultValue={service.luggage ?? ""}
						className={inputClass}
					/>
				</label>
				<PlaceCombobox
					name="pickup"
					label="Recogida"
					places={
						pickupRequiresAirport
							? airports
							: (options.data?.places ?? [])
					}
					value={effectivePickupSelection}
					placeKind={pickupRequiresAirport ? "AIRPORT" : undefined}
					allowCustomValue={!pickupRequiresAirport}
					onSelectionChange={setPickupSelection}
				/>
				<PlaceCombobox
					name="dropoff"
					label="Destino"
					places={
						dropoffRequiresAirport
							? airports
							: (options.data?.places ?? [])
					}
					value={effectiveDropoffSelection}
					placeKind={dropoffRequiresAirport ? "AIRPORT" : undefined}
					allowCustomValue={!dropoffRequiresAirport}
					onSelectionChange={setDropoffSelection}
				/>
				<label className="space-y-1 text-sm">
					<span>Nombre para documentos — Recogida</span>
					<input
						name="pickupDisplayName"
						maxLength={160}
						defaultValue={service.pickupDisplayName ?? ""}
						className={inputClass}
						placeholder="Opcional"
					/>
				</label>
				<label className="space-y-1 text-sm">
					<span>Nombre para documentos — Destino</span>
					<input
						name="dropoffDisplayName"
						maxLength={160}
						defaultValue={service.dropoffDisplayName ?? ""}
						className={inputClass}
						placeholder="Opcional"
					/>
				</label>
				<label className="space-y-1 text-sm sm:col-span-2">
					<span>Vehículo</span>
					<select
						name="vehicleId"
						defaultValue={service.vehicle?.id ?? ""}
						className={inputClass}
					>
						<option value="">Sin asignar</option>
						{options.data?.vehicles.map((item) => (
							<option key={item.id} value={item.id}>
								{item.name}
							</option>
						))}
					</select>
				</label>
				<label className="space-y-1 text-sm sm:col-span-2">
					<span>Nota</span>
					<textarea
						name="note"
						defaultValue={service.note}
						className={inputClass}
					/>
				</label>

				<div className="flex flex-col-reverse gap-3 sm:col-span-2 sm:flex-row sm:justify-between">
					<ConfirmDialog
						trigger={
							<Button
								type="button"
								className="w-auto"
								variant="dangerOutline"
								icon={<Trash2 />}
							>
								Eliminar
							</Button>
						}
						title="Eliminar servicio"
						description={`Se eliminará ${service.code ?? service.clientName} del itinerario. Esta acción no se puede deshacer.`}
						confirmLabel="Eliminar servicio"
						pending={remove.isPending}
						onConfirm={deleteService}
					/>
					<Button
						type="submit"
						className="w-auto"
						variant="primary"
						icon={<Save />}
						isLoading={update.isPending}
					>
						Guardar cambios
					</Button>
				</div>
			</form>
		</Dialog>
	);
}
