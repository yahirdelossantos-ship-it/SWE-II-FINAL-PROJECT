"use client";

import {
	CalendarClock,
	Car,
	MapPinned,
	Pencil,
	Plane,
	Users,
} from "lucide-react";

import { Button, Card, Dialog } from "@/components/ui";
import type { ItineraryService } from "../api";

const typeLabels = {
	ARRIVAL: "Llegada",
	DEPARTURE: "Salida",
	TRANSFER: "Traslado",
};

function Detail({ label, value }: { label: string; value: React.ReactNode }) {
	return (
		<div className="rounded-xl bg-[var(--app-surface-muted)]/55 p-3">
			<p className="text-xs font-semibold uppercase tracking-wide text-[var(--app-text-muted)]">
				{label}
			</p>
			<div className="mt-1 text-sm font-medium">{value || "—"}</div>
		</div>
	);
}

export function ServiceDetailDialog({
	service,
	onClose,
	onEdit,
	editable = true,
}: {
	service: ItineraryService | null;
	onClose: () => void;
	onEdit: (service: ItineraryService) => void;
	editable?: boolean;
}) {
	if (!service) return null;
	const pickup = service.pickup?.name ?? service.pickupLocationName ?? "—";
	const dropoff = service.dropoff?.name ?? service.dropoffLocationName ?? "—";
	return (
		<Dialog
			open
			onOpenChange={(open) => !open && onClose()}
			title="Detalles del servicio"
			description={service.code ?? service.clientName}
			size="lg"
		>
			<div className="space-y-4">
				<div className="flex flex-wrap items-center justify-between gap-3">
					<span className="rounded-full bg-[var(--app-primary)]/10 px-3 py-1.5 text-sm font-semibold text-[var(--app-primary)]">
						{typeLabels[service.kindOf]}
					</span>
					<Button
						size="sm"
						className="w-auto"
						variant="primary"
						icon={<Pencil className="size-4" />}
						onClick={() => onEdit(service)}
						disabled={!editable}
						title={
							editable
								? undefined
								: "Este itinerario ya no se puede editar"
						}
					>
						Editar
					</Button>
				</div>
				<Card padding="sm">
					<div className="mb-3 flex items-center gap-2 font-semibold">
						<Users className="size-4 text-[var(--app-primary)]" />{" "}
						Cliente
					</div>
					<div className="grid gap-2 sm:grid-cols-3">
						<Detail label="Nombre" value={service.clientName} />
						<Detail label="Pasajeros" value={service.pax} />
						<Detail
							label="Equipaje"
							value={service.luggage ?? "—"}
						/>
					</div>
				</Card>
				<Card padding="sm">
					<div className="mb-3 flex items-center gap-2 font-semibold">
						<CalendarClock className="size-4 text-[var(--app-primary)]" />{" "}
						Servicio
					</div>
					<div className="grid gap-2 sm:grid-cols-3">
						<Detail
							label="Fecha y hora"
							value={new Date(service.pickupTime).toLocaleString(
								"es-DO",
								{
									timeZone: "America/Santo_Domingo",
								},
							)}
						/>
						<Detail
							label="Aliado"
							value={service.ally?.name ?? "—"}
						/>
						<Detail
							label="Vehículo"
							value={
								service.vehicle?.name ??
								service.vehicleTypeName ??
								"—"
							}
						/>
					</div>
				</Card>
				<Card padding="sm">
					<div className="mb-3 flex items-center gap-2 font-semibold">
						<MapPinned className="size-4 text-[var(--app-primary)]" />{" "}
						Ruta
					</div>
					<div className="grid gap-2 sm:grid-cols-2">
						<Detail label="Desde" value={pickup} />
						<Detail label="Hasta" value={dropoff} />
					</div>
				</Card>
				<div className="grid gap-2 sm:grid-cols-2">
					<Detail
						label="Vuelo"
						value={
							service.flightCode ? (
								<span className="inline-flex items-center gap-2">
									<Plane className="size-4" />{" "}
									{service.flightCode}
								</span>
							) : (
								"—"
							)
						}
					/>
					<Detail
						label="Asignación"
						value={
							<span className="inline-flex items-center gap-2">
								<Car className="size-4" />
								{service.vehicle?.name ??
									service.vehicleTypeName ??
									"Sin asignar"}
							</span>
						}
					/>
				</div>
				{service.note ? (
					<Card padding="sm">
						<h3 className="font-semibold">Nota</h3>
						<div className="mt-2 space-y-2 text-sm text-[var(--app-text-muted)]">
							{service.note}
						</div>
					</Card>
				) : null}
			</div>
		</Dialog>
	);
}
