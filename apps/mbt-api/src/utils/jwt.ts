import jwt from "jsonwebtoken";
import { env } from "../env";

export interface JWTPayload {
	employeeId: string;
	email: string;
	identification: string | null;
	role: string;
	name: string;
	photo: string | null;
}

const TOKEN_EXPIRY = "24h";

export function generateToken(payload: JWTPayload): string {
	return jwt.sign(payload, env.JWT_SECRET!, {
		expiresIn: TOKEN_EXPIRY,
		issuer: "mbt-api",
		audience: "mbt-webapp",
	});
}

export function verifyToken(token: string): JWTPayload {
	const decoded = jwt.verify(token, env.JWT_SECRET!, {
		issuer: "mbt-api",
		audience: "mbt-webapp",
	});
	return decoded as JWTPayload;
}
