"use client";

import {
	createContext,
	cloneElement,
	isValidElement,
	useContext,
	useCallback,
	useEffect,
	useId,
	useRef,
	useState,
	type ButtonHTMLAttributes,
	type HTMLAttributes,
	type MouseEvent,
	type ReactElement,
	type ReactNode,
} from "react";

import { cn } from "@/utils/cn";

type DropdownContextValue = {
	contentId: string;
	open: boolean;
	rootRef: React.RefObject<HTMLDivElement | null>;
	setOpen: (open: boolean) => void;
	triggerId: string;
};

const DropdownContext = createContext<DropdownContextValue | null>(null);

function useDropdown() {
	const context = useContext(DropdownContext);
	if (!context)
		throw new Error("Dropdown components must be used inside <Dropdown>.");
	return context;
}

type DropdownProps = {
	children: ReactNode;
	className?: string;
	defaultOpen?: boolean;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
};

export function Dropdown({
	children,
	className,
	defaultOpen = false,
	open: controlledOpen,
	onOpenChange,
}: DropdownProps) {
	const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
	const open = controlledOpen ?? uncontrolledOpen;
	const rootRef = useRef<HTMLDivElement>(null);
	const baseId = useId();

	const setOpen = useCallback(
		(nextOpen: boolean) => {
			if (controlledOpen === undefined) {
				setUncontrolledOpen(nextOpen);
			}

			onOpenChange?.(nextOpen);
		},
		[controlledOpen, onOpenChange],
	);

	useEffect(() => {
		if (!open) return;

		function handlePointerDown(event: PointerEvent) {
			if (!rootRef.current?.contains(event.target as Node)) {
				setOpen(false);
			}
		}

		function handleKeyDown(event: KeyboardEvent) {
			if (event.key === "Escape") {
				setOpen(false);
			}
		}

		document.addEventListener("pointerdown", handlePointerDown);
		document.addEventListener("keydown", handleKeyDown);

		return () => {
			document.removeEventListener("pointerdown", handlePointerDown);
			document.removeEventListener("keydown", handleKeyDown);
		};
	}, [open, setOpen]);

	return (
		<DropdownContext.Provider
			value={{
				contentId: `${baseId}-content`,
				open,
				rootRef,
				setOpen,
				triggerId: `${baseId}-trigger`,
			}}
		>
			<div
				ref={rootRef}
				className={cn("relative inline-block text-left", className)}
			>
				{children}
			</div>
		</DropdownContext.Provider>
	);
}

type DropdownTriggerProps = ButtonHTMLAttributes<HTMLButtonElement>;

export function DropdownTrigger({
	className,
	onClick,
	...props
}: DropdownTriggerProps) {
	const { contentId, open, setOpen, triggerId } = useDropdown();

	return (
		<button
			type="button"
			id={triggerId}
			aria-controls={contentId}
			aria-expanded={open}
			aria-haspopup="menu"
			className={className}
			onClick={(event) => {
				onClick?.(event);
				setOpen(!open);
			}}
			{...props}
		/>
	);
}

type DropdownContentProps = HTMLAttributes<HTMLDivElement> & {
	align?: "start" | "end";
	side?: "top" | "bottom";
};

export function DropdownContent({
	align = "start",
	children,
	className,
	side = "bottom",
	...props
}: DropdownContentProps) {
	const { contentId, open, triggerId } = useDropdown();

	if (!open) return null;

	return (
		<div
			id={contentId}
			role="menu"
			aria-labelledby={triggerId}
			className={cn(
				"absolute z-50 min-w-44 rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] p-1.5 text-[var(--app-text)] shadow-[0_20px_60px_rgba(15,23,42,0.18)] outline-none backdrop-blur",
				side === "top" ? "bottom-full mb-2" : "top-full mt-2",
				align === "end" ? "right-0" : "left-0",
				className,
			)}
			{...props}
		>
			{children}
		</div>
	);
}

type DropdownItemProps = ButtonHTMLAttributes<HTMLButtonElement> & {
	asChild?: boolean;
	children: ReactNode;
};

export function DropdownItem({
	asChild = false,
	children,
	className,
	onClick,
	...props
}: DropdownItemProps) {
	const { setOpen } = useDropdown();
	const itemClassName = cn(
		"flex min-h-10 w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm font-bold text-[var(--app-text)] transition hover:bg-[var(--app-surface-muted)] focus-visible:bg-[var(--app-surface-muted)] focus-visible:outline-none",
		className,
	);

	function handleClick(event: MouseEvent<HTMLButtonElement>) {
		onClick?.(event);
		if (!event.defaultPrevented) {
			setOpen(false);
		}
	}

	if (asChild && isValidElement(children)) {
		const child = children as ReactElement<{
			className?: string;
			onClick?: (event: MouseEvent<HTMLElement>) => void;
			role?: string;
		}>;

		return cloneElement(child, {
			className: cn(itemClassName, child.props.className),
			onClick: (event: MouseEvent<HTMLElement>) => {
				child.props.onClick?.(event);
				if (!event.defaultPrevented) {
					setOpen(false);
				}
			},
			role: child.props.role ?? "menuitem",
		});
	}

	return (
		<button
			type="button"
			role="menuitem"
			className={itemClassName}
			onClick={handleClick}
			{...props}
		>
			{children}
		</button>
	);
}
