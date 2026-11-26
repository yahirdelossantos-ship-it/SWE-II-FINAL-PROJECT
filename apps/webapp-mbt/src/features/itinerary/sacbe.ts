import type { ImportRow } from "./api";

const headers: Record<string, string> = {
	tipo: "type",
	código: "code",
	codigo: "code",
	cliente: "clientName",
	pickup: "pickupAt",
	pu: "pickupAt",
	vuelo: "flightCode",
	pax: "passengers",
	desde: "pickup",
	hacia: "dropoff",
	notas: "notes",
	comentarios: "notes",
	vehículo: "vehicle",
	vehiculo: "vehicle",
};

function sheetName(date: string) {
	const [year, month, day] = date.split("-");
	return `${day}${month}${year.slice(-2)}`;
}

function pickupAt(value: string, date: string) {
	const match = value
		.trim()
		.match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)?/i);
	if (!match) return "";
	let hour = Number(match[1]);
	const period = match[3]?.toUpperCase();
	if (period === "PM" && hour !== 12) hour += 12;
	if (period === "AM" && hour === 12) hour = 0;
	return `${date}T${String(hour).padStart(2, "0")}:${match[2]}:00-04:00`;
}

export async function parseSacbeFile(
	file: File,
	date: string,
): Promise<ImportRow[]> {
	const XLSX = await import("xlsx");
	const workbook = XLSX.read(await file.arrayBuffer(), { type: "array" });
	const expected = sheetName(date);
	const actual = workbook.SheetNames.find(
		(name) => name.replace(/\s/g, "") === expected,
	);
	if (!actual)
		throw new Error(
			`No se encontró la hoja ${expected} para la fecha seleccionada.`,
		);
	const rows = XLSX.utils.sheet_to_json<unknown[]>(workbook.Sheets[actual], {
		header: 1,
		raw: false,
	});
	if (rows.length < 3)
		throw new Error(
			"La hoja no contiene encabezados y servicios suficientes.",
		);
	const columns = (rows[1] ?? []).map(
		(value) =>
			headers[
				String(value ?? "")
					.toLowerCase()
					.trim()
			],
	);
	return rows
		.slice(2)
		.filter(
			(row) =>
				Array.isArray(row) &&
				row.some((cell) => String(cell ?? "").trim()),
		)
		.map((row) => {
			const values: Record<string, string> = {};
			row.forEach((cell, index) => {
				const field = columns[index];
				if (field) values[field] = String(cell ?? "").trim();
			});
			const typeValue = values.type?.toLowerCase() ?? "";
			const type =
				typeValue.includes("llegada") || typeValue.includes("arrival")
					? "ARRIVAL"
					: typeValue.includes("salida") ||
						  typeValue.includes("departure")
						? "DEPARTURE"
						: "TRANSFER";
			const time = pickupAt(values.pickupAt ?? "", date);
			const passengers =
				Number.parseInt(values.passengers ?? "", 10) || 0;
			const errors = [
				...(!values.code ? ["Código ausente"] : []),
				...(!values.clientName ? ["Cliente ausente"] : []),
				...(!time ? ["Hora inválida"] : []),
				...(passengers < 1 ? ["Cantidad de pasajeros inválida"] : []),
				...(!values.pickup ? ["Lugar de recogida ausente"] : []),
				...(!values.dropoff ? ["Destino ausente"] : []),
			];
			return {
				code: values.code ?? "",
				type,
				clientName: values.clientName ?? "",
				pickupAt: time || `${date}T12:00:00-04:00`,
				flightCode: values.flightCode || undefined,
				passengers,
				pickup: { name: values.pickup ?? "" },
				dropoff: { name: values.dropoff ?? "" },
				vehicle: values.vehicle ? { name: values.vehicle } : undefined,
				errors,
				alreadyExists: false,
			};
		});
}
