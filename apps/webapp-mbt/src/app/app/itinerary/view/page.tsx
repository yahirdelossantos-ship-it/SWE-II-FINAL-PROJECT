import { ServiceVisualization } from "@/features/itinerary/components/ServiceVisualization";
import { validOperationalDate } from "@/features/itinerary/date";

export default async function Page({
	searchParams,
}: {
	searchParams: Promise<{ date?: string }>;
}) {
	const params = await searchParams;
	return (
		<ServiceVisualization
			date={validOperationalDate(params.date ?? null)}
		/>
	);
}
