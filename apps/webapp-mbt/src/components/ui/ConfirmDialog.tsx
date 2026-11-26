"use client";

import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { useState } from "react";

import { Button } from "./Button";

export function ConfirmDialog({
	trigger,
	title,
	description,
	confirmLabel,
	onConfirm,
	pending = false,
}: {
	trigger: React.ReactNode;
	title: string;
	description: string;
	confirmLabel: string;
	onConfirm: () => void | Promise<void>;
	pending?: boolean;
}) {
	const [open, setOpen] = useState(false);
	return (
		<AlertDialog.Root open={open} onOpenChange={setOpen}>
			<AlertDialog.Trigger asChild>{trigger}</AlertDialog.Trigger>
			<AlertDialog.Portal>
				<AlertDialog.Overlay className="fixed inset-0 z-[110] bg-black/65 backdrop-blur-sm" />
				<AlertDialog.Content className="fixed left-1/2 top-1/2 z-[111] w-[min(28rem,calc(100vw-1.5rem))] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)]/95 p-6 shadow-2xl backdrop-blur-xl">
					<AlertDialog.Title className="text-lg font-semibold">
						{title}
					</AlertDialog.Title>
					<AlertDialog.Description className="mt-2 text-sm leading-6 text-[var(--app-text-muted)]">
						{description}
					</AlertDialog.Description>
					<div className="mt-6 flex justify-end gap-3">
						<AlertDialog.Cancel asChild>
							<Button className="w-auto" size="sm">
								Cancelar
							</Button>
						</AlertDialog.Cancel>
						<Button
							className="w-auto"
							size="sm"
							variant="danger"
							isLoading={pending}
							disabled={pending}
							onClick={async () => {
								await onConfirm();
								setOpen(false);
							}}
						>
							{confirmLabel}
						</Button>
					</div>
				</AlertDialog.Content>
			</AlertDialog.Portal>
		</AlertDialog.Root>
	);
}
