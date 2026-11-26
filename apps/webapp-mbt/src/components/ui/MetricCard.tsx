import type { LucideIcon } from "lucide-react";

import { Card } from "./Card";

export function MetricCard({
	label,
	value,
	note,
	icon: Icon,
	tone,
}: {
	label: string;
	value: string | number;
	note?: string;
	icon: LucideIcon;
	tone: string;
}) {
	return (
		<Card>
			<div className="flex items-start justify-between gap-3">
				<div>
					<p className="text-sm text-[var(--app-text-muted)]">
						{label}
					</p>
					<p className="mt-2 text-3xl font-semibold tracking-tight">
						{value}
					</p>
					{note ? (
						<p className="mt-2 text-xs text-[var(--app-text-muted)]">
							{note}
						</p>
					) : null}
				</div>
				<span
					className="rounded-2xl p-3"
					style={{ color: tone, backgroundColor: `${tone}18` }}
				>
					<Icon className="size-5" />
				</span>
			</div>
		</Card>
	);
}

export function StatsAside({
	items,
}: {
	items: Array<{
		label: string;
		value: number;
		icon: LucideIcon;
		tone: string;
	}>;
}) {
	const maximum = Math.max(...items.map((item) => item.value), 1);
	return (
		<Card className="space-y-3 xl:sticky xl:top-0" padding="sm">
			<p className="px-1 text-xs font-semibold uppercase tracking-wider text-[var(--app-text-muted)]">
				Resumen
			</p>
			{items.map(({ label, value, icon: Icon, tone }) => (
				<div
					key={label}
					className="rounded-xl bg-[var(--app-surface)]/55 p-3"
				>
					<div className="flex items-center justify-between gap-3">
						<span className="flex items-center gap-2 text-sm text-[var(--app-text-muted)]">
							<Icon className="size-4" style={{ color: tone }} />{" "}
							{label}
						</span>
						<strong>{value}</strong>
					</div>
					<div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[var(--app-surface-muted)]">
						<div
							className="h-full origin-left animate-[database-bar_500ms_ease-out] rounded-full"
							style={{
								width: `${Math.max((value / maximum) * 100, value ? 4 : 0)}%`,
								backgroundColor: tone,
							}}
						/>
					</div>
				</div>
			))}
		</Card>
	);
}
