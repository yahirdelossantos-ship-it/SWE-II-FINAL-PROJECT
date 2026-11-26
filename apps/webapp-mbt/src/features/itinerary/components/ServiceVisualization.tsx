"use client";
import * as Popover from "@radix-ui/react-popover";
import { Check, Copy, MapPinned, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import {
	Card,
	ContentSkeleton,
	EmptyState,
	ErrorState,
	PageHeader,
	fieldClass,
} from "@/components/ui";
import { type ItineraryService, useItinerary } from "../api";
import { ServiceEditDialog } from "./ServiceEditDialog";
import { ServiceDetailDialog } from "./ServiceDetailDialog";
import { CreateServiceForm } from "./CreateServiceForm";
import {
	formatOperationalPickupTime,
	operationalPickupTime,
	serviceDocumentPlaceName,
} from "../utils/servicePresentation";
import { isOperationalDateWritable } from "../date";

const typeLabels = {
	ARRIVAL: "Llegada",
	DEPARTURE: "Salida",
	TRANSFER: "Traslado",
} as const;
export function ServiceVisualization({ date }: { date: string }) {
	const itinerary = useItinerary(date);
	const [search, setSearch] = useState("");
	const [type, setType] = useState("ALL");
	const [ally, setAlly] = useState("ALL");
	const [order, setOrder] = useState<"earliest" | "latest" | "name">(
		"earliest",
	);
	const [copyState, setCopyState] = useState<"csv" | "text" | "error" | null>(
		null,
	);
	const [copiedServiceId, setCopiedServiceId] = useState<string | null>(null);
	const [editing, setEditing] = useState<ItineraryService | null>(null);
	const [selected, setSelected] = useState<ItineraryService | null>(null);
	const services = useMemo(
		() => itinerary.data?.services ?? [],
		[itinerary.data?.services],
	);
	const allies = useMemo(() => {
		const present = new Map<
			string,
			NonNullable<ItineraryService["ally"]>
		>();
		services.forEach((service) => {
			if (service.ally) present.set(service.ally.id, service.ally);
		});
		return [...present.values()].sort((left, right) =>
			left.name.localeCompare(right.name, "es"),
		);
	}, [services]);
	const filtered = useMemo(() => {
		const matches = services.filter((service) => {
			const term = search.trim().toLowerCase();
			const serviceTime = formatOperationalPickupTime(service);
			const matchesSearch =
				!term ||
				[
					service.code,
					service.clientName,
					service.flightCode,
					service.pickup?.name ?? service.pickupLocationName,
					service.dropoff?.name ?? service.dropoffLocationName,
					serviceTime,
				].some((value) => value?.toLowerCase().includes(term));
			return (
				matchesSearch &&
				(type === "ALL" || service.kindOf === type) &&
				(ally === "ALL" || service.ally?.id === ally)
			);
		});
		return matches.sort((left, right) => {
			if (order === "name")
				return left.clientName.localeCompare(right.clientName, "es");
			const difference =
				operationalPickupTime(left).getTime() -
				operationalPickupTime(right).getTime();
			return order === "earliest" ? difference : -difference;
		});
	}, [ally, order, search, services, type]);

	function csvContent(selectedServices = filtered) {
		const quote = (value: unknown) =>
			`"${String(value ?? "").replace(/"/g, '""')}"`;
		const rows = [
			[
				"Código",
				"Cliente",
				"Hora",
				"Tipo",
				"PAX",
				"Vuelo",
				"Recogida",
				"Destino",
				"Aliado",
				"Vehículo",
			],
			...selectedServices.map((service) => [
				service.code,
				service.clientName,
				formatOperationalPickupTime(service),
				typeLabels[service.kindOf],
				service.pax,
				service.flightCode,
				serviceDocumentPlaceName(service, "pickup"),
				serviceDocumentPlaceName(service, "dropoff"),
				service.ally?.name,
				service.vehicle?.name ?? service.vehicleTypeName,
			]),
		];
		return rows.map((row) => row.map(quote).join(",")).join("\r\n");
	}

	async function copyServices(
		format: "csv" | "text",
		selectedServices = filtered,
		singleServiceId?: string,
	) {
		const text =
			format === "csv"
				? csvContent(selectedServices)
				: selectedServices
						.map((service, index) => {
							const values = [
								["Servicio", index + 1],
								["Código", service.code ?? "—"],
								["Cliente", service.clientName],
								["Hora", formatOperationalPickupTime(service)],
								["Tipo", typeLabels[service.kindOf]],
								["PAX", service.pax],
								["Vuelo", service.flightCode ?? "—"],
								[
									"Desde",
									serviceDocumentPlaceName(
										service,
										"pickup",
									) || "—",
								],
								[
									"Hasta",
									serviceDocumentPlaceName(
										service,
										"dropoff",
									) || "—",
								],
							];
							return values
								.map(([label, value]) => `${label}: ${value}`)
								.join("\n");
						})
						.join("\n\n");
		try {
			await navigator.clipboard.writeText(text);
			if (singleServiceId) setCopiedServiceId(singleServiceId);
			else setCopyState(format);
		} catch {
			if (!singleServiceId) setCopyState("error");
		}
		window.setTimeout(() => {
			setCopyState(null);
			setCopiedServiceId(null);
		}, 1800);
	}

	return (
		<section>
			<PageHeader
				title="Itinerario"
				description={`${filtered.length} de ${services.length} servicios`}
			>
				<Popover.Root>
					<Popover.Trigger asChild>
						<Button
							className="w-auto"
							size="sm"
							variant="outline"
							icon={
								copyState && copyState !== "error" ? (
									<Check />
								) : (
									<Copy />
								)
							}
							disabled={!filtered.length}
						>
							{copyState === "error"
								? "No se pudo copiar"
								: copyState
									? "Copiado"
									: "Copiar"}
						</Button>
					</Popover.Trigger>
					<Popover.Portal>
						<Popover.Content
							align="end"
							sideOffset={7}
							className="z-40 w-56 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)]/90 p-2 shadow-2xl backdrop-blur-xl"
						>
							<button
								type="button"
								onClick={() => copyServices("text")}
								className="w-full rounded-lg px-3 py-2 text-left text-sm transition hover:bg-[var(--app-surface-muted)]"
							>
								Formato legible
							</button>
							<button
								type="button"
								onClick={() => copyServices("csv")}
								className="w-full rounded-lg px-3 py-2 text-left text-sm transition hover:bg-[var(--app-surface-muted)]"
							>
								Formato CSV
							</button>
							<Popover.Arrow className="fill-[var(--app-surface)]" />
						</Popover.Content>
					</Popover.Portal>
				</Popover.Root>
				{isOperationalDateWritable(date) && (
					<CreateServiceForm key={date} date={date} />
				)}
			</PageHeader>
			<Card padding="sm" className="my-5 flex flex-col gap-3 md:flex-row">
				<label className="relative flex-1">
					<Search className="pointer-events-none absolute left-3 top-3 size-4 text-[var(--app-text-muted)]" />
					<input
						value={search}
						onChange={(event) => setSearch(event.target.value)}
						placeholder="Buscar hora, nombre, código, vuelo o lugar"
						className={`${fieldClass} w-full pl-9`}
					/>
				</label>
				<select
					value={type}
					onChange={(event) => setType(event.target.value)}
					className={fieldClass}
				>
					<option value="ALL">Todos los tipos</option>
					<option value="ARRIVAL">Llegadas</option>
					<option value="DEPARTURE">Salidas</option>
					<option value="TRANSFER">Traslados</option>
				</select>
				<select
					value={ally}
					onChange={(event) => setAlly(event.target.value)}
					className={fieldClass}
				>
					<option value="ALL">Todos los aliados</option>
					{allies.map((item) => (
						<option key={item.id} value={item.id}>
							{item.name}
						</option>
					))}
				</select>
				<select
					value={order}
					onChange={(event) =>
						setOrder(event.target.value as typeof order)
					}
					className={fieldClass}
				>
					<option value="earliest">Más temprano</option>
					<option value="latest">Más tarde</option>
					<option value="name">Nombre</option>
				</select>
			</Card>
			{itinerary.isPending ? (
				<ContentSkeleton rows={6} className="grid-cols-1" />
			) : itinerary.error ? (
				<ErrorState error={itinerary.error} />
			) : filtered.length === 0 ? (
				<EmptyState>
					No hay servicios que coincidan con estos filtros.
				</EmptyState>
			) : (
				<div className="overflow-x-auto rounded-2xl border border-[var(--app-border)]">
					<table className="w-full min-w-[920px] text-sm">
						<thead className="bg-[var(--app-surface-muted)] text-left">
							<tr>
								{[
									"#",
									"Hora",
									"Código",
									"Cliente",
									"Tipo",
									"PAX",
									"Vuelo",
									"Ruta",
									"Aliado",
									"Vehículo",
									"Copiar",
								].map((label) => (
									<th
										key={label}
										className="p-3 font-semibold"
									>
										{label}
									</th>
								))}
							</tr>
						</thead>
						<tbody>
							{filtered.map((service, index) => {
								const color = service.ally?.color ?? "#64748b";
								return (
									<tr
										key={service.id}
										tabIndex={0}
										onClick={() => setSelected(service)}
										onKeyDown={(event) => {
											if (
												event.key === "Enter" ||
												event.key === " "
											)
												setSelected(service);
										}}
										className="cursor-pointer border-t border-[var(--app-border)] transition hover:bg-[var(--app-surface-muted)] focus:bg-[var(--app-surface-muted)] focus:outline-none"
										style={{
											boxShadow: `inset 4px 0 ${color}`,
										}}
									>
										<td className="p-3 text-center">
											<span
												className="inline-grid size-8 place-items-center rounded-full border text-xs font-bold"
												style={{
													color,
													borderColor: `${color}66`,
													backgroundColor: `${color}18`,
												}}
											>
												{index + 1}
											</span>
										</td>
										<td className="whitespace-nowrap p-3 font-semibold">
											{formatOperationalPickupTime(
												service,
											)}
										</td>
										<td className="p-3">
											{service.code ?? "—"}
										</td>
										<td className="p-3 font-medium">
											{service.clientName}
										</td>
										<td className="p-3">
											{typeLabels[service.kindOf]}
										</td>
										<td className="p-3">{service.pax}</td>
										<td className="p-3">
											{service.flightCode ?? "—"}
										</td>
										<td className="p-3 text-center">
											<Popover.Root>
												<Popover.Trigger
													onClick={(event) =>
														event.stopPropagation()
													}
													className="rounded-full border border-[var(--app-border)] bg-[var(--app-surface)] p-2 text-[var(--app-text-muted)] hover:text-[var(--app-primary)]"
													aria-label="Ver ruta"
												>
													<MapPinned className="size-4" />
												</Popover.Trigger>
												<Popover.Portal>
													<Popover.Content
														sideOffset={7}
														onClick={(event) =>
															event.stopPropagation()
														}
														className="z-40 w-72 rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-4 shadow-2xl"
													>
														<p className="text-xs font-semibold uppercase tracking-wider text-[var(--app-text-muted)]">
															Ruta del servicio
														</p>
														<div className="mt-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-3 text-sm">
															<span className="font-semibold text-emerald-600">
																Desde
															</span>
															<span>
																{service.pickup
																	?.name ??
																	service.pickupLocationName ??
																	"—"}
															</span>
															<span className="font-semibold text-rose-600">
																Hasta
															</span>
															<span>
																{service.dropoff
																	?.name ??
																	service.dropoffLocationName ??
																	"—"}
															</span>
														</div>
														<Popover.Arrow className="fill-[var(--app-surface)]" />
													</Popover.Content>
												</Popover.Portal>
											</Popover.Root>
										</td>
										<td className="p-3">
											{service.ally ? (
												<span
													className="inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold"
													style={{
														color,
														borderColor: `${color}66`,
														backgroundColor: `${color}18`,
													}}
												>
													{service.ally.name}
												</span>
											) : (
												"—"
											)}
										</td>
										<td className="p-3">
											{service.vehicle?.name ??
												service.vehicleTypeName ??
												"—"}
										</td>
										<td className="p-3 text-center">
											<Popover.Root>
												<Popover.Trigger
													onClick={(event) =>
														event.stopPropagation()
													}
													className="rounded-full border border-[var(--app-border)] bg-[var(--app-surface)]/60 p-2 text-[var(--app-text-muted)] transition hover:border-[var(--app-primary)]/35 hover:text-[var(--app-primary)]"
													aria-label={`Copiar información de ${service.clientName}`}
												>
													{copiedServiceId ===
													service.id ? (
														<Check className="size-4 text-emerald-600" />
													) : (
														<Copy className="size-4" />
													)}
												</Popover.Trigger>
												<Popover.Portal>
													<Popover.Content
														align="end"
														sideOffset={7}
														onClick={(event) =>
															event.stopPropagation()
														}
														className="z-40 w-56 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)]/90 p-2 shadow-2xl backdrop-blur-xl"
													>
														<button
															type="button"
															onClick={() =>
																copyServices(
																	"text",
																	[service],
																	service.id,
																)
															}
															className="w-full rounded-lg px-3 py-2 text-left text-sm transition hover:bg-[var(--app-surface-muted)]"
														>
															Formato legible
														</button>
														<button
															type="button"
															onClick={() =>
																copyServices(
																	"csv",
																	[service],
																	service.id,
																)
															}
															className="w-full rounded-lg px-3 py-2 text-left text-sm transition hover:bg-[var(--app-surface-muted)]"
														>
															Formato CSV
														</button>
														<Popover.Arrow className="fill-[var(--app-surface)]" />
													</Popover.Content>
												</Popover.Portal>
											</Popover.Root>
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>
			)}
			<ServiceEditDialog
				key={editing?.id ?? "closed"}
				service={editing}
				date={date}
				onClose={() => setEditing(null)}
			/>
			<ServiceDetailDialog
				service={selected}
				editable={isOperationalDateWritable(date)}
				onClose={() => setSelected(null)}
				onEdit={(service) => {
					setSelected(null);
					setEditing(service);
				}}
			/>
		</section>
	);
}
