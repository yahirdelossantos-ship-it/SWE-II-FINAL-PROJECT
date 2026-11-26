"use client";

import { useEffect, useSyncExternalStore } from "react";

export type Theme = "light" | "dark";

const storageKey = "mb-transfer-theme";

const getSystemTheme = (): Theme =>
	window.matchMedia("(prefers-color-scheme: dark)").matches
		? "dark"
		: "light";

const getStoredTheme = (): Theme => {
	const storedTheme = window.localStorage.getItem(storageKey);

	return storedTheme === "light" || storedTheme === "dark"
		? storedTheme
		: getSystemTheme();
};

const applyTheme = (theme: Theme) => {
	document.documentElement.dataset.theme = theme;
	document.documentElement.style.colorScheme = theme;
	window.localStorage.setItem(storageKey, theme);
};

const subscribeToTheme = (onStoreChange: () => void) => {
	const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

	window.addEventListener("storage", onStoreChange);
	window.addEventListener("my-app-change", onStoreChange);
	mediaQuery.addEventListener("change", onStoreChange);

	return () => {
		window.removeEventListener("storage", onStoreChange);
		window.removeEventListener("my-app-change", onStoreChange);
		mediaQuery.removeEventListener("change", onStoreChange);
	};
};

export function useTheme() {
	const theme = useSyncExternalStore(
		subscribeToTheme,
		getStoredTheme,
		(): Theme => "light",
	);

	useEffect(() => {
		applyTheme(theme);
	}, [theme]);

	const toggleTheme = () => {
		const nextTheme: Theme = theme === "dark" ? "light" : "dark";
		applyTheme(nextTheme);
		window.dispatchEvent(new Event("my-app-change"));
	};

	return {
		theme,
		toggleTheme,
	};
}
