import * as React from "react";

import { cn } from "@/utils/cn";

import { FieldWrapper, FieldWrapperPassThroughProps } from "./field-wrapper";
import { type FieldRegistration } from "./types";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> &
	FieldWrapperPassThroughProps & {
		className?: string;
		fieldClassName?: string;
		registration?: FieldRegistration<HTMLTextAreaElement>;
		variant?: "default" | "website";
	};

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
	(
		{
			className,
			fieldClassName,
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
				<textarea
					className={cn(
						variant === "website"
							? "min-h-36 w-full rounded-[30px] border border-[var(--app-border)] bg-[var(--app-surface-muted)] px-7 py-6 text-base text-[var(--app-text)] outline-none transition placeholder:text-[var(--app-text-muted)] focus:border-[var(--app-accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--app-focus)_28%,transparent)] disabled:cursor-not-allowed disabled:opacity-50"
							: "flex min-h-[60px] w-full rounded-md border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2 text-sm text-[var(--app-text)] shadow-sm placeholder:text-[var(--app-text-muted)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--app-focus)] disabled:cursor-not-allowed disabled:opacity-50",
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
Textarea.displayName = "Textarea";

export { Textarea };
