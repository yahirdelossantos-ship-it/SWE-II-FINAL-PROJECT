"use client";

import { ArrowDownRight, Clock3, History, PlaneLanding } from "lucide-react";
import { type ReactNode, useMemo } from "react";
import { type ItineraryService, useItinerary } from "../api";
import {
	formatOperationalPickupTime,
	formatStoredPickupTime,
} from "../utils/servicePresentation";

function HoursSection({
	title,
	description,
	icon,
	services,
	showOperational = false,
}: {
	title: string;
	description: string;
	icon: ReactNode;
	services: ItineraryService[];
	showOperational?: boolean;
}) {
	return (
		<section className="overflow-hidden rounded-2xl border border-[var(--app-border)]/60 bg-[var(--app-surface)]/45 shadow-sm backdrop-blur-md">
			<div className="flex items-center gap-3 border-b border-[var(--app-border)]/60 px-5 py-4">
				<span className="grid size-10 place-items-center rounded-xl border border-[var(--app-primary)]/20 bg-[var(--app-primary)]/10 text-[var(--app-primary)]">
					{icon}
				</span>
				<div>
					<div className="flex items-baseline gap-2">
						<h2 className="font-semibold">{title}</h2>
						<span className="text-xs text-[var(--app-text-muted)]">
							{services.length}
						</span>
					</div>
					<p className="text-sm text-[var(--app-text-muted)]">
						{description}
					</p>
				</div>
			</div>

			{services.length === 0 ? (
				<p className="px-5 py-8 text-center text-sm text-[var(--app-text-muted)]">
					No hay servicios en esta categoría.
				</p>
			) : (
				<div className="overflow-x-auto">
					<table className="w-full min-w-[620px] text-sm">
						<thead className="bg-[var(--app-surface-muted)]/55 text-left text-xs uppercase tracking-wider text-[var(--app-text-muted)]">
							<tr>
								<th className="px-5 py-3 font-semibold">
									Código
								</th>
								<th className="px-5 py-3 font-semibold">
									Cliente
								</th>
								<th className="px-5 py-3 font-semibold">
									Hora original
								</th>
								<th className="px-5 py-3 font-semibold">
									Hora modificada
								</th>
								{showOperational ? (
									<th className="px-5 py-3 font-semibold">
										Offset −15 min
									</th>
								) : null}
							</tr>
						</thead>
						<tbody>
							{services.map((service) => {
								const original =
									service.originalPickupTime ??
									service.pickupTime;
								const modified =
									Boolean(service.pickupTimeModifiedAt) ||
									new Date(original).getTime() !==
										new Date(service.pickupTime).getTime();
								return (
									<tr
										key={service.id}
										className="border-t border-[var(--app-border)]/55 transition hover:bg-[var(--app-surface-muted)]/45"
										style={{
											boxShadow: `inset 3px 0 ${service.ally?.color ?? "#64748b"}`,
										}}
									>
										<td className="px-5 py-3 font-medium">
											{service.code ?? "—"}
										</td>
										<td className="px-5 py-3">
											{service.clientName}
										</td>
										<td className="px-5 py-3 text-[var(--app-text-muted)]">
											{formatStoredPickupTime(original)}
										</td>
										<td className="px-5 py-3">
											{modified ? (
												<span className="inline-flex items-center gap-2 font-semibold text-emerald-700 dark:text-emerald-300">
													<History className="size-4" />
													{formatStoredPickupTime(
														service.pickupTime,
													)}
												</span>
											) : (
												<span className="text-[var(--app-text-muted)]">
													—
												</span>
											)}
										</td>
										{showOperational ? (
											<td className="px-5 py-3">
												<span className="inline-flex items-center gap-2 font-semibold text-[var(--app-primary)]">
													<ArrowDownRight className="size-4" />
													{formatOperationalPickupTime(
														service,
													)}
												</span>
											</td>
										) : null}
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>
			)}
		</section>
	);
}

export function HoursVisualization({ date }: { date: string }) {
	const itinerary = useItinerary(date);
	const groups = useMemo(() => {
		const services = itinerary.data?.services ?? [];
		return {
			arrivals: services.filter(
				(service) => service.kindOf === "ARRIVAL",
			),
			departures: services.filter(
				(service) => service.kindOf === "DEPARTURE",
			),
			transfers: services.filter(
				(service) => service.kindOf === "TRANSFER",
			),
		};
	}, [itinerary.data?.services]);

	return (
		<div>
			<div className="border-b border-[var(--app-border)] pb-5">
				<h1 className="text-2xl font-semibold">
					Visualización de Horas
				</h1>
				<p className="mt-1 text-sm text-[var(--app-text-muted)]">
					Horarios originales y ajustes operacionales del itinerario.
				</p>
			</div>

			{itinerary.isPending ? (
				<div className="mt-6 space-y-5">
					{Array.from({ length: 3 }, (_, index) => (
						<div
							key={index}
							className="h-48 animate-pulse rounded-2xl bg-[var(--app-surface-muted)]/60"
						/>
					))}
				</div>
			) : itinerary.error ? (
				<p
					role="alert"
					className="mt-6 rounded-xl bg-red-500/10 p-4 text-red-700"
				>
					{itinerary.error.message}
				</p>
			) : (
				<div className="mt-6 space-y-5">
					<HoursSection
						title="Llegadas"
						description="Cambios confirmados respecto a la hora de creación."
						icon={<PlaneLanding className="size-5" />}
						services={groups.arrivals}
					/>
					<HoursSection
						title="Salidas"
						description="Hora operacional adelantada quince minutos."
						icon={<Clock3 className="size-5" />}
						services={groups.departures}
						showOperational
					/>
					<HoursSection
						title="Transferencias"
						description="Hora operacional adelantada quince minutos."
						icon={<Clock3 className="size-5" />}
						services={groups.transfers}
						showOperational
					/>
				</div>
			)}
		</div>
	);
}
