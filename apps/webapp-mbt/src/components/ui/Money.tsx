export function Money({
	amount,
	currency,
}: {
	amount: number | string;
	currency: string;
}) {
	return new Intl.NumberFormat("es-DO", {
		style: "currency",
		currency,
	}).format(Number(amount));
}
