"use client";

import { CalendarPlus, FileCheckCorner, Save } from "lucide-react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { useState } from "react";

import { useNotifications } from "@/components/notifications";
import { Button, Dialog, fieldClass } from "@/components/ui";
import {
	type CreateServiceInput,
	type Option,
	useCreateService,
	useCreationOptions,
} from "@/features/itinerary/api";
import {
	isOperationalDateWritable,
	oldestWritableOperationalDate,
} from "@/features/itinerary/date";
import { PlaceCombobox } from "@/features/itinerary/components/PlaceCombobox";
import {
	airportSelectionOrDefault,
	findDefaultAirport,
	locationInput,
	type LocationSelection,
} from "@/features/itinerary/servicePlaces";
import {
	MessageParser,
	normalizeServiceDate,
	normalizeServiceTime,
} from "../utils/serviceMessageParser";

type ServiceFormValues = Omit<
	CreateServiceInput,
	| "pickupAt"
	| "pickup"
	| "dropoff"
	| "vehicle"
	| "code"
	| "flightCode"
	| "pickupDisplayName"
	| "dropoffDisplayName"
	| "allyId"
	| "note"
> & {
	time: string;
	code: string;
	luggage?: number;
	flightCode: string;
	pickup: LocationSelection;
	dropoff: LocationSelection;
	pickupDisplayName: string;
	dropoffDisplayName: string;
	allyId: string;
	vehicleId: string;
	note: string;
};

function defaultValues(date: string): ServiceFormValues {
	return {
		itineraryDate: date,
		time: "",
		type: "ARRIVAL",
		code: "",
		clientName: "",
		passengers: 1,
		luggage: undefined,
		flightCode: "",
		pickup: null,
		dropoff: null,
		pickupDisplayName: "",
		dropoffDisplayName: "",
		allyId: "",
		vehicleId: "",
		note: "",
	};
}

function normalized(value: string): string {
	return value
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.trim()
		.toLowerCase();
}

function findOptionByName(options: Option[], name: string) {
	const candidate = normalized(name);
	return options.find((option) => normalized(option.name) === candidate);
}

