import { twMerge } from "tailwind-merge";

type ClassDictionary = Record<string, boolean | null | undefined>;
type ClassArray = ClassValue[];
type ClassValue =
	| string
	| number
	| false
	| null
	| undefined
	| ClassDictionary
	| ClassArray;

function clsx(...inputs: ClassValue[]): string {
	const classes: string[] = [];

	for (const input of inputs) {
		if (!input) {
			continue;
		}

		if (typeof input === "string" || typeof input === "number") {
			classes.push(String(input));
			continue;
		}

		if (Array.isArray(input)) {
			const nested = clsx(...input);

			if (nested) {
				classes.push(nested);
			}

			continue;
		}

		for (const [className, enabled] of Object.entries(input)) {
			if (enabled) {
				classes.push(className);
			}
		}
	}

	return classes.join(" ");
}

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(...inputs));
}
