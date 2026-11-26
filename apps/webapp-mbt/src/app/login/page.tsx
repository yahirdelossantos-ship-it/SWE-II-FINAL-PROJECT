import Image from "next/image";
import { redirect } from "next/navigation";
import logo from "@/assets/LOGO/LOGO.webp";
import mark from "@/assets/LOGO/LOGO-MARK.webp";
import { LoginForm } from "@/features/auth/components/LoginForm";
import { getCurrentEmployee } from "@/lib/session";
export default async function LoginPage() {
	if (await getCurrentEmployee()) redirect("/app/itinerary/view");
	return (
		<main className="grid min-h-screen bg-[var(--app-page)] lg:grid-cols-[1.08fr_0.92fr]">
			<section className="relative hidden overflow-hidden bg-[linear-gradient(145deg,var(--app-hero-from),var(--app-hero-via)_60%,var(--app-hero-to))] lg:flex lg:items-center lg:justify-center">
				<div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(255,255,255,.2),transparent_32%),radial-gradient(circle_at_75%_80%,rgba(255,255,255,.12),transparent_30%)]" />
				<Image
					src={mark}
					alt=""
					className="relative w-52 drop-shadow-2xl"
					priority
				/>
			</section>
			<section className="flex items-center justify-center px-6 py-12 sm:px-10">
				<div className="w-full max-w-md">
					<Image
						src={logo}
						alt="MB Transfer"
						className="mb-12 h-auto w-64"
						priority
					/>
					<LoginForm />
				</div>
			</section>
		</main>
	);
}
