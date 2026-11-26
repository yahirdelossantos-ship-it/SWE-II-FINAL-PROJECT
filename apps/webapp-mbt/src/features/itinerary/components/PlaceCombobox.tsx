"use client";
import * as Popover from "@radix-ui/react-popover";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { type Option, usePlaceOptions } from "../api";

export function PlaceCombobox({
	name,
	label,
	places,
	initialValue = "",
	value: controlledValue,
	disabled = false,
	placeKind,
	allowCustomValue = true,
	onSelectionChange,
}: {
	name: string;
	label: string;
	places: Option[];
	initialValue?: string;
	value?: Option | { id: null; name: string } | null;
	disabled?: boolean;
	placeKind?: "AIRPORT";
	allowCustomValue?: boolean;
	onSelectionChange?: (place: Option | { id: null; name: string }) => void;
}) {
	const [uncontrolledValue, setUncontrolledValue] = useState(initialValue);
	const [query, setQuery] = useState("");
	const [debouncedQuery, setDebouncedQuery] = useState("");
	const [open, setOpen] = useState(false);
	useEffect(() => {
		const timeout = window.setTimeout(
			() => setDebouncedQuery(query.trim()),
			250,
		);
		return () => window.clearTimeout(timeout);
	}, [query]);
	const remote = usePlaceOptions(debouncedQuery, placeKind);
	const matches = useMemo(() => {
		const candidates = debouncedQuery ? (remote.data?.items ?? []) : places;
		return [
			...new Map(candidates.map((place) => [place.id, place])).values(),
		];
	}, [debouncedQuery, places, remote.data?.items]);
	const value =
		controlledValue === undefined
			? uncontrolledValue
			: (controlledValue?.name ?? "");
	function select(place: Option | { id: null; name: string }) {
		if (controlledValue === undefined) setUncontrolledValue(place.name);
		onSelectionChange?.(place);
		setOpen(false);
		setQuery("");
	}
	return (
		<label className="space-y-1 text-sm">
			<span>{label}</span>
			<input type="hidden" name={name} value={value} />
			<Popover.Root open={open} onOpenChange={setOpen}>
				<Popover.Trigger
					disabled={disabled}
					className="flex h-11 w-full items-center justify-between rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] px-3 text-left outline-none focus:ring-2 focus:ring-[var(--app-focus)] disabled:cursor-not-allowed disabled:opacity-60"
				>
					<span
						className={
							value ? "truncate" : "text-[var(--app-text-muted)]"
						}
					>
						{value || "Seleccionar lugar"}
					</span>
					<ChevronsUpDown className="size-4 shrink-0" />
				</Popover.Trigger>
				<Popover.Content
					align="start"
					sideOffset={5}
					className="z-[60] w-[var(--radix-popover-trigger-width)] rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] p-2 shadow-2xl"
				>
					<div className="mb-2 flex items-center gap-2 rounded-lg border border-[var(--app-border)] px-3">
						<Search className="size-4" />
						<input
							value={query}
							onChange={(event) => setQuery(event.target.value)}
							placeholder="Buscar lugar"
							className="h-10 min-w-0 flex-1 bg-transparent outline-none"
							autoFocus
						/>
					</div>
					<div className="max-h-64 overflow-y-auto overscroll-contain">
						{allowCustomValue &&
							query.trim() &&
							!matches.some(
								(place) =>
									place.name.toLowerCase() ===
									query.trim().toLowerCase(),
							) && (
								<button
									type="button"
									onClick={() =>
										select({ id: null, name: query.trim() })
									}
									className="mb-1 flex w-full items-center gap-2 rounded-lg bg-[var(--app-primary)] px-3 py-2 text-left text-[var(--app-primary-foreground)]"
								>
									<span className="grid size-4 place-items-center text-lg">
										+
									</span>
									<span className="truncate">
										Usar “{query.trim()}” como texto libre
									</span>
								</button>
							)}
						{matches.map((place) => (
							<button
								type="button"
								key={place.id}
								onClick={() => select(place)}
								className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left hover:bg-[var(--app-surface-muted)]"
							>
								<Check
									className={`size-4 ${value === place.name ? "opacity-100" : "opacity-0"}`}
								/>
								<span className="truncate">{place.name}</span>
							</button>
						))}
						{remote.isFetching && debouncedQuery && (
							<p className="p-3 text-center text-[var(--app-text-muted)]">
								Buscando lugares…
							</p>
						)}
						{!remote.isFetching && matches.length === 0 && (
							<p className="p-3 text-center text-[var(--app-text-muted)]">
								No se encontraron lugares.
							</p>
						)}
					</div>
				</Popover.Content>
			</Popover.Root>
		</label>
	);
}
