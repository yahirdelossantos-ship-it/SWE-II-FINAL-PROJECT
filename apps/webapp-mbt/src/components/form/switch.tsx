"use client";

import * as SwitchPrimitives from "@radix-ui/react-switch";
import * as React from "react";

import { cn } from "@/utils/cn";

const Switch = React.forwardRef<
	React.ElementRef<typeof SwitchPrimitives.Root>,
	React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
	<SwitchPrimitives.Root
		className={cn(
			"peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border border-[color-mix(in_srgb,var(--app-accent)_32%,transparent)] bg-[var(--app-surface-muted)] p-0.5 shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--app-page)] disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-[var(--app-accent)] data-[state=checked]:bg-[var(--app-accent)] data-[state=unchecked]:bg-[var(--app-surface-muted)]",
			className,
		)}
		{...props}
		ref={ref}
	>
		<SwitchPrimitives.Thumb
			className={cn(
				"pointer-events-none block size-5 rounded-full bg-[var(--app-surface)] shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0",
			)}
		/>
	</SwitchPrimitives.Root>
));
Switch.displayName = SwitchPrimitives.Root.displayName;

export { Switch };
