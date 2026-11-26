import { HoursVisualization } from "@/features/itinerary/components/HoursVisualization";
import { validOperationalDate } from "@/features/itinerary/date";

export default async function Page({
	searchParams,
}: {
	searchParams: Promise<{ date?: string }>;
}) {
	const params = await searchParams;
	return (
		<HoursVisualization date={validOperationalDate(params.date ?? null)} />
	);
}
