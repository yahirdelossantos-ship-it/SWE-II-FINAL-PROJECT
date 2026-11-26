"use client";

import { useSyncExternalStore } from "react";

import forest from "@/assets/BACKGROUND/FOREST.webp";
import globes from "@/assets/BACKGROUND/GLOBES.webp";
import leaves from "@/assets/BACKGROUND/LEAVES.webp";
import mountains from "@/assets/BACKGROUND/MOUNTAINS.webp";
import water from "@/assets/BACKGROUND/WATER.webp";
import nightSky from "@/assets/BACKGROUND/NIGHT-SKY.webp";

export const backgrounds = [
	{ id: "GLOBES", label: "Globos", image: globes },
	{ id: "FOREST", label: "Bosque", image: forest },
	{ id: "LEAVES", label: "Hojas", image: leaves },
	{ id: "MOUNTAINS", label: "Montañas", image: mountains },
	{ id: "WATER", label: "Agua", image: water },
	{ id: "NIGHTSKY", label: "Night Sky", image: nightSky },
] as const;

export type BackgroundId = (typeof backgrounds)[number]["id"];
export const BACKGROUND_STORAGE_KEY = "mbt-background";
const BACKGROUND_EVENT = "mbt-background-change";

export function normalizeBackground(value: string | null): BackgroundId {
	const normalized = value
		?.replace(/^bg-/, "")
		.replace(/\.(jpg|webp)$/i, "")
		.toUpperCase();
	return backgrounds.some((item) => item.id === normalized)
		? (normalized as BackgroundId)
		: "GLOBES";
}

export function storeBackground(value: BackgroundId) {
	window.localStorage.setItem(BACKGROUND_STORAGE_KEY, value);
	window.dispatchEvent(new Event(BACKGROUND_EVENT));
}

export function useStoredBackground(fallback: string | null) {
	const normalizedFallback = normalizeBackground(fallback);
	return useSyncExternalStore(
		(onStoreChange) => {
			window.addEventListener("storage", onStoreChange);
			window.addEventListener(BACKGROUND_EVENT, onStoreChange);
			return () => {
				window.removeEventListener("storage", onStoreChange);
				window.removeEventListener(BACKGROUND_EVENT, onStoreChange);
			};
		},
		() =>
			normalizeBackground(
				window.localStorage.getItem(BACKGROUND_STORAGE_KEY) ??
					normalizedFallback,
			),
		() => normalizedFallback,
	);
}
