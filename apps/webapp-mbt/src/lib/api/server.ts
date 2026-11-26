import "server-only";

const API_ORIGIN = (
	process.env.MBT_API_URL ??
	process.env.NEXT_PUBLIC_API_URL ??
	"http://localhost:3001"
)
	.replace(/\/$/, "")
	.replace(/\/api\/v\d+$/, "");

export function apiUrl(path: string) {
	return `${API_ORIGIN}/api/v2${path.startsWith("/") ? path : `/${path}`}`;
}

export async function apiRequest(path: string, init: RequestInit = {}) {
	const headers = new Headers(init.headers);
	headers.set("Accept", "application/json");
	if (init.body && !headers.has("Content-Type")) {
		headers.set("Content-Type", "application/json");
	}
	return fetch(apiUrl(path), {
		...init,
		headers,
		cache: "no-store",
	});
}
