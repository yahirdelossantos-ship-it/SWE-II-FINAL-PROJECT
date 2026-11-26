import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";

import type { ApiResponse, Employee } from "@/lib/api/contracts";
import { apiRequest } from "@/lib/api/server";
import { SESSION_COOKIE } from "@/lib/session";

const inputSchema = z.object({
	identifier: z.string().trim().min(1),
	accessKey: z.string().min(1),
});

export async function POST(request: Request) {
	const parsed = inputSchema.safeParse(
		await request.json().catch(() => null),
	);
	if (!parsed.success) {
		return NextResponse.json(
			{
				success: false,
				error: {
					code: "VALIDATION_ERROR",
					message: "Complete ambos campos",
				},
			},
			{ status: 422 },
		);
	}
	try {
		const upstream = await apiRequest("/auth/login", {
			method: "POST",
			body: JSON.stringify(parsed.data),
		});
		const payload = (await upstream.json()) as ApiResponse<{
			token: string;
			employee: Employee;
		}>;
		if (!upstream.ok || !payload.success)
			return NextResponse.json(payload, { status: upstream.status });
		const cookieStore = await cookies();
		cookieStore.set(SESSION_COOKIE, payload.data.token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "lax",
			path: "/",
			maxAge: 60 * 60 * 24,
		});
		return NextResponse.json({
			success: true,
			data: { employee: payload.data.employee },
		});
	} catch {
		return NextResponse.json(
			{
				success: false,
				error: {
					code: "API_UNAVAILABLE",
					message: "No se pudo conectar con la API",
				},
			},
			{ status: 503 },
		);
	}
}
