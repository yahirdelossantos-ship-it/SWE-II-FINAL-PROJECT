import type { Metadata } from "next";
import { ThemeScript } from "@/components/theme/ThemeScript";
import "./globals.css";

export const metadata: Metadata = {
	metadataBase: new URL(
		process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
	),
	title: { default: "Plataforma MBT", template: "%s | Plataforma MBT" },
	description: "Plataforma operacional de MB Transfer",
};
export default function RootLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<html lang="es" suppressHydrationWarning>
			<head>
				<ThemeScript />
			</head>
			<body>{children}</body>
		</html>
	);
}
