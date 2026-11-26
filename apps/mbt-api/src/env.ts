import { resolve } from "node:path";

import { config } from "dotenv";
import { z } from "zod";

config({ path: resolve(__dirname, "../../../.env") });

const envSchema = z.object({
	NODE_ENV: z
		.enum(["development", "production", "test"])
		.default("development"),
	PORT: z.string().default("3001"),
	DATABASE_URL: z.string().url(),
	JWT_SECRET: z.string().min(32),
	CORS_ORIGINS: z
		.string()
		.default(
			"http://localhost:3000,https://mb-transfer-mbt-app.vercel.app",
		),
});

function validateEnv() {
	try {
		return envSchema.parse(process.env);
	} catch (error) {
		console.error("❌ Invalid environment variables:");
		console.error(JSON.stringify(error, null, 2));
		process.exit(1);
	}
}

export const env = validateEnv();
