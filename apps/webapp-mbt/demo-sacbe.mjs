import { fileURLToPath } from "node:url";

import XLSX from "xlsx";

const today = new Intl.DateTimeFormat("sv-SE", {
	timeZone: "America/Santo_Domingo",
	year: "numeric",
	month: "2-digit",
	day: "2-digit",
}).format(new Date());

const date = process.argv[2] ?? today;
const parsed = new Date(`${date}T00:00:00Z`);
if (
	!/^\d{4}-\d{2}-\d{2}$/.test(date) ||
	Number.isNaN(parsed.getTime()) ||
	parsed.toISOString().slice(0, 10) !== date
) {
	console.error("Indica una fecha con el formato AAAA-MM-DD.");
	process.exit(1);
}

const [year, month, day] = date.split("-");
const sheet = XLSX.utils.aoa_to_sheet([
	["Sacbé · datos ficticios de demostración"],
	[
		"Tipo",
		"Código",
		"Cliente",
		"Pickup",
		"PAX",
		"Desde",
		"Hacia",
		"Vehículo",
	],
	[
		"Llegada",
		`DEMO-SACBE-001-${year}${month}${day}`,
		"Cliente Demo Uno",
		"09:30",
		2,
		"PUJ",
		"Hotel Costa del Sol (demo)",
		"Miniván de demostración",
	],
	[
		"Llegada",
		`DEMO-IMPORT-${year}${month}${day}`,
		"Cliente Demo Cuatro",
		"10:45",
		3,
		"PUJ",
		"Resort Brisa Caribe (demo)",
		"Miniván de demostración",
	],
	[
		"Salida",
		"DEMO-INVALIDO",
		"Cliente Demo Cinco",
		"Sin hora",
		0,
		"Hotel Costa del Sol (demo)",
		"PUJ",
		"Miniván de demostración",
	],
]);

const workbook = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(
	workbook,
	sheet,
	`${day}${month}${year.slice(-2)}`,
);
const output = fileURLToPath(new URL("../../sacbe-demo.xlsx", import.meta.url));
XLSX.writeFile(workbook, output);
console.log(`sacbe-demo.xlsx · fecha operativa ${date}`);
