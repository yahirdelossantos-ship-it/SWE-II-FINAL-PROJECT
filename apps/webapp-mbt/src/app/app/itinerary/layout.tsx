import { ItineraryDatePicker } from "@/features/itinerary/components/ItineraryDatePicker";

export default function ItineraryLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<>
			<div className="mb-4 flex md:hidden">
				<div className="rounded-full border border-[var(--app-border)] bg-[var(--app-surface-muted)]">
					<ItineraryDatePicker />
				</div>
			</div>
			{children}
		</>
	);
}
