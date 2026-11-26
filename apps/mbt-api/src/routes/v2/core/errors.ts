export type ApiErrorDetails = Record<string, unknown>;

export class ApiError extends Error {
	constructor(
		public readonly status: number,
		public readonly code: string,
		message: string,
		public readonly details?: ApiErrorDetails,
	) {
		super(message);
		this.name = "ApiError";
	}
}

export const badRequest = (
	code: string,
	message: string,
	details?: ApiErrorDetails,
) => new ApiError(400, code, message, details);

export const unauthorized = (message = "Authentication required") =>
	new ApiError(401, "UNAUTHORIZED", message);

export const forbidden = (message = "Insufficient permissions") =>
	new ApiError(403, "FORBIDDEN", message);

export const notFound = (code: string, message: string) =>
	new ApiError(404, code, message);
