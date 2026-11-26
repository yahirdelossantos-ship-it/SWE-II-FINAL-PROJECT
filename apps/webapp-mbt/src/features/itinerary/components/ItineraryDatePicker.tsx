"use client";
import * as Popover from "@radix-ui/react-popover";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { appApi } from "@/lib/api/client";
import { cn } from "@/utils/cn";
import { localDate, validOperationalDate, ymd } from "../date";

const weekdays = ["L", "M", "M", "J", "V", "S", "D"];

export function ItineraryDatePicker() {
	const pathname = usePathname();
	const search = useSearchParams();
	const router = useRouter();
	const date = validOperationalDate(search.get("date"));
	const selected = localDate(date);
	const [month, setMonth] = useState(
		() => new Date(selected.getFullYear(), selected.getMonth(), 1),
	);
	const grid = useMemo(() => {
		const first = new Date(month);
		first.setDate(first.getDate() - ((first.getDay() + 6) % 7));
		return Array.from({ length: 42 }, (_, index) => {
			const day = new Date(first);
			day.setDate(first.getDate() + index);
			return day;
		});
	}, [month]);
	const startDate = ymd(grid[0]);
	const endDate = ymd(grid[41]);
	const counts = useQuery({
		queryKey: ["itinerary-calendar", startDate, endDate],
		queryFn: () =>
			appApi<{ days: { date: string; serviceCount: number }[] }>(
				`/itineraries/calendar?startDate=${startDate}&endDate=${endDate}`,
			),
	});
	const countByDate = new Map(
		counts.data?.days.map((day) => [day.date, day.serviceCount]),
	);
	const formatted = new Intl.DateTimeFormat("es-DO", {
		weekday: "long",
		month: "long",
		day: "numeric",
	}).format(selected);

	function select(next: Date) {
		const params = new URLSearchParams(search.toString());
		params.set("date", ymd(next));
		router.replace(`${pathname}?${params}`);
	}

	return (
		<Popover.Root>
			<Popover.Trigger className="flex min-w-0 items-center gap-2 rounded-full px-3 py-2 hover:bg-[var(--app-surface-muted)]">
				<CalendarDays className="size-4 shrink-0 text-[var(--app-primary)]" />
				<span className="truncate text-sm font-medium capitalize">
					{formatted}
				</span>
			</Popover.Trigger>
			<Popover.Portal>
				<Popover.Content
					align="center"
					sideOffset={10}
					className="z-50 w-[min(22rem,calc(100vw-1.5rem))] rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)]/90 p-4 shadow-2xl"
				>
					<div className="mb-3 flex items-center justify-between">
						<button
							onClick={() =>
								setMonth(
									new Date(
										month.getFullYear(),
										month.getMonth() - 1,
										1,
									),
								)
							}
							className="rounded-lg p-2 hover:bg-[var(--app-surface-muted)]"
							aria-label="Mes anterior"
						>
							<ChevronLeft className="size-4" />
						</button>
						<strong className="text-sm capitalize">
							{new Intl.DateTimeFormat("es-DO", {
								month: "long",
								year: "numeric",
							}).format(month)}
						</strong>
						<button
							onClick={() =>
								setMonth(
									new Date(
										month.getFullYear(),
										month.getMonth() + 1,
										1,
									),
								)
							}
							className="rounded-lg p-2 hover:bg-[var(--app-surface-muted)]"
							aria-label="Mes siguiente"
						>
							<ChevronRight className="size-4" />
						</button>
					</div>
					<div className="grid grid-cols-7 gap-1 text-center">
						{weekdays.map((day, index) => (
							<span
								key={`${day}-${index}`}
								className="py-1 text-[11px] font-semibold text-[var(--app-text-muted)]"
							>
								{day}
							</span>
						))}
						{grid.map((day) => {
							const value = ymd(day);
							const count = countByDate.get(value) ?? 0;
							return (
								<button
									key={value}
									onClick={() => select(day)}
									className={cn(
										"relative grid min-h-10 place-items-center rounded-xl text-sm hover:bg-[var(--app-surface-muted)]",
										day.getMonth() !== month.getMonth() &&
											"text-[var(--app-text-muted)] opacity-55",
										value === date &&
											"bg-[var(--app-primary)] text-[var(--app-primary-foreground)] hover:bg-[var(--app-primary)]",
									)}
								>
									<span>{day.getDate()}</span>
									{count > 0 && (
										<span
											className={cn(
												"absolute right-0.5 top-0.5 min-w-4 rounded-full bg-emerald-600 px-1 text-[9px] font-bold leading-4 text-white",
												count >= 15 && "bg-orange-500",
												count >= 25 && "bg-rose-600",
											)}
										>
											{count}
										</span>
									)}
								</button>
							);
						})}
					</div>
					<p className="mt-3 text-center text-xs text-[var(--app-text-muted)]">
						Los indicadores muestran servicios por día.
					</p>
				</Popover.Content>
			</Popover.Portal>
		</Popover.Root>
	);
}
