import { AlertCircle, Inbox } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/utils/cn";

export function ContentSkeleton({
	rows = 4,
	className,
}: {
	rows?: number;
	className?: string;
}) {
	return (
		<div
			aria-label="Cargando contenido"
			role="status"
			className={cn(
				"grid animate-pulse gap-4 sm:grid-cols-2 xl:grid-cols-3",
				className,
			)}
		>
			{Array.from({ length: rows }, (_, index) => (
				<div
					key={index}
					className="h-36 rounded-2xl border border-[var(--app-border)]/35 bg-[var(--app-surface-muted)]/55"
				/>
			))}
		</div>
	);
}

export function EmptyState({
	children,
	icon,
}: {
	children: ReactNode;
	icon?: ReactNode;
}) {
	return (
		<div className="grid min-h-44 place-items-center rounded-2xl border border-dashed border-[var(--app-border)]/80 bg-[var(--app-surface)]/25 p-8 text-center text-sm text-[var(--app-text-muted)]">
			<div>
				<div className="mx-auto mb-3 grid size-10 place-items-center rounded-full bg-[var(--app-surface-muted)]/70">
					{icon ?? <Inbox className="size-5" />}
				</div>
				{children}
			</div>
		</div>
	);
}

export function ErrorState({ error }: { error: Error | string }) {
	return (
		<div
			role="alert"
			className="flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-5 text-sm text-red-700 dark:text-red-300"
		>
			<AlertCircle className="mt-0.5 size-5 shrink-0" />
			<span>{typeof error === "string" ? error : error.message}</span>
		</div>
	);
}
