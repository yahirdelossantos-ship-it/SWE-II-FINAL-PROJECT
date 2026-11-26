import { ServiceCreation } from "@/features/itinerary/components/ServiceCreation";
import { validOperationalDate } from "@/features/itinerary/date";
export default async function CreatePage({
	searchParams,
}: {
	searchParams: Promise<{ date?: string }>;
}) {
	const params = await searchParams;
	const date = validOperationalDate(params.date ?? null);
	return (
		<section>
			<div className="flex flex-col gap-4 border-b border-[var(--app-border)] pb-5 sm:flex-row sm:items-center sm:justify-between">
				<h1 className="text-2xl font-semibold">
					Importar servicios de Sacbé
				</h1>
			</div>
			<ServiceCreation date={date} />
		</section>
	);
}
