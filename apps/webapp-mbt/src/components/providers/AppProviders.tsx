"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { EntryGate } from "@/components/layout/EntryGate";
import { Notifications } from "@/components/notifications";
export function AppProviders({ children }: { children: React.ReactNode }) {
	const [client] = useState(
		() =>
			new QueryClient({
				defaultOptions: {
					queries: { staleTime: 30_000, refetchOnWindowFocus: false },
				},
			}),
	);
	return (
		<QueryClientProvider client={client}>
			<EntryGate>{children}</EntryGate>
			<Notifications />
		</QueryClientProvider>
	);
}
