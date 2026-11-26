"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/utils/cn";

export function Dialog({
	open,
	onOpenChange,
	title,
	description,
	children,
	size = "lg",
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title: ReactNode;
	description?: ReactNode;
	children: ReactNode;
	size?: "sm" | "md" | "lg" | "xl" | "full";
}) {
	const widths = {
		sm: "max-w-sm",
		md: "max-w-md",
		lg: "max-w-xl",
		xl: "max-w-4xl",
		full: "max-w-6xl",
	};

	return (
		<DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
			<DialogPrimitive.Portal>
				<DialogPrimitive.Overlay className="fixed inset-0 z-[100] bg-slate-950/60 backdrop-blur-sm data-[state=closed]:animate-out data-[state=open]:animate-in" />
				<DialogPrimitive.Content
					aria-describedby={description ? undefined : undefined}
					className={cn(
						"fixed left-1/2 top-1/2 z-[101] max-h-[min(90dvh,56rem)] w-[min(calc(100vw-1.5rem),72rem)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-[var(--app-border)]/75 bg-[var(--app-surface)]/92 p-5 shadow-2xl backdrop-blur-2xl sm:p-6",
						widths[size],
					)}
				>
					<div className="mb-5 flex items-start justify-between gap-4 pr-1">
						<div className="min-w-0">
							<DialogPrimitive.Title className="text-xl font-semibold tracking-tight">
								{title}
							</DialogPrimitive.Title>
							{description ? (
								<DialogPrimitive.Description className="mt-1 text-sm text-[var(--app-text-muted)]">
									{description}
								</DialogPrimitive.Description>
							) : null}
						</div>
						<DialogPrimitive.Close
							className="grid size-9 shrink-0 place-items-center rounded-full text-[var(--app-text-muted)] transition hover:bg-[var(--app-surface-muted)] hover:text-[var(--app-text)]"
							aria-label="Cerrar"
						>
							<X className="size-4" />
						</DialogPrimitive.Close>
					</div>
					{children}
				</DialogPrimitive.Content>
			</DialogPrimitive.Portal>
		</DialogPrimitive.Root>
	);
}
