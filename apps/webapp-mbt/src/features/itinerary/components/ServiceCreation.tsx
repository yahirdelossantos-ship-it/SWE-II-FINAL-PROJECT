"use client";
import Image, { type StaticImageData } from "next/image";
import { useRef, useState } from "react";
import {
	ArrowRight,
	Database,
	FileSpreadsheet,
	Info,
	Upload,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import sacbe from "@/assets/THEME/websites/ST.webp";
import {
	isOperationalDateWritable,
	oldestWritableOperationalDate,
} from "../date";
import {
	type ImportRow,
	markExistingImportRows,
	useCreationOptions,
	useSaveImport,
} from "../api";
import { parseSacbeFile } from "../sacbe";

function SourceCard({
	image,
	title,
	description,
	action,
	icon,
	onClick,
	disabled,
}: {
	image: StaticImageData;
	title: string;
	description: string;
	action: string;
	icon: React.ReactNode;
	onClick: () => void;
	disabled?: boolean;
}) {
	return (
		<article className="group flex w-full flex-col overflow-hidden rounded-2xl border border-[var(--app-border)]/45 bg-[var(--app-surface)]/42 shadow-sm backdrop-blur-md transition duration-300 hover:-translate-y-0.5 hover:border-[var(--app-primary)]/25 hover:bg-[var(--app-surface)]/58 hover:shadow-xl md:flex-row">
			<div className="relative min-h-44 overflow-hidden md:min-h-48 md:w-72 md:shrink-0">
				<Image
					src={image}
					alt=""
					fill
					className="object-cover transition duration-500 group-hover:scale-[1.03]"
					sizes="(max-width: 768px) 100vw, 288px"
				/>
				<div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
			</div>
			<div className="flex flex-1 flex-col justify-center gap-5 p-6 md:flex-row md:items-center md:justify-between md:px-8">
				<div>
					<h2 className="text-xl font-semibold">{title}</h2>
					<p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--app-text-muted)]">
						{description}
					</p>
				</div>
				<Button
					type="button"
					variant="primaryOutline"
					onClick={onClick}
					disabled={disabled}
					icon={icon}
					rightIcon={<ArrowRight className="size-4" />}
					className="md:w-auto md:min-w-48"
				>
					{action}
				</Button>
			</div>
		</article>
	);
}

function EmptyImportNotice({ children }: { children: React.ReactNode }) {
	return (
		<div
			role="status"
			className="mt-5 flex items-start gap-3 rounded-xl border border-[var(--app-primary)]/15 bg-[color-mix(in_srgb,var(--app-primary)_6%,var(--app-surface))]/60 p-4 text-sm text-[var(--app-text-muted)]"
		>
			<Info className="mt-0.5 size-4 shrink-0 text-[var(--app-primary)]" />
			<p>{children}</p>
		</div>
	);
}

