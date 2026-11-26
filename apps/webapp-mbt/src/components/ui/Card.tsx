import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/utils/cn";

const cardVariants = cva(
	"rounded-2xl border border-[var(--app-border)]/55 bg-[var(--app-surface)]/45 text-[var(--app-text)] shadow-sm backdrop-blur-md transition-colors",
	{
		variants: {
			variant: {
				default: "",
				muted: "bg-[var(--app-surface-muted)]/55",
				interactive:
					"hover:border-[var(--app-primary)]/30 hover:bg-[var(--app-surface)]/62 hover:shadow-lg",
			},
			padding: {
				none: "",
				sm: "p-4",
				md: "p-6",
				lg: "p-8",
			},
		},
		defaultVariants: {
			variant: "default",
			padding: "md",
		},
	},
);

export type CardProps = React.HTMLAttributes<HTMLDivElement> &
	VariantProps<typeof cardVariants>;

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
	({ className, padding, variant, ...props }, ref) => {
		return (
			<div
				ref={ref}
				className={cn(cardVariants({ padding, variant, className }))}
				{...props}
			/>
		);
	},
);

Card.displayName = "Card";
