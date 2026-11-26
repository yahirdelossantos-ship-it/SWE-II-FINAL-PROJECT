import type { NextFunction, Request, Response } from "express";

import { verifyToken, type JWTPayload } from "../../../utils/jwt";

declare global {
	namespace Express {
		interface Request {
			user?: JWTPayload;
		}
	}
}

export function requireV2Auth(req: Request, res: Response, next: NextFunction) {
	const authorization = req.headers.authorization;
	if (!authorization?.startsWith("Bearer ")) {
		return res.status(401).json({
			success: false,
			error: { code: "UNAUTHORIZED", message: "Authentication required" },
		});
	}

	try {
		req.user = verifyToken(authorization.slice("Bearer ".length));
		return next();
	} catch {
		return res.status(401).json({
			success: false,
			error: {
				code: "SESSION_EXPIRED",
				message: "Session is invalid or expired",
			},
		});
	}
}
