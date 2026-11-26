"use client";

import { Search } from "lucide-react";

import { cn } from "@/utils/cn";

export function SearchField({
	value,
	onChange,
	placeholder,
	className,
}: {
	value: string;
	onChange: (value: string) => void;
	placeholder: string;
	className?: string;
}) {
	return (
		<label className={cn("relative block", className)}>
			<Search className="pointer-events-none absolute left-3 top-3 size-4 text-[var(--app-text-muted)]" />
			<input
				value={value}
				onChange={(event) => onChange(event.target.value)}
				placeholder={placeholder}
				className="h-10 w-full rounded-xl border border-[var(--app-border)]/65 bg-[var(--app-surface)]/55 pl-9 pr-3 text-sm outline-none backdrop-blur-md transition focus:ring-2 focus:ring-[var(--app-focus)]/25"
			/>
		</label>
	);
}
