import "server-only";

import { cookies } from "next/headers";
import { cache } from "react";

import type { ApiResponse, Employee } from "./api/contracts";
import { apiRequest } from "./api/server";

export const SESSION_COOKIE = "mbt-session";

export const getCurrentEmployee = cache(async (): Promise<Employee | null> => {
	const token = (await cookies()).get(SESSION_COOKIE)?.value;
	if (!token) return null;
	try {
		const response = await apiRequest("/auth/me", {
			headers: { Authorization: `Bearer ${token}` },
		});
		if (!response.ok) return null;
		const payload = (await response.json()) as ApiResponse<{
			employee: Employee;
		}>;
		return payload.success ? payload.data.employee : null;
	} catch {
		return null;
	}
});
