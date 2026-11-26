"use client";
import { useState } from "react";
import type { Employee } from "@/lib/api/contracts";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import {
	backgrounds,
	storeBackground,
	type BackgroundId,
	useStoredBackground,
} from "./backgrounds";
export function Shell({
	employee,
	children,
}: {
	employee: Employee;
	children: React.ReactNode;
}) {
	const [collapsed, setCollapsed] = useState(employee.minimized);
	const [mobile, setMobile] = useState(false);
	const background = useStoredBackground(employee.background);
	function selectBackground(next: BackgroundId) {
		storeBackground(next);
	}
	const backgroundImage = backgrounds.find(
		(item) => item.id === background,
	)!.image;
	return (
		<div
			className="min-h-screen bg-cover bg-fixed"
			style={{
				backgroundImage: `linear-gradient(color-mix(in srgb, var(--app-page) 82%, transparent),color-mix(in srgb, var(--app-page) 44%, transparent)),url(${backgroundImage.src})`,
			}}
		>
			<Header
				employee={employee}
				onMenu={() => setMobile(true)}
				collapsed={collapsed}
				onCollapse={() => setCollapsed((v) => !v)}
				background={background}
				onBackground={selectBackground}
			/>
			<div className="flex h-[calc(100vh-5rem)] gap-3 px-3 pb-3 sm:px-5 sm:pb-5">
				<div className="hidden lg:block">
					<Sidebar
						collapsed={collapsed}
						onCollapse={() => setCollapsed((v) => !v)}
					/>
				</div>
				<main className="min-w-0 flex-1 overflow-y-auto rounded-2xl bg-[color-mix(in_srgb,var(--app-surface)_64%,transparent)] p-4 shadow-xl backdrop-blur-sm sm:p-6">
					{children}
				</main>
			</div>
			{mobile && (
				<div
					className="fixed inset-0 z-50 bg-black/45 p-3 lg:hidden"
					onClick={() => setMobile(false)}
				>
					<div
						className="h-full"
						onClick={(e) => e.stopPropagation()}
					>
						<Sidebar
							mobile
							collapsed={false}
							onCollapse={() => {}}
							onNavigate={() => setMobile(false)}
						/>
					</div>
				</div>
			)}
		</div>
	);
}
