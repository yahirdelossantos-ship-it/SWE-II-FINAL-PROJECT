import type { ReactNode } from "react";

import { cn } from "@/utils/cn";

export function PageSection({
	title,
	description,
	actions,
	filters,
	children,
	className,
}: {
	title: string;
	description?: ReactNode;
	actions?: ReactNode;
	filters?: ReactNode;
	children: ReactNode;
	className?: string;
}) {
	return (
		<section className={cn("min-w-0", className)}>
			<header className="mb-5 border-b border-[var(--app-border)]/75 pb-5">
				<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
					<div className="min-w-0">
						<h1 className="text-2xl font-semibold tracking-tight">
							{title}
						</h1>
						{description ? (
							<div className="mt-1 text-sm text-[var(--app-text-muted)]">
								{description}
							</div>
						) : null}
					</div>
					{actions ? (
						<div className="flex shrink-0 flex-wrap items-center gap-2">
							{actions}
						</div>
					) : null}
				</div>
				{filters ? <div className="mt-4">{filters}</div> : null}
			</header>
			{children}
		</section>
	);
}

export function SectionHeader({
	title,
	description,
	actions,
}: {
	title: string;
	description?: ReactNode;
	actions?: ReactNode;
}) {
	return (
		<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
			<div>
				<h2 className="text-lg font-semibold">{title}</h2>
				{description ? (
					<div className="mt-1 text-sm text-[var(--app-text-muted)]">
						{description}
					</div>
				) : null}
			</div>
			{actions}
		</div>
	);
}

export function PageHeader({
	title,
	description,
	count,
	action,
	children,
}: {
	title: string;
	description?: ReactNode;
	count?: number;
	action?: ReactNode;
	children?: ReactNode;
}) {
	return (
		<div className="mb-5 flex flex-col gap-3 border-b border-[var(--app-border)]/75 pb-5 sm:flex-row sm:items-center sm:justify-between">
			<div className="min-w-0">
				<h1 className="text-2xl font-semibold tracking-tight">
					{title}
				</h1>
				{description ? (
					<div className="mt-1 text-sm text-[var(--app-text-muted)]">
						{description}
					</div>
				) : null}
				{count !== undefined ? (
					<p className="mt-1 text-sm text-[var(--app-text-muted)]">
						{count} registro{count === 1 ? "" : "s"}
					</p>
				) : null}
			</div>
			{(action ?? children) ? (
				<div className="flex shrink-0 flex-wrap items-center gap-2">
					<div className="flex gap-2">{action ?? children}</div>
				</div>
			) : null}
		</div>
	);
}
