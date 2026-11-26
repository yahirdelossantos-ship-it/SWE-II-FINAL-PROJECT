"use client";
import { useEffect } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import * as Avatar from "@radix-ui/react-avatar";
import Image from "next/image";

import { LogOut, Menu, Moon, PanelLeftClose, Sun } from "lucide-react";

import { cn } from "@/utils/cn";

import { useRouter } from "next/navigation";
import type { Employee } from "@/lib/api/contracts";
import { useTheme } from "@/hooks/use-theme";
import mark from "@/assets/LOGO/LOGO-MARK.webp";
import { ItineraryDatePicker } from "@/features/itinerary/components/ItineraryDatePicker";
import { usePathname } from "next/navigation";
import { appApi } from "@/lib/api/client";
import { backgrounds, type BackgroundId } from "./backgrounds";

type Env = "production" | "staging" | "development" | "test";

export function Header({
	employee,
	onMenu,
	collapsed,
	onCollapse,
	background,
	onBackground,
}: {
	employee: Employee;
	onMenu: () => void;
	collapsed: boolean;
	onCollapse: () => void;
	background: BackgroundId;
	onBackground: (background: BackgroundId) => void;
}) {
	const { theme, toggleTheme } = useTheme();
	const router = useRouter();
	const pathname = usePathname();

	const environment: Env = (process.env.NEXT_PUBLIC_ENV ||
		process.env.NODE_ENV ||
		null) as Env;
	const envToolTipMsj: Record<Env, { desc: string; cn: string }> = {
		development: {
			desc: "This is the development environment. Hot-reloaded to show immediate source code changes.",
			cn: "border border-yellow-200/20 bg-[color-mix(in_srgb,yellow_40%,transparent)] ",
		},
		staging: {
			desc: "This is the staging environment. Here test users are expected to check new features and try to find bugs.",
			cn: "border border-yellow-200/20 bg-[color-mix(in_srgb,red_40%,transparent)]",
		},
		test: {
			desc: "This is the staging environment. Here test users are expected to check new features and try to find bugs.",
			cn: "border border-yellow-200/20 bg-[color-mix(in_srgb,red_40%,transparent)]",
		},
		production: {
			desc: "This is the production environment. Every change made here directly affects the production database.",
			cn: "border border-white/20 bg-[color-mix(in_srgb,var(--app-surface)_40%,transparent)] ",
		},
	};

	useEffect(() => {
		console.log(process.env.HELLO);
		console.log(process.env.VERCEL_ENV);
	});

	async function logout() {
		await fetch("/api/session/logout", { method: "POST" });
		router.push("/login");
		router.refresh();
	}
	async function selectBackground(next: BackgroundId) {
		const previous = background;
		onBackground(next);
		try {
			await appApi("/auth/preferences", {
				method: "PATCH",
				body: JSON.stringify({ background: next }),
			});
		} catch {
			onBackground(previous);
		}
	}
	return (
		<header className="flex h-20 items-center gap-3 px-3 sm:px-5">
			<div className="flex h-12 shrink-0 items-center gap-2 rounded-full bg-[color-mix(in_srgb,var(--app-surface)_40%,transparent)] px-2 shadow-lg backdrop-blur">
				<button
					onClick={onMenu}
					className="rounded-full p-2 hover:bg-[var(--app-surface-muted)] lg:hidden"
					aria-label="Abrir menú"
				>
					<Menu className="size-5" />
				</button>
				<button
					onClick={onCollapse}
					className="hidden rounded-full p-2 hover:bg-[var(--app-surface-muted)] lg:block"
					aria-label={collapsed ? "Expandir menú" : "Colapsar menú"}
				>
					<PanelLeftClose
						className={`size-5 transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`}
					/>
				</button>
				<Image
					src={mark}
					alt=""
					className="size-8 shrink-0 object-contain"
					priority
				/>
				<span className="hidden pr-2 text-sm font-bold sm:inline">
					MB Transfer
				</span>
			</div>
			<div>
				{environment && (
					<div
						className={cn([
							"relative flex h-12 items-center gap-2 overflow-hidden rounded-full px-3 text-sm font-semibold shadow-lg backdrop-blur transition hover:-translate-y-0.5 sm:px-4",
							envToolTipMsj[environment].cn,
						])}
						title={envToolTipMsj[environment].desc}
					>
						{environment[0].toUpperCase()}
						{environment.slice(1)}
					</div>
				)}
			</div>
			{pathname.startsWith("/app/itinerary/") && (
				<div className="hidden min-w-0 flex-1 justify-center md:flex">
					<div className="rounded-full bg-[color-mix(in_srgb,var(--app-surface)_40%,transparent)] shadow-lg backdrop-blur">
						<ItineraryDatePicker />
					</div>
				</div>
			)}
			<div className="ml-auto flex h-12 items-center gap-2 rounded-full bg-[color-mix(in_srgb,var(--app-surface)_40%,transparent)] px-2 shadow-lg backdrop-blur sm:gap-4 sm:px-3">
				<button
					onClick={toggleTheme}
					className="grid size-9 place-items-center rounded-full hover:bg-[var(--app-surface-muted)]"
					aria-label="Cambiar tema"
				>
					{theme === "dark" ? (
						<Sun className="size-4" />
					) : (
						<Moon className="size-4" />
					)}
				</button>
				<div className="h-[80%] w-[1px] bg-[var(--app-text-muted)]/40" />
				<div className="hidden min-w-28 text-right sm:block">
					<p className="text-sm font-semibold">{employee.name}</p>
					<p className="text-xs text-[var(--app-text-muted)]">
						{employee.role}
					</p>
				</div>
				<DropdownMenu.Root>
					<DropdownMenu.Trigger className="outline-none">
						<Avatar.Root className="grid size-10 place-items-center overflow-hidden rounded-full bg-[var(--app-primary)] text-[var(--app-primary-foreground)]">
							<Avatar.Image
								src={employee.photo ?? undefined}
								className="size-full object-cover"
							/>
							<Avatar.Fallback>
								{employee.name.slice(0, 1).toUpperCase()}
							</Avatar.Fallback>
						</Avatar.Root>
					</DropdownMenu.Trigger>
					<DropdownMenu.Portal>
						<DropdownMenu.Content
							align="end"
							className="z-50 min-w-56 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)]/90 p-2 shadow-xl"
						>
							<div className="px-3 py-2 sm:hidden">
								<p className="font-semibold">{employee.name}</p>
								<p className="text-xs text-[var(--app-text-muted)]">
									{employee.role}
								</p>
							</div>
							<DropdownMenu.Label className="px-3 pb-2 pt-1 text-xs font-semibold uppercase tracking-wider text-[var(--app-text-muted)]">
								Fondo
							</DropdownMenu.Label>
							<div className="grid grid-cols-3 gap-2 px-2 pb-2">
								{backgrounds.map((item) => (
									<button
										key={item.id}
										type="button"
										onClick={() =>
											selectBackground(item.id)
										}
										className={`overflow-hidden rounded-lg border-2 text-left ${background === item.id ? "border-[var(--app-primary)]" : "border-transparent"}`}
										title={item.label}
									>
										<Image
											src={item.image}
											alt=""
											className="h-12 w-full object-cover"
										/>
										<span className="block truncate px-1 py-1 text-center text-[10px]">
											{item.label}
										</span>
									</button>
								))}
							</div>
							<DropdownMenu.Separator className="my-1 h-px bg-[var(--app-border)]" />
							<DropdownMenu.Item
								onSelect={logout}
								className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm outline-none hover:bg-[var(--app-surface-muted)]"
							>
								<LogOut className="size-4" />
								Cerrar sesión
							</DropdownMenu.Item>
						</DropdownMenu.Content>
					</DropdownMenu.Portal>
				</DropdownMenu.Root>
			</div>
		</header>
	);
}
