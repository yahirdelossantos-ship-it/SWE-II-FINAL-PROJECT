import { spawnSync } from "node:child_process";

let databaseUrl;
try {
	databaseUrl = new URL(process.env.DATABASE_URL ?? "");
} catch {
	console.error("Configura DATABASE_URL en el archivo .env de la raíz.");
	process.exit(1);
}

const localHosts = ["localhost", "127.0.0.1", "[::1]"];
if (
	!["postgres:", "postgresql:"].includes(databaseUrl.protocol) ||
	!localHosts.includes(databaseUrl.hostname) ||
	databaseUrl.pathname !== "/mbt_academic" ||
	[...databaseUrl.searchParams.keys()].some((key) => key !== "schema") ||
	(databaseUrl.searchParams.has("schema") &&
		databaseUrl.searchParams.get("schema") !== "public")
) {
	console.error(
		"Usa una base PostgreSQL local llamada mbt_academic, en el esquema public.",
	);
	process.exit(1);
}

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
	console.error(
		"Configura JWT_SECRET con al menos 32 caracteres en el archivo .env de la raíz.",
	);
	process.exit(1);
}

const steps = [
	["@repo/database", "prisma:migrate:deploy"],
	["@repo/database", "prisma:generate"],
	["@repo/database", "build"],
	["mbt-api", "build"],
	["mbt-api", "db:seed:demo"],
];

for (const [workspace, script] of steps) {
	const result = spawnSync(
		process.execPath,
		[process.env.npm_execpath, "--filter", workspace, "run", script],
		{ stdio: "inherit" },
	);
	if (result.error) {
		console.error(result.error.message);
		process.exit(1);
	}
	if (result.status !== 0) process.exit(result.status ?? 1);
}
