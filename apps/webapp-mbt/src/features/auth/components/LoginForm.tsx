"use client";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, UserRound } from "lucide-react";
import { Button } from "@/components/ui/Button";
export function LoginForm() {
	const router = useRouter();
	const [pending, setPending] = useState(false);
	const [error, setError] = useState("");
	async function submit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setPending(true);
		setError("");
		const data = new FormData(event.currentTarget);
		try {
			const response = await fetch("/api/session/login", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					identifier: data.get("identifier"),
					accessKey: data.get("accessKey"),
				}),
			});
			const payload = await response.json();
			if (!response.ok) {
				setError(
					payload?.error?.message ?? "No se pudo iniciar sesión",
				);
				return;
			}
			router.push("/app/itinerary/view");
			router.refresh();
		} catch {
			setError("No se pudo conectar con el servidor");
		} finally {
			setPending(false);
		}
	}
	return (
		<form onSubmit={submit} className="space-y-6">
			<div>
				<h1 className="text-3xl font-semibold tracking-tight">
					Iniciar sesión
				</h1>
				<p className="mt-2 text-sm text-[var(--app-text-muted)]">
					Accede a la plataforma operacional.
				</p>
			</div>
			<label className="block space-y-2">
				<span className="text-sm font-medium">Identificador</span>
				<span className="flex items-center gap-3 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] px-4">
					<UserRound className="size-4 text-[var(--app-text-muted)]" />
					<input
						name="identifier"
						required
						autoComplete="username"
						className="h-12 min-w-0 flex-1 bg-transparent outline-none"
					/>
				</span>
			</label>
			<label className="block space-y-2">
				<span className="text-sm font-medium">Llave de acceso</span>
				<span className="flex items-center gap-3 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] px-4">
					<KeyRound className="size-4 text-[var(--app-text-muted)]" />
					<input
						name="accessKey"
						type="password"
						required
						autoComplete="current-password"
						className="h-12 min-w-0 flex-1 bg-transparent outline-none"
					/>
				</span>
			</label>
			{error && (
				<p
					role="alert"
					className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700"
				>
					{error}
				</p>
			)}
			<Button
				type="submit"
				variant="primary"
				isLoading={pending}
				className="w-full"
			>
				Entrar
			</Button>
		</form>
	);
}
