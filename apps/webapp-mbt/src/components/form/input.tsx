import * as React from "react";

import { cn } from "@/utils/cn";

import { FieldWrapper, FieldWrapperPassThroughProps } from "./field-wrapper";
import { type FieldRegistration } from "./types";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> &
	FieldWrapperPassThroughProps & {
		className?: string;
		fieldClassName?: string;
		registration?: FieldRegistration<HTMLInputElement>;
		variant?: "default" | "website";
	};

const Input = React.forwardRef<HTMLInputElement, InputProps>(
	(
		{
			className,
			fieldClassName,
			type,
			label,
			error,
			registration,
			variant = "default",
			...props
		},
		ref,
	) => {
		return (
			<FieldWrapper
				label={label}
				error={error}
				className={fieldClassName}
			>
				<input
					type={type}
					className={cn(
						variant === "website"
							? "h-14 w-full rounded-full border border-[var(--app-border)] bg-[var(--app-surface-muted)] px-7 text-base text-[var(--app-text)] outline-none transition placeholder:text-[var(--app-text-muted)] focus:border-[var(--app-accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--app-focus)_28%,transparent)] disabled:cursor-not-allowed disabled:opacity-50"
							: "flex h-9 w-full rounded-md border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-1 text-sm text-[var(--app-text)] shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[var(--app-text-muted)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--app-focus)] disabled:cursor-not-allowed disabled:opacity-50",
						className,
					)}
					ref={ref}
					{...(registration ?? {})}
					{...props}
				/>
			</FieldWrapper>
		);
	},
);
Input.displayName = "Input";

export { Input };
