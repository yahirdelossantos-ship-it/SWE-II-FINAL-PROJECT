"use client";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useState } from "react";
import {
	CalendarPlus,
	CalendarRange,
	ChevronDown,
	ChevronLeft,
	Clock3,
	LayoutList,
} from "lucide-react";
import { cn } from "@/utils/cn";

const itinerary = [
	["/app/itinerary/view", "Visualización", LayoutList],
	["/app/itinerary/create", "Importar Sacbé", CalendarPlus],
	["/app/itinerary/hours", "Visualización de Horas", Clock3],
] as const;

export function Sidebar({
	collapsed,
	onCollapse,
	mobile = false,
	onNavigate,
}: {
	collapsed: boolean;
	onCollapse: () => void;
	mobile?: boolean;
	onNavigate?: () => void;
}) {
	const pathname = usePathname();
	const search = useSearchParams();
	const [itineraryOpen, setItineraryOpen] = useState(
		pathname.startsWith("/app/itinerary"),
	);
	const date = search.get("date");
	return (
		<aside
			className={cn(
				"flex h-full flex-col overflow-hidden rounded-2xl bg-[color-mix(in_srgb,var(--app-surface)_64%,transparent)] shadow-xl backdrop-blur transition-[width] duration-300 ease-out",
				collapsed && !mobile ? "w-20" : "w-72",
			)}
		>
			<nav className="flex-1 overflow-y-auto p-3">
				<button
					onClick={() =>
						collapsed && !mobile
							? onCollapse()
							: setItineraryOpen((value) => !value)
					}
					className={cn(
						"flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold hover:bg-[var(--app-surface-muted)]",
						collapsed && !mobile && "justify-center",
					)}
				>
					<CalendarRange className="size-5 shrink-0" />
					{(!collapsed || mobile) && (
						<>
							<span className="flex-1 text-left">Itinerario</span>
							<ChevronDown
								className={cn(
									"size-4 transition-transform duration-200",
									itineraryOpen && "rotate-180",
								)}
							/>
						</>
					)}
				</button>
				<div
					className={cn(
						"grid transition-[grid-template-rows,opacity] duration-300",
						itineraryOpen && (!collapsed || mobile)
							? "grid-rows-[1fr] opacity-100"
							: "grid-rows-[0fr] opacity-0",
					)}
				>
					<div className="ml-5 overflow-hidden border-l border-[var(--app-border)] pl-3 pt-1">
						{itinerary.map(([href, label, Icon]) => (
							<Link
								onClick={onNavigate}
								key={href}
								href={date ? `${href}?date=${date}` : href}
								title={collapsed ? label : undefined}
								className={cn(
									"flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium",
									pathname === href
										? "bg-[var(--app-primary)] text-[var(--app-primary-foreground)]"
										: "hover:bg-[var(--app-surface-muted)]",
								)}
							>
								<Icon className="size-5 shrink-0" />
								<span>{label}</span>
							</Link>
						))}
					</div>
				</div>
			</nav>
			{mobile && (
				<button
					onClick={onNavigate}
					className="m-3 flex items-center gap-2 rounded-xl px-3 py-2 text-sm"
				>
					<ChevronLeft className="size-4" />
					Cerrar
				</button>
			)}
		</aside>
	);
}
