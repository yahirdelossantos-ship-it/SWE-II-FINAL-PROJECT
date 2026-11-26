import { redirect } from "next/navigation";
import { AppProviders } from "@/components/providers/AppProviders";
import { Shell } from "@/components/layout/Shell";
import { getCurrentEmployee } from "@/lib/session";
export default async function PlatformLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const employee = await getCurrentEmployee();
	if (!employee) redirect("/login");
	return (
		<AppProviders>
			<Shell employee={employee}>{children}</Shell>
		</AppProviders>
	);
}
