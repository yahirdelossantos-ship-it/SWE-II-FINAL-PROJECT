"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import mark from "@/assets/LOGO/LOGO-MARK.webp";

export function EntryGate({ children }: { children: React.ReactNode }) {
	const [ready, setReady] = useState(false);

	useEffect(() => {
		const timer = window.setTimeout(() => setReady(true), 1200);
		return () => window.clearTimeout(timer);
	}, []);

	if (ready) return children;

	return (
		<div className="fixed inset-0 z-[100] grid place-items-center overflow-hidden bg-[linear-gradient(145deg,var(--app-hero-from),var(--app-hero-via)_60%,var(--app-hero-to))]">
			<div className="absolute inset-0 animate-pulse bg-[radial-gradient(circle,rgba(255,255,255,.18),transparent_48%)]" />
			<Image
				src={mark}
				alt="MB Transfer"
				className="relative w-28 animate-[app-entry-pulse_1.2s_ease-in-out_infinite] drop-shadow-2xl"
				priority
			/>
		</div>
	);
}
