"use client";

import * as React from "react";

import { cn } from "@/utils/cn";

import { FieldWrapper, FieldWrapperPassThroughProps } from "./field-wrapper";
import { type FieldRegistration } from "./types";

type Option = {
	label: React.ReactNode;
	value: string | number | string[];
	disabled?: boolean;
};

type SelectFieldProps = Omit<
	React.SelectHTMLAttributes<HTMLSelectElement>,
	"children"
> &
	FieldWrapperPassThroughProps & {
		options: Option[];
		className?: string;
		fieldClassName?: string;
		registration?: FieldRegistration<HTMLSelectElement>;
		variant?: "default" | "website";
	};

export const Select = (props: SelectFieldProps) => {
	const {
		label,
		options,
		error,
		className,
		fieldClassName,
		defaultValue,
		registration,
		variant = "default",
		...selectProps
	} = props;
	return (
		<FieldWrapper label={label} error={error} className={fieldClassName}>
			<select
				className={cn(
					variant === "website"
						? "h-14 w-full rounded-full border border-[var(--app-border)] bg-[var(--app-surface-muted)] px-7 text-base text-[var(--app-text)] outline-none transition focus:border-[var(--app-accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--app-focus)_28%,transparent)] disabled:cursor-not-allowed disabled:opacity-50"
						: "mt-1 block w-full rounded-md border border-[var(--app-border)] bg-[var(--app-surface)] py-2 pl-3 pr-10 text-base text-[var(--app-text)] focus:border-[var(--app-focus)] focus:outline-none focus:ring-1 focus:ring-[var(--app-focus)] sm:text-sm",
					className,
				)}
				defaultValue={defaultValue}
				{...(registration ?? {})}
				{...selectProps}
			>
				{options.map(({ label, value, disabled }) => (
					<option key={`${value}`} value={value} disabled={disabled}>
						{label}
					</option>
				))}
			</select>
		</FieldWrapper>
	);
};
