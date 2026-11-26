"use client";

import * as DrawerPrimitive from "@radix-ui/react-dialog";
import { Cross2Icon } from "@radix-ui/react-icons";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/utils/cn";

const Drawer = DrawerPrimitive.Root;

const DrawerTrigger = DrawerPrimitive.Trigger;

const DrawerClose = DrawerPrimitive.Close;

const DrawerPortal = DrawerPrimitive.Portal;

const DrawerOverlay = React.forwardRef<
	React.ElementRef<typeof DrawerPrimitive.Overlay>,
	React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Overlay>
>(({ className, ...props }, ref) => (
	<DrawerPrimitive.Overlay
		className={cn(
			"fixed inset-0 z-50 bg-[color-mix(in_srgb,var(--app-deep-section)_68%,transparent)] backdrop-blur-[2px] transition-opacity duration-500 ease-out data-[state=closed]:opacity-0 data-[state=open]:opacity-100",
			className,
		)}
		{...props}
		ref={ref}
	/>
));
DrawerOverlay.displayName = DrawerPrimitive.Overlay.displayName;

const drawerVariants = cva(
	"fixed z-50 gap-4 bg-[var(--app-surface)] p-6 text-[var(--app-text)] shadow-2xl outline-none transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] data-[state=closed]:opacity-0 data-[state=open]:opacity-100",
	{
		variants: {
			side: {
				top: "inset-x-0 top-0 border-b border-[var(--app-border)] data-[state=closed]:-translate-y-full data-[state=open]:translate-y-0",
				bottom: "inset-x-0 bottom-0 border-t border-[var(--app-border)] data-[state=closed]:translate-y-full data-[state=open]:translate-y-0",
				left: "inset-y-0 left-0 h-full w-3/4 border-r border-[var(--app-border)] data-[state=closed]:-translate-x-full data-[state=open]:translate-x-0 sm:max-w-sm",
				right: "inset-y-0 right-0 h-full w-3/4 border-l border-[var(--app-border)] data-[state=closed]:translate-x-full data-[state=open]:translate-x-0 sm:max-w-sm",
			},
		},
		defaultVariants: {
			side: "right",
		},
	},
);

type DrawerContentProps = React.ComponentPropsWithoutRef<
	typeof DrawerPrimitive.Content
> &
	VariantProps<typeof drawerVariants> & {
		showClose?: boolean;
	};

const DrawerContent = React.forwardRef<
	React.ElementRef<typeof DrawerPrimitive.Content>,
	DrawerContentProps
>(
	(
		{ side = "right", className, children, showClose = true, ...props },
		ref,
	) => (
		<DrawerPortal>
			<DrawerOverlay />
			<DrawerPrimitive.Content
				ref={ref}
				className={cn(drawerVariants({ side }), className)}
				{...props}
			>
				{children}
				{showClose ? (
					<DrawerPrimitive.Close className="absolute right-4 top-4 rounded-md text-[var(--app-text-muted)] opacity-70 transition-opacity hover:text-[var(--app-text)] hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-[var(--app-focus)] focus:ring-offset-2 focus:ring-offset-[var(--app-surface)] disabled:pointer-events-none">
						<Cross2Icon className="size-4" />
						<span className="sr-only">Close</span>
					</DrawerPrimitive.Close>
				) : null}
			</DrawerPrimitive.Content>
		</DrawerPortal>
	),
);
DrawerContent.displayName = DrawerPrimitive.Content.displayName;

const DrawerHeader = ({
	className,
	...props
}: React.HTMLAttributes<HTMLDivElement>) => (
	<div
		className={cn(
			"flex flex-col space-y-2 text-center sm:text-left",
			className,
		)}
		{...props}
	/>
);
DrawerHeader.displayName = "DrawerHeader";

const DrawerFooter = ({
	className,
	...props
}: React.HTMLAttributes<HTMLDivElement>) => (
	<div
		className={cn(
			"flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
			className,
		)}
		{...props}
	/>
);
DrawerFooter.displayName = "DrawerFooter";

const DrawerTitle = React.forwardRef<
	React.ElementRef<typeof DrawerPrimitive.Title>,
	React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Title>
>(({ className, ...props }, ref) => (
	<DrawerPrimitive.Title
		ref={ref}
		className={cn(
			"text-lg font-semibold text-[var(--app-text)]",
			className,
		)}
		{...props}
	/>
));
DrawerTitle.displayName = DrawerPrimitive.Title.displayName;

const DrawerDescription = React.forwardRef<
	React.ElementRef<typeof DrawerPrimitive.Description>,
	React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Description>
>(({ className, ...props }, ref) => (
	<DrawerPrimitive.Description
		ref={ref}
		className={cn("text-sm text-[var(--app-text-muted)]", className)}
		{...props}
	/>
));
DrawerDescription.displayName = DrawerPrimitive.Description.displayName;

export {
	Drawer,
	DrawerPortal,
	DrawerOverlay,
	DrawerTrigger,
	DrawerClose,
	DrawerContent,
	DrawerHeader,
	DrawerFooter,
	DrawerTitle,
	DrawerDescription,
};
