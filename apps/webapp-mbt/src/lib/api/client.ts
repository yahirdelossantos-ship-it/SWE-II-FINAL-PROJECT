export class AppApiError extends Error {
	constructor(
		message: string,
		public readonly code = "REQUEST_FAILED",
		public readonly status = 500,
		public readonly fields?: Record<string, string[]>,
		public readonly issues?: Array<{
			path?: Array<string | number>;
			message?: string;
		}>,
	) {
		super(message);
		this.name = "AppApiError";
	}
}

export async function appApi<T>(
	path: string,
	init: RequestInit = {},
): Promise<T> {
	const response = await fetch(
		`/api/backend${path.startsWith("/") ? path : `/${path}`}`,
		{
			...init,
			headers: {
				Accept: "application/json",
				...(init.body ? { "Content-Type": "application/json" } : {}),
				...init.headers,
			},
		},
	);

	const payload = await response.json().catch(() => null);

	if (!response.ok || !payload?.success) {
		throw new AppApiError(
			payload?.error?.message ?? "No se pudo completar la solicitud",
			payload?.error?.code,
			response.status,
			payload?.error?.fields,
			payload?.error?.issues,
		);
	}

	return payload.data as T;
}

export async function appApiWithMeta<T, M>(
	path: string,
	init: RequestInit = {},
): Promise<{ data: T; meta: M }> {
	const response = await fetch(
		`/api/backend${path.startsWith("/") ? path : `/${path}`}`,
		{
			...init,
			headers: {
				Accept: "application/json",
				...(init.body ? { "Content-Type": "application/json" } : {}),
				...init.headers,
			},
		},
	);
	const payload = await response.json().catch(() => null);
	if (!response.ok || !payload?.success) {
		throw new AppApiError(
			payload?.error?.message ?? "No se pudo completar la solicitud",
			payload?.error?.code,
			response.status,
			payload?.error?.fields,
			payload?.error?.issues,
		);
	}
	return { data: payload.data as T, meta: payload.meta as M };
}