function SacbeWorkflow({ date }: { date: string }) {
	const input = useRef<HTMLInputElement>(null);
	const options = useCreationOptions();
	const save = useSaveImport(date);
	const [rows, setRows] = useState<ImportRow[]>([]);
	const [message, setMessage] = useState("");
	const [loading, setLoading] = useState(false);
	const ally = options.data?.allies.find((item) =>
		item.name
			.toLowerCase()
			.normalize("NFD")
			.replace(/[\u0300-\u036f]/g, "")
			.includes("sacbe"),
	);
	async function load(file?: File) {
		if (!file) return;
		setLoading(true);
		setMessage("");
		try {
			const parsed = await parseSacbeFile(file, date);
			setRows(await markExistingImportRows(parsed));
			setMessage(`${parsed.length} filas procesadas desde ${file.name}.`);
		} catch (error) {
			setRows([]);
			setMessage(
				error instanceof Error
					? error.message
					: "No se pudo procesar el archivo.",
			);
		} finally {
			setLoading(false);
		}
	}
	async function saveRows() {
		if (!ally) {
			setMessage("No se encontró un aliado Sacbé registrado.");
			return;
		}
		const result = await save.mutateAsync({ rows, allyId: ally.id });
		setMessage(
			`${result.created} creados, ${result.skipped} omitidos${result.errors.length ? `, ${result.errors.length} errores` : ""}.`,
		);
		setRows(await markExistingImportRows(rows));
	}
	return (
		<div>
			<input
				ref={input}
				type="file"
				accept=".xlsx,.xls"
				className="hidden"
				onChange={(event) => load(event.target.files?.[0])}
			/>
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<p className="text-xs font-semibold uppercase tracking-wider text-[var(--app-primary)]">
						Sacbé
					</p>
					<h2 className="mt-1 text-xl font-semibold">
						Revisión de servicios
					</h2>
					<p className="mt-1 text-sm text-[var(--app-text-muted)]">
						Se utiliza la hoja correspondiente a {date}; los códigos
						existentes se omiten.
					</p>
				</div>
				<div className="flex gap-2">
					<Button
						size="sm"
						icon={<Upload />}
						isLoading={loading}
						onClick={() => input.current?.click()}
					>
						Seleccionar XLSX
					</Button>
					<Button
						size="sm"
						variant="primary"
						icon={<Database />}
						isLoading={save.isPending}
						disabled={!rows.length}
						onClick={saveRows}
					>
						Guardar nuevos
					</Button>
				</div>
			</div>
			{message && (
				<p
					role="status"
					className="mt-4 rounded-xl bg-[var(--app-surface)] p-3 text-sm"
				>
					{message}
				</p>
			)}
			{rows.length === 0 && !loading && !message && (
				<EmptyImportNotice>
					Todavía no hay servicios para revisar. Selecciona el archivo
					XLSX de Sacbé para esta fecha.
				</EmptyImportNotice>
			)}
			{rows.length > 0 && (
				<div className="mt-4 overflow-x-auto rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)]">
					<table className="w-full min-w-[760px] text-sm">
						<thead className="bg-[var(--app-surface-muted)] text-left">
							<tr>
								<th className="p-3">Código</th>
								<th className="p-3">Cliente</th>
								<th className="p-3">Hora</th>
								<th className="p-3">PAX</th>
								<th className="p-3">Recogida</th>
								<th className="p-3">Destino</th>
								<th className="p-3">Estado</th>
							</tr>
						</thead>
						<tbody>
							{rows.map((row, index) => (
								<tr
									key={`${row.code}-${index}`}
									className="border-t border-[var(--app-border)]"
								>
									<td className="p-3 font-medium">
										{row.code || "—"}
									</td>
									<td className="p-3">
										{row.clientName || "—"}
									</td>
									<td className="p-3">
										{new Date(
											row.pickupAt,
										).toLocaleTimeString("es-DO", {
											hour: "numeric",
											minute: "2-digit",
										})}
									</td>
									<td className="p-3">{row.passengers}</td>
									<td className="p-3">{row.pickup.name}</td>
									<td className="p-3">{row.dropoff.name}</td>
									<td className="p-3">
										{row.alreadyExists ? (
											<span className="rounded-full bg-amber-500/15 px-2 py-1 text-xs">
												Omitido
											</span>
										) : row.errors.length ? (
											<span
												className="rounded-full bg-red-500/15 px-2 py-1 text-xs"
												title={row.errors.join(", ")}
											>
												Inválido
											</span>
										) : (
											<span className="rounded-full bg-emerald-500/15 px-2 py-1 text-xs">
												Nuevo
											</span>
										)}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}
		</div>
	);
}

export function ServiceCreation({ date }: { date: string }) {
	const [open, setOpen] = useState(false);
	const writable = isOperationalDateWritable(date);
	return (
		<div className="mt-6 space-y-6">
			{!writable && (
				<div
					role="alert"
					className="rounded-2xl border border-amber-400/40 bg-amber-400/10 p-4 text-sm"
				>
					<strong>Itinerario bloqueado.</strong> Solo se pueden
					modificar itinerarios desde{" "}
					{oldestWritableOperationalDate()} en adelante.
				</div>
			)}
			<div className="space-y-5">
				<SourceCard
					image={sacbe}
					title="Sacbé"
					description="Carga el archivo XLSX, valida sus filas y guarda únicamente los servicios nuevos."
					action="Cargar XLSX"
					icon={<FileSpreadsheet />}
					disabled={!writable}
					onClick={() => setOpen(true)}
				/>
			</div>
			<Dialog
				open={open}
				onOpenChange={setOpen}
				title="Importar servicios de Sacbé"
				size="xl"
			>
				<SacbeWorkflow date={date} />
			</Dialog>
		</div>
	);
}
