export const OPERATIONAL_TIME_ZONE = "America/Santo_Domingo";

export function operationalToday() {
	return new Intl.DateTimeFormat("en-CA", {
		timeZone: OPERATIONAL_TIME_ZONE,
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	}).format(new Date());
}

export function validOperationalDate(value: string | null) {
	return /^\d{4}-\d{2}-\d{2}$/.test(value ?? "")
		? value!
		: operationalToday();
}

export function localDate(value: string) {
	const [year, month, day] = value.split("-").map(Number);
	return new Date(year, month - 1, day);
}

export function ymd(value: Date) {
	return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`;
}

export function oldestWritableOperationalDate() {
	const value = localDate(operationalToday());
	value.setDate(value.getDate() - 1);
	return ymd(value);
}

export function isOperationalDateWritable(value: string) {
	return value >= oldestWritableOperationalDate();
}
