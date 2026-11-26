import type { NextFunction, Request, RequestHandler, Response } from "express";
import { ZodError } from "zod";

import { ApiError } from "./errors";

export function asyncRoute(
	handler: (req: Request, res: Response) => Promise<unknown>,
): RequestHandler {
	return (req, res, next) => {
		Promise.resolve(handler(req, res)).catch(next);
	};
}

export function success<T>(
	res: Response,
	data: T,
	status = 200,
	meta?: Record<string, unknown>,
) {
	return res.status(status).json({
		success: true,
		data,
		...(meta ? { meta } : {}),
	});
}

export function v2ErrorHandler(
	error: unknown,
	_req: Request,
	res: Response,
	_next: NextFunction,
) {
	if (error instanceof ZodError) {
		return res.status(422).json({
			success: false,
			error: {
				code: "VALIDATION_ERROR",
				message: "Request validation failed",
				fields: error.flatten().fieldErrors,
				issues: error.issues,
			},
		});
	}

	if (error instanceof ApiError) {
		return res.status(error.status).json({
			success: false,
			error: {
				code: error.code,
				message: error.message,
				...(error.details ?? {}),
			},
		});
	}

	const prismaCode =
		typeof error === "object" && error !== null && "code" in error
			? String(error.code)
			: null;
	if (prismaCode === "P2002") {
		return res.status(409).json({
			success: false,
			error: {
				code: "CONFLICT",
				message: "A conflicting record already exists",
			},
		});
	}
	if (prismaCode === "P2003") {
		return res.status(409).json({
			success: false,
			error: {
				code: "RECORD_IN_USE",
				message: "This record is referenced by another record",
			},
		});
	}
	if (prismaCode === "P2025") {
		return res.status(404).json({
			success: false,
			error: { code: "NOT_FOUND", message: "Record was not found" },
		});
	}

	console.error("Unhandled v2 API error:", error);
	return res.status(500).json({
		success: false,
		error: { code: "INTERNAL_ERROR", message: "Internal server error" },
	});
}
