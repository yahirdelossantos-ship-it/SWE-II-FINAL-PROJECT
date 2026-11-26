"use client";

import { CircleAlert, Info } from "lucide-react";
import * as React from "react";
import { useEffect } from "react";

import { Button } from "@/components/ui/Button";
import { useDisclosure } from "@/hooks/use-disclosure";

import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "../dialog";

export type ConfirmationDialogProps = {
	triggerButton?: React.ReactElement;
	confirmButton: React.ReactElement;
	title: string;
	body?: string;
	cancelButtonText?: string;
	onCancel?: () => void;
	icon?: "danger" | "info";
	isDone?: boolean;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
};

export const ConfirmationDialog = ({
	triggerButton,
	confirmButton,
	title,
	body = "",
	cancelButtonText = "Cancel",
	onCancel,
	icon = "danger",
	isDone = false,
	open: controlledOpen,
	onOpenChange,
}: ConfirmationDialogProps) => {
	const { close, open, isOpen } = useDisclosure();
	const dialogOpen = controlledOpen ?? isOpen;
	const cancelButtonRef = React.useRef<HTMLButtonElement | null>(null);

	const closeDialog = React.useCallback(() => {
		close();
		onOpenChange?.(false);
	}, [close, onOpenChange]);

	const openDialog = React.useCallback(() => {
		open();
		onOpenChange?.(true);
	}, [onOpenChange, open]);

	useEffect(() => {
		if (isDone) {
			closeDialog();
		}
	}, [isDone, closeDialog]);

	return (
		<Dialog
			open={dialogOpen}
			onOpenChange={(nextOpen) => {
				if (!nextOpen) {
					closeDialog();
					return;
				}

				openDialog();
			}}
		>
			{triggerButton ? (
				<DialogTrigger asChild>{triggerButton}</DialogTrigger>
			) : null}
			<DialogContent className="overflow-hidden rounded-md border border-[var(--app-border)] bg-[var(--app-surface)] p-0 text-[var(--app-text)] shadow-[0_32px_100px_rgba(0,0,0,0.24)] sm:max-w-[460px]">
				<div className="h-1 w-full bg-[var(--app-accent)]" />
				<div className="p-6 sm:p-7">
					<DialogHeader className="flex">
						<DialogTitle className="flex items-start gap-4 text-left text-2xl font-black uppercase leading-tight">
							<span className="mt-0.5 inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-[var(--app-border)] bg-[var(--app-surface-muted)]">
								{icon === "danger" ? (
									<CircleAlert
										className="size-6 text-red-400"
										aria-hidden="true"
									/>
								) : (
									<Info
										className="size-6 text-[var(--app-accent)]"
										aria-hidden="true"
									/>
								)}
							</span>
							<span>{title}</span>
						</DialogTitle>
					</DialogHeader>

					{body ? (
						<p className="mt-4 text-sm font-medium leading-6 text-[var(--app-text-muted)]">
							{body}
						</p>
					) : null}

					<DialogFooter className="mt-7 gap-3 sm:justify-start sm:space-x-0">
						{confirmButton}
						<Button
							ref={cancelButtonRef}
							variant="cta"
							size="sm"
							onClick={onCancel ?? closeDialog}
							className="border border-[var(--app-border)] bg-transparent text-[var(--app-text)] hover:text-[var(--app-primary-foreground)]"
						>
							{cancelButtonText}
						</Button>
					</DialogFooter>
				</div>
			</DialogContent>
		</Dialog>
	);
};
