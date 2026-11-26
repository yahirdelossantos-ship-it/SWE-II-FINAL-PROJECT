import { NextRequest, NextResponse } from "next/server";
const SESSION_COOKIE = "mbt-session";
export function proxy(request: NextRequest) {
	const hasSession = request.cookies.has(SESSION_COOKIE);
	const isApp = request.nextUrl.pathname.startsWith("/app");
	const isLogin = request.nextUrl.pathname === "/login";
	if (isApp && !hasSession)
		return NextResponse.redirect(new URL("/login", request.url));
	if (isLogin && hasSession)
		return NextResponse.redirect(
			new URL("/app/itinerary/view", request.url),
		);
	return NextResponse.next();
}
export const config = { matcher: ["/login", "/app/:path*"] };
