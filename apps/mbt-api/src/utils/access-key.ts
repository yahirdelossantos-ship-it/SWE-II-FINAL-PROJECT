import {
	randomBytes,
	scrypt as nodeScrypt,
	timingSafeEqual,
} from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(nodeScrypt);
const HASH_PREFIX = "scrypt";
const KEY_LENGTH = 64;

export function isHashedAccessKey(value: string): boolean {
	return value.startsWith(`${HASH_PREFIX}$`);
}

export async function hashAccessKey(accessKey: string): Promise<string> {
	const salt = randomBytes(16);
	const derivedKey = (await scrypt(accessKey, salt, KEY_LENGTH)) as Buffer;

	return [
		HASH_PREFIX,
		salt.toString("base64url"),
		derivedKey.toString("base64url"),
	].join("$");
}

export async function verifyAccessKey(
	accessKey: string,
	storedValue: string,
): Promise<boolean> {
	if (!isHashedAccessKey(storedValue)) {
		return false;
	}

	const [, saltValue, hashValue] = storedValue.split("$");
	if (!saltValue || !hashValue) {
		return false;
	}

	try {
		const salt = Buffer.from(saltValue, "base64url");
		const storedHash = Buffer.from(hashValue, "base64url");
		const derivedKey = (await scrypt(
			accessKey,
			salt,
			storedHash.length,
		)) as Buffer;

		return (
			derivedKey.length === storedHash.length &&
			timingSafeEqual(derivedKey, storedHash)
		);
	} catch {
		return false;
	}
}

export function generateAccessKey(): string {
	return randomBytes(18).toString("base64url");
}

export function accessKeyMetadata<
	T extends {
		id: string;
		employeeId: string;
		ips: string[];
	},
>(accessKey: T) {
	return {
		id: accessKey.id,
		employeeId: accessKey.employeeId,
		ips: accessKey.ips,
		// Preserve the legacy response shape without disclosing stored hash material.
		key: "••••••••",
		hasKey: true as const,
	};
}
