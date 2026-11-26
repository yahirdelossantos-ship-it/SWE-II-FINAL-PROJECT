export type ParsedService = {
	date: string;
	code: string;
	vehicle: string;
	serviceType: "departure" | "transfer" | "arrival";
	name: string;
	passengers: number;
	pickupAt: string;
	pickupDisplayName: string;
	dropoffDisplayName: string;
	flightCode?: string;
};

function normalized(value: string): string {
	return value
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.trim()
		.toLowerCase();
}

function validDateParts(year: number, month: number, day: number): boolean {
	const date = new Date(Date.UTC(year, month - 1, day));
	return (
		date.getUTCFullYear() === year &&
		date.getUTCMonth() === month - 1 &&
		date.getUTCDate() === day
	);
}

export function normalizeServiceDate(value: string): string | null {
	const iso = value.trim().match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
	const local = value.trim().match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
	const parts = iso
		? [Number(iso[1]), Number(iso[2]), Number(iso[3])]
		: local
			? [Number(local[3]), Number(local[2]), Number(local[1])]
			: null;
	if (!parts || !validDateParts(parts[0], parts[1], parts[2])) return null;
	return parts
		.map((part, index) => String(part).padStart(index ? 2 : 4, "0"))
		.join("-");
}

export function normalizeServiceTime(value: string): string | null {
	const match = value
		.trim()
		.match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*(am|pm)?$/i);
	if (!match) return null;
	let hour = Number(match[1]);
	const minute = Number(match[2]);
	const period = match[3]?.toLowerCase();
	if (
		minute > 59 ||
		hour > (period ? 12 : 23) ||
		hour < 0 ||
		(period && hour < 1)
	)
		return null;
	if (period === "pm" && hour !== 12) hour += 12;
	if (period === "am" && hour === 12) hour = 0;
	return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

/**
 * Uses a 'cue' approach to determine which attribute we
 * are actually looking for.
 */
export class MessageParser {
	private msg: string[] = [];
	private parsingWarnings: string[] = [];
	private vehicleNames: string[] = [];

	// all common vehicle cues, analysed with 2k+ services
	private vehicleCues = [
		"k5",
		"h-1",
		"kia",
		"luxury",
		"sonata",
		"hyundai",
		"transportation",
	];

	constructor(msg: string, vehicleNames: string[] = []) {
		const normalizedMessage = msg
			.split(/\r?\n/)
			.map((ln) => ln.trim())
			.filter(Boolean);

		this.msg = normalizedMessage;
		this.vehicleNames = vehicleNames;
	}

	public initialize(): ParsedService {
		const service: ParsedService = {
			date: "",
			serviceType: "departure",
			code: "",
			name: "",
			passengers: 0,
			vehicle: "",
			pickupAt: "",
			pickupDisplayName: "",
			dropoffDisplayName: "",
		};

		service.date = this.getValue(["fecha:"], true) ?? "";
		service.name = this.getValue(["nombre:"], true) ?? "";

		service.serviceType = this.getValue(["llegada"])
			? "arrival"
			: this.getValue(["traslado", "transfer"])
				? "transfer"
				: "departure";

		service.pickupAt = this.getValue(["hora:"], true) ?? "";
		service.pickupDisplayName = this.getValue(["desde:"], true) ?? "";
		service.dropoffDisplayName = this.getValue(["hacia:"], true) ?? "";
		service.vehicle = this.getVehicleName();
		service.flightCode = this.getValue(["vuelo:"], true) || undefined;

		const pax = this.getValue(["pax"], true) ?? "";
		service.passengers = Number(pax) ? Number(pax) : 0;

		// Only external Sacbé codes are accepted from the pasted message. When a
		// code is absent, the API generates one from the manually selected ally.
		service.code = this.getCode();

		this.parsingWarnings = this.validateParsedService(service);

		return service;
	}

	private validateParsedService(service: ParsedService): string[] {
		const warnings: string[] = [];

		// if needed, harder warnings per-value can be added with specific regexp.
		// That is not exactly needed right now so we will just keep it simple.
		const required = {
			date: service.date,
			serviceType: service.serviceType,
			name: service.name,
			passengers: service.passengers,
			vehicle: service.vehicle,
			pickupAt: service.pickupAt,
			pickupDisplayName: service.pickupDisplayName,
			dropoffDisplayName: service.dropoffDisplayName,
		};
		Object.entries(required).forEach(([k, v]) => {
			if (!v) {
				warnings.push(`Value of "${k}" was not found in the message.`);
			}
		});
		if (!normalizeServiceDate(service.date))
			warnings.push("The service date is invalid.");
		if (!normalizeServiceTime(service.pickupAt))
			warnings.push("The pickup time is invalid.");
		return warnings;
	}

	private getVehicleName(): string {
		const knownVehicle = this.vehicleNames.find((vehicleName) => {
			const candidate = normalized(vehicleName);
			return this.msg.some(
				(line) =>
					normalized(line) === candidate ||
					normalized(line).includes(candidate),
			);
		});
		return knownVehicle ?? this.getValue(this.vehicleCues) ?? "";
	}

	private getCode(): string {
		const code = this.msg.find((line) =>
			/^puj(?:-[a-z0-9]+)+$/i.test(line),
		);
		return code?.toUpperCase() ?? "";
	}

	/**
	 * This instead of regex for this use case. Looks for a line
	 * in a line-split string that matches any cue from an array of cues.
	 * Supports substracting the cue from the line.
	 **/
	private getValue(cues: string[], cut = false): string | undefined {
		for (const line of this.msg) {
			for (const cue of cues) {
				const index = line.toLowerCase().indexOf(cue.toLowerCase());
				if (index >= 0) {
					return cut
						? `${line.slice(0, index)}${line.slice(index + cue.length)}`.trim()
						: line.trim();
				}
			}
		}
		return undefined;
	}

	get warnings(): string[] {
		return this.parsingWarnings;
	}

	static get arrivalExample(): string {
		return `
PUJ-PCAT-28325 
Desde: Punta Cana Airport 
Nombre: Karol Galaszkiewicz 
Hacia: Bahia Principe Escape Ambar
Kia K5 
2 pax
LLEGADA
Fecha: 2030-08-29 
Hora: 17:00 
Vuelo: Discover 4Y002 
		`.trim();
	}

	static get departureExample(): string {
		return `
SALIDA
Desde: Hotel Riu Bambu (Punta Gorda) 
PUJ-PCATX-28318 
Hacia: Punta Cana Airport PUJ (Airport (PUJ))
nombre: Alexander Pascuas Cortes 
Hora: 08:20 
Hyundai i20 
2 Pax 
Fecha: 2030-08-29 
		`.trim();
	}
}
