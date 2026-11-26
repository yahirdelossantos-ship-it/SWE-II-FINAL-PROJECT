import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { apiRequest } from "@/lib/api/server";
import { SESSION_COOKIE } from "@/lib/session";

async function forward(
	request: Request,
	context: { params: Promise<{ path: string[] }> },
) {
	const token = (await cookies()).get(SESSION_COOKIE)?.value;
	if (!token)
		return NextResponse.json(
			{
				success: false,
				error: { code: "UNAUTHORIZED", message: "Sesión requerida" },
			},
			{ status: 401 },
		);
	const { path } = await context.params;
	const sourceUrl = new URL(request.url);
	const body =
		request.method === "GET" || request.method === "HEAD"
			? undefined
			: await request.arrayBuffer();
	try {
		const upstream = await apiRequest(
			`/${path.join("/")}${sourceUrl.search}`,
			{
				method: request.method,
				body: body?.byteLength ? body : undefined,
				headers: {
					Authorization: `Bearer ${token}`,
					...(request.headers.get("content-type")
						? {
								"Content-Type":
									request.headers.get("content-type")!,
							}
						: {}),
				},
			},
		);
		return new NextResponse(upstream.body, {
			status: upstream.status,
			headers: {
				"Content-Type":
					upstream.headers.get("content-type") ?? "application/json",
				...(upstream.headers.get("content-disposition")
					? {
							"Content-Disposition": upstream.headers.get(
								"content-disposition",
							)!,
						}
					: {}),
			},
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

export const GET = forward;
export const POST = forward;
export const PUT = forward;
export const PATCH = forward;
export const DELETE = forward;
