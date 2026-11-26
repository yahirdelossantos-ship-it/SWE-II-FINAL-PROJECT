"use client";

import { Button } from "@/components/ui/Button";
import { Moon, Sun } from "lucide-react";

import { useTheme } from "@/hooks/use-theme";

type ThemeToggleProps = {
	className?: string;
};

export function ThemeToggle({ className }: ThemeToggleProps) {
	const { theme, toggleTheme } = useTheme();

	return (
		<Button
			variant="cta"
			icon={theme === "dark" ? <Sun /> : <Moon />}
			size="lg"
			className={className}
			onClick={toggleTheme}
		>
			<span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
		</Button>
	);
}
