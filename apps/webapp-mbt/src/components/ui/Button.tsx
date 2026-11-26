import * as React from "react";
import { Slot, Slottable } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/utils/cn";

import { Spinner } from "./Spinner";

const buttonVariants = cva(
	"inline-flex cursor-pointer w-full items-center justify-center whitespace-nowrap rounded-xl border text-sm font-semibold tracking-[0.015em] shadow-sm backdrop-blur-md transition-[background-color,border-color,color,box-shadow,transform] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--app-page)] active:translate-y-px disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none",
	{
		variants: {
			variant: {
				locked: "border-[var(--app-border)]/60 bg-[var(--app-surface-muted)]/55 text-[var(--app-text-muted)]",
				default:
					"border-[var(--app-border)]/70 bg-[var(--app-surface)]/65 text-[var(--app-text)] hover:border-[var(--app-primary)]/30 hover:bg-[var(--app-surface)]/90 hover:shadow-md",
				primary:
					"border-[var(--app-primary)]/70 bg-[var(--app-primary)]/90 text-[var(--app-primary-foreground)] shadow-[0_8px_22px_color-mix(in_srgb,var(--app-primary)_20%,transparent)] hover:bg-[var(--app-primary)] hover:shadow-[0_10px_28px_color-mix(in_srgb,var(--app-primary)_28%,transparent)]",
				primaryOutline:
					"border-[var(--app-primary)]/35 bg-[color-mix(in_srgb,var(--app-primary)_8%,var(--app-surface))]/75 text-[var(--app-primary)] hover:border-[var(--app-primary)]/55 hover:bg-[color-mix(in_srgb,var(--app-primary)_14%,var(--app-surface))]/90 hover:shadow-md",
				secondary:
					"border-[var(--app-accent)]/70 bg-[var(--app-accent)]/90 text-[var(--app-accent-foreground)] shadow-[0_8px_22px_color-mix(in_srgb,var(--app-accent)_20%,transparent)] hover:bg-[var(--app-accent)] hover:shadow-md",
				secondaryOutline:
					"border-[var(--app-accent)]/35 bg-[color-mix(in_srgb,var(--app-accent)_8%,var(--app-surface))]/75 text-[var(--app-accent)] hover:border-[var(--app-accent)]/55 hover:bg-[color-mix(in_srgb,var(--app-accent)_14%,var(--app-surface))]/90 hover:shadow-md",
				danger: "border-[var(--app-danger)]/70 bg-[var(--app-danger)]/90 text-[var(--app-danger-foreground)] shadow-[0_8px_22px_color-mix(in_srgb,var(--app-danger)_18%,transparent)] hover:bg-[var(--app-danger)] hover:shadow-md",
				dangerOutline:
					"border-[var(--app-danger)]/35 bg-[color-mix(in_srgb,var(--app-danger)_7%,var(--app-surface))]/75 text-[var(--app-danger)] hover:border-[var(--app-danger)]/55 hover:bg-[color-mix(in_srgb,var(--app-danger)_13%,var(--app-surface))]/90 hover:shadow-md",
				super: "border-[var(--app-primary)]/70 bg-[var(--app-primary)]/90 text-[var(--app-primary-foreground)] shadow-[0_8px_22px_color-mix(in_srgb,var(--app-primary)_20%,transparent)] hover:bg-[var(--app-primary)] hover:shadow-md",
				superOutline:
					"border-[var(--app-primary)]/35 bg-[color-mix(in_srgb,var(--app-primary)_8%,var(--app-surface))]/75 text-[var(--app-primary)] hover:border-[var(--app-primary)]/55 hover:bg-[color-mix(in_srgb,var(--app-primary)_14%,var(--app-surface))]/90 hover:shadow-md",
				outline:
					"border-[var(--app-border)]/75 bg-[var(--app-surface)]/45 text-[var(--app-text)] hover:border-[var(--app-primary)]/30 hover:bg-[var(--app-surface)]/75 hover:shadow-md",
				ghost: "border-transparent bg-transparent text-[var(--app-text-muted)] shadow-none hover:bg-[var(--app-surface-muted)]/65 hover:text-[var(--app-text)]",
				sidebar:
					"border-transparent bg-transparent text-[var(--app-text-muted)] shadow-none hover:bg-[var(--app-surface-muted)]/65 hover:text-[var(--app-text)]",
				sidebarOutline:
					"border-[var(--app-accent)]/25 bg-[color-mix(in_srgb,var(--app-accent)_12%,transparent)] text-[var(--app-accent)] shadow-none hover:bg-[color-mix(in_srgb,var(--app-accent)_18%,transparent)]",
				cta: "group relative isolate inline-flex w-auto items-center justify-center overflow-hidden rounded-full border-[var(--app-accent)]/60 bg-[var(--app-accent)]/90 text-[var(--app-accent-foreground)] shadow-[0_8px_24px_color-mix(in_srgb,var(--app-accent)_22%,transparent)] before:absolute before:inset-y-0 before:left-0 before:z-0 before:w-0 before:rounded-full before:bg-[var(--app-primary)] before:transition-all before:duration-300 before:content-[''] hover:border-[var(--app-primary)]/60 hover:text-[var(--app-primary-foreground)] hover:shadow-lg hover:before:w-full focus-visible:ring-[var(--app-focus)] focus-visible:ring-offset-[var(--app-page)]",
			},
			size: {
				default: "h-12 px-6 py-3",
				sm: "h-9 px-3",
				lg: "h-12 px-8",
				icon: "h-10 w-10",
				rounded: "rounded-full",
				cta: "h-14 px-8 py-0",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	},
);

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
	VariantProps<typeof buttonVariants> & {
		asChild?: boolean;
		isLoading?: boolean;
		icon?: React.ReactNode;
		rightIcon?: React.ReactNode;
		showSeparator?: boolean;
	};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
	(
		{
			className,
			variant,
			size,
			asChild = false,
			children,
			isLoading,
			icon,
			rightIcon,
			showSeparator,
			...props
		},
		ref,
	) => {
		const Comp = asChild ? Slot : "button";
		return (
			<Comp
				className={cn(buttonVariants({ variant, size, className }))}
				ref={ref}
				{...props}
			>
				{isLoading && <Spinner size="sm" className="text-current" />}
				{!isLoading && icon && (
					<span className="relative z-10 mr-2">{icon}</span>
				)}
				<Slottable>
					{asChild ? (
						children
					) : (
						<span className="relative z-10 mx-2">{children}</span>
					)}
				</Slottable>
				{showSeparator && (
					<span
						className="relative z-10 mx-3 h-5 w-px bg-[color-mix(in_srgb,var(--app-primary-foreground)_55%,transparent)]"
						aria-hidden="true"
					/>
				)}
				{rightIcon && (
					<span className="relative z-10 transition-transform duration-300 group-hover:translate-x-1">
						{rightIcon}
					</span>
				)}
			</Comp>
		);
	},
);

Button.displayName = "Button";

export { Button, buttonVariants };
