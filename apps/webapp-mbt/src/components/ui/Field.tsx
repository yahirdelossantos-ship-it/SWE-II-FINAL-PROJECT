import { cn } from "@/utils/cn";

export const fieldClass =
	"h-10 w-full rounded-xl border border-[var(--app-border)]/70 bg-[var(--app-surface)]/65 px-3 text-sm outline-none backdrop-blur-sm transition focus:border-[var(--app-primary)] focus:ring-2 focus:ring-[var(--app-focus)]/20 disabled:cursor-not-allowed disabled:opacity-55";

export function FieldLabel({
	label,
	children,
	className,
}: {
	label: string;
	children: React.ReactNode;
	className?: string;
}) {
	return (
		<label className={cn("space-y-1.5 text-sm", className)}>
			<span className="font-medium">{label}</span>
			{children}
		</label>
	);
}
