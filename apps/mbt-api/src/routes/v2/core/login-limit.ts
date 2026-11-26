import { ApiError } from "./errors";

const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILURES = 8;
const attempts = new Map<string, { failures: number; resetAt: number }>();

export function loginAttemptKey(
	ip: string | undefined,
	identifier: string,
): string {
	return `${ip ?? "unknown"}:${identifier.trim().toLowerCase()}`;
}

export function assertLoginAllowed(key: string, now = Date.now()) {
	const attempt = attempts.get(key);
	if (!attempt || attempt.resetAt <= now) {
		attempts.delete(key);
		return;
	}
	if (attempt.failures >= MAX_FAILURES) {
		throw new ApiError(
			429,
			"LOGIN_RATE_LIMITED",
			"Too many failed login attempts",
			{
				retryAfterSeconds: Math.ceil((attempt.resetAt - now) / 1000),
			},
		);
	}
}

export function recordLoginFailure(key: string, now = Date.now()) {
	const current = attempts.get(key);
	if (!current || current.resetAt <= now) {
		attempts.set(key, { failures: 1, resetAt: now + WINDOW_MS });
		return;
	}
	attempts.set(key, { ...current, failures: current.failures + 1 });
}

export function clearLoginFailures(key: string) {
	attempts.delete(key);
}
