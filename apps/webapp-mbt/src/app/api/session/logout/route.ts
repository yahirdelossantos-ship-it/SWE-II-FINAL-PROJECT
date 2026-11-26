import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { SESSION_COOKIE } from "@/lib/session";

export async function POST() {
	(await cookies()).delete(SESSION_COOKIE);
	return NextResponse.json({ success: true, data: null });
}