export function CreateServiceForm({ date }: { date: string }) {
	const [open, setOpen] = useState(false);
	const [parserOpen, setParserOpen] = useState(false);
	const [parserContent, setParserContent] = useState("");
	const [parsingErrors, setParsingErrors] = useState<string[]>([]);
	const [message, setMessage] = useState("");

	const options = useCreationOptions();
	const form = useForm<ServiceFormValues>({
		defaultValues: defaultValues(date),
	});
	const itineraryDate = useWatch({
		control: form.control,
		name: "itineraryDate",
	});
	const type = useWatch({ control: form.control, name: "type" });
	const code = useWatch({ control: form.control, name: "code" });
	const create = useCreateService(itineraryDate);
	const airports = options.data?.airports ?? [];
	const pickupRequiresAirport = type === "ARRIVAL";
	const dropoffRequiresAirport = type === "DEPARTURE";

	const notify = useNotifications((state) => state.addNotification);

	function openParser() {
		setParsingErrors([]);
		setParserOpen(true);
		setOpen(false);
		notify({
			type: "warning",
			title: "Data in the Form!",
			message: "Be careful, data present in the form can be overwritten.",
		});
	}

	// oh my glorious properly validated function
	function parseMessage() {
		if (!options.data) {
			setParsingErrors([
				"Todavía no se han cargado los aliados y vehículos disponibles.",
			]);
			return;
		}

		const parser = new MessageParser(
			parserContent,
			options.data.vehicles.map((vehicle) => vehicle.name),
		);

		const parsed = parser.initialize();
		const parsedDate = normalizeServiceDate(parsed.date);
		const parsedTime = normalizeServiceTime(parsed.pickupAt);
		const vehicle = findOptionByName(options.data.vehicles, parsed.vehicle);
		const errors = [...parser.warnings];

		if (parsedDate && !isOperationalDateWritable(parsedDate)) {
			errors.push(
				"La fecha establecida está fuera del rango de servicios editables. El itinerario es viejo y ya no se puede editar.",
			);
		}

		if (parsed.vehicle && !vehicle) {
			errors.push(
				`No se encontró el vehículo “${parsed.vehicle}” en la base de datos.`,
			);
		}

		let allyId = form.getValues("allyId");
		if (parsed.code) {
			const sacbe = options.data.allies.find((ally) =>
				normalized(ally.name).includes("sacbe"),
			);

			if (!sacbe) {
				errors.push(
					"El mensaje incluye un código de Sacbé, pero no se encontró ese aliado en la base de datos.",
				);
			} else {
				allyId = sacbe.id;
			}
		}

		if (errors.length || !parsedDate || !parsedTime || !vehicle) {
			setParsingErrors([...new Set(errors)]);
			return;
		}

		form.reset({
			...form.getValues(),
			itineraryDate: parsedDate,
			time: parsedTime,
			type: parsed.serviceType.toUpperCase() as CreateServiceInput["type"],
			code: parsed.code,
			clientName: parsed.name,
			passengers: parsed.passengers,
			pickupDisplayName: parsed.pickupDisplayName,
			dropoffDisplayName: parsed.dropoffDisplayName,
			flightCode: parsed.flightCode ?? "",
			vehicleId: vehicle.id,
			allyId,
		});

		setParsingErrors([]);
		setParserOpen(false);
		setOpen(true);
		notify({
			type: "success",
			title: "Campos actualizados",
			message:
				"Recuerda completar los campos faltantes antes de guardar el servicio.",
		});
	}

	const submit = form.handleSubmit(async (values) => {
		setMessage("");
		const pickupSelection = pickupRequiresAirport
			? airportSelectionOrDefault(values.pickup, airports)
			: values.pickup;
		const dropoffSelection = dropoffRequiresAirport
			? airportSelectionOrDefault(values.dropoff, airports)
			: values.dropoff;
		const pickupLocation = locationInput(pickupSelection);
		const dropoffLocation = locationInput(dropoffSelection);

		if (!pickupLocation || !dropoffLocation) {
			const errorMessage =
				"Selecciona manualmente los lugares de recogida y destino.";
			setMessage(errorMessage);
			notify({
				type: "error",
				title: "Faltan lugares",
				message: errorMessage,
			});
			return;
		}

		const input: CreateServiceInput = {
			itineraryDate: values.itineraryDate,
			code: values.code.trim() || undefined,
			type: values.type,
			clientName: values.clientName,
			pickupAt: `${values.itineraryDate}T${values.time}:00-04:00`,
			passengers: values.passengers,
			luggage: values.luggage,
			flightCode: values.flightCode.trim() || undefined,
			pickup: pickupLocation,
			dropoff: dropoffLocation,
			pickupDisplayName: values.pickupDisplayName.trim() || undefined,
			dropoffDisplayName: values.dropoffDisplayName.trim() || undefined,
			allyId: values.allyId || undefined,
			vehicle: values.vehicleId
				? { vehicleId: values.vehicleId }
				: undefined,
			note: values.note.trim() || undefined,
		};

		try {
			await create.mutateAsync(input);
			setMessage("Servicio creado correctamente.");
			notify({ type: "success", title: "Servicio creado" });
			form.reset({
				...defaultValues(date),
				pickup: findDefaultAirport(airports),
			});
			setParserContent("");
			setOpen(false);
		} catch (error) {
			const errorMessage =
				error instanceof Error
					? error.message
					: "No se pudo crear el servicio.";
			setMessage(errorMessage);
			notify({
				type: "error",
				title: "No se pudo crear el servicio",
				message: errorMessage,
			});
			setOpen(false);
		}
	});

	return (
		<>
			<Button
				className="w-auto"
				variant="primary"
				icon={<CalendarPlus />}
				onClick={() => setOpen(true)}
			>
				Nuevo servicio
			</Button>
			<Dialog
				open={open}
				onOpenChange={setOpen}
				title="Crear servicio"
				description="Añade un servicio desde cualquier sección de la plataforma."
				size="xl"
			>
				<form
					className="grid gap-4 sm:grid-cols-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
					onSubmit={submit}
				>
					<label className="space-y-1 text-sm">
						<span>Fecha</span>
						<input
							type="date"
							min={oldestWritableOperationalDate()}
							className={fieldClass}
							required
							{...form.register("itineraryDate")}
						/>
					</label>
					<label className="space-y-1 text-sm">
						<span>Hora</span>
						<input
							type="time"
							className={fieldClass}
							required
							{...form.register("time")}
						/>
					</label>
					<label className="space-y-1 text-sm">
						<span>Tipo</span>
						<select
							className={fieldClass}
							{...form.register("type")}
						>
							<option value="ARRIVAL">Llegada</option>
							<option value="DEPARTURE">Salida</option>
							<option value="TRANSFER">Traslado</option>
						</select>
					</label>
					<label className="space-y-1 text-sm">
						<span>Aliado</span>
						<select
							className={fieldClass}
							disabled={Boolean(code)}
							required
							{...form.register("allyId")}
						>
							<option value="">Seleccionar aliado</option>
							{options.data?.allies.map((item) => (
								<option key={item.id} value={item.id}>
									{item.name}
								</option>
							))}
						</select>
					</label>
					{code ? (
						<label className="space-y-1 text-sm sm:col-span-2">
							<span>Código externo</span>
							<input
								className={fieldClass}
								readOnly
								{...form.register("code")}
							/>
						</label>
					) : (
						<input type="hidden" {...form.register("code")} />
					)}
					<label className="space-y-1 text-sm sm:col-span-2">
						<span>Cliente</span>
						<input
							className={fieldClass}
							required
							{...form.register("clientName")}
						/>
					</label>
					<label className="space-y-1 text-sm">
						<span>Pasajeros</span>
						<input
							type="number"
							min="1"
							max="100"
							className={fieldClass}
							required
							{...form.register("passengers", {
								valueAsNumber: true,
							})}
						/>
					</label>
					<label className="space-y-1 text-sm">
						<span>Equipaje</span>
						<input
							type="number"
							min="0"
							max="20"
							className={fieldClass}
							{...form.register("luggage", {
								setValueAs: (value) =>
									value === "" ? undefined : Number(value),
							})}
						/>
					</label>
					<Controller
						name="pickup"
						control={form.control}
						render={({ field }) => (
							<PlaceCombobox
								name="pickup"
								label="Recogida"
								places={
									pickupRequiresAirport
										? airports
										: (options.data?.places ?? [])
								}
								value={
									pickupRequiresAirport
										? airportSelectionOrDefault(
												field.value,
												airports,
											)
										: field.value
								}
								placeKind={
									pickupRequiresAirport
										? "AIRPORT"
										: undefined
								}
								allowCustomValue={!pickupRequiresAirport}
								onSelectionChange={field.onChange}
							/>
						)}
					/>
					<Controller
						name="dropoff"
						control={form.control}
						render={({ field }) => (
							<PlaceCombobox
								name="dropoff"
								label="Destino"
								places={
									dropoffRequiresAirport
										? airports
										: (options.data?.places ?? [])
								}
								value={
									dropoffRequiresAirport
										? airportSelectionOrDefault(
												field.value,
												airports,
											)
										: field.value
								}
								placeKind={
									dropoffRequiresAirport
										? "AIRPORT"
										: undefined
								}
								allowCustomValue={!dropoffRequiresAirport}
								onSelectionChange={field.onChange}
							/>
						)}
					/>
					<label className="space-y-1 text-sm">
						<span>Nombre para documentos — Recogida</span>
						<input
							maxLength={160}
							className={fieldClass}
							placeholder="Opcional"
							{...form.register("pickupDisplayName")}
						/>
					</label>
					<label className="space-y-1 text-sm">
						<span>Nombre para documentos — Destino</span>
						<input
							maxLength={160}
							className={fieldClass}
							placeholder="Opcional"
							{...form.register("dropoffDisplayName")}
						/>
					</label>
					{type === "ARRIVAL" ? (
						<label className="space-y-1 text-sm">
							<span>Vuelo</span>
							<input
								className={fieldClass}
								{...form.register("flightCode")}
							/>
						</label>
					) : null}
					<label className="space-y-1 text-sm">
						<span>Vehículo</span>
						<select
							className={fieldClass}
							{...form.register("vehicleId")}
						>
							<option value="">Sin asignar</option>
							{options.data?.vehicles.map((item) => (
								<option key={item.id} value={item.id}>
									{item.name}
								</option>
							))}
						</select>
					</label>
					<label className="space-y-1 text-sm sm:col-span-2">
						<span>Nota</span>
						<textarea
							rows={3}
							className={`${fieldClass} h-auto py-3`}
							{...form.register("note")}
						/>
					</label>
					{message ? (
						<p
							role="status"
							className="rounded-xl bg-[var(--app-surface-muted)] p-3 text-sm sm:col-span-2"
						>
							{message}
						</p>
					) : null}
					<div className="flex justify-between gap-3 sm:col-span-2">
						<Button
							type="button"
							className="w-auto"
							variant="outline"
							icon={<FileCheckCorner />}
							onClick={() => {
								openParser();
							}}
						>
							Autocompletar desde mensaje
						</Button>
						<Button
							className="w-auto"
							type="submit"
							variant="primary"
							icon={<Save />}
							isLoading={create.isPending}
						>
							Guardar servicio
						</Button>
					</div>
				</form>
			</Dialog>

			<Dialog
				open={parserOpen}
				onOpenChange={(nextOpen) => {
					setParserOpen(nextOpen);
					if (!nextOpen) setOpen(true);
				}}
				title="Relleno automático"
				description="Valida un mensaje y añade la información disponible al formulario."
				size="xl"
			>
				<textarea
					value={parserContent}
					placeholder={MessageParser.arrivalExample}
					rows={14}
					className={`${fieldClass} h-auto resize-y py-3`}
					onChange={(event) => setParserContent(event.target.value)}
				/>
				{parsingErrors.length ? (
					<div className="mt-3 rounded-xl bg-amber-500/10 p-3 text-sm text-amber-700">
						<p className="font-semibold">Avisos:</p>
						<ul className="mt-1 list-disc space-y-1 pl-5">
							{parsingErrors.map((error) => (
								<li key={error}>{error}</li>
							))}
						</ul>
					</div>
				) : null}
				<footer className="mt-4 flex justify-end">
					<Button
						type="button"
						className="w-auto"
						variant="outline"
						icon={<FileCheckCorner />}
						disabled={options.isPending || !parserContent.trim()}
						onClick={parseMessage}
					>
						Validar y aplicar
					</Button>
				</footer>
			</Dialog>
		</>
	);
}
