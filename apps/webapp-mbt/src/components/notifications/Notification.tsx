"use client";

import { ReactNode } from "react";

import { Info, CircleAlert, CircleX, CircleCheck } from "lucide-react";
import { type NotificationType } from "./types";

const icons: Record<string, ReactNode> = {
	info: <Info className="size-6 text-[var(--app-info)]" aria-hidden="true" />,
	success: (
		<CircleCheck
			className="size-6 text-[var(--app-success)]"
			aria-hidden="true"
		/>
	),
	warning: (
		<CircleAlert
			className="size-6 text-[var(--app-warning)]"
			aria-hidden="true"
		/>
	),
	error: (
		<CircleX
			className="size-6 text-[var(--app-danger)]"
			aria-hidden="true"
		/>
	),
};

export type NotificationProps = {
	notification: NotificationType;
	onDismiss: (id: string) => void;
};

export const Notification = ({
	notification: { id, type, title, message },
	onDismiss,
}: NotificationProps) => {
	const m = type === "warning" ? message?.toUpperCase() : message;
	return (
		<div className="flex w-full flex-col items-center space-y-4 sm:items-end">
			<div className="pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg bg-[var(--app-surface)] text-[var(--app-text)] shadow-lg ring-1 ring-[var(--app-border)]">
				<div className="p-4" role="alert" aria-label={title}>
					<div className="flex items-start">
						<div className="shrink-0">{icons[type]}</div>
						<div className="ml-3 w-0 flex-1 pt-0.5">
							<p className="text-sm font-medium">{title}</p>
							<p className="mt-1 text-sm text-[var(--app-text-muted)]">
								{m}
							</p>
						</div>
						<div className="ml-4 flex shrink-0">
							<button
								className="inline-flex rounded-md bg-[var(--app-surface)] text-[var(--app-text-muted)] hover:text-[var(--app-text)] focus:outline-none focus:ring-2 focus:ring-[var(--app-focus)] focus:ring-offset-2"
								onClick={() => {
									onDismiss(id);
								}}
							>
								<span className="sr-only">Close</span>
								<CircleX
									className="size-5"
									aria-hidden="true"
								/>
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
