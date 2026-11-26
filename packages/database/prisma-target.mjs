import { spawnSync } from "node:child_process";

const [, , target, action, ...options] = process.argv;

const targets = {
	test: "TEST_DATABASE_URL",
	prod: "PROD_DATABASE_URL",
};

const actions = {
	status: ["migrate", "status"],
	deploy: ["migrate", "deploy"],
	dev: ["migrate", "dev"],
	studio: ["studio"],
};

function fail(message) {
	console.error(`[database] ${message}`);
	process.exit(1);
}

if (!(target in targets)) {
	fail("Target must be either test or prod.");
}

if (!(action in actions)) {
	fail("Action must be status, deploy, dev, or studio.");
}

if (target === "prod" && !["status", "deploy"].includes(action)) {
	fail("Production only permits migration status and deploy operations.");
}

const variable = targets[target];
const databaseUrl = process.env[variable];

if (!databaseUrl) {
	fail(`${variable} is not configured.`);
}

if (
	target === "prod" &&
	process.env.TEST_DATABASE_URL &&
	databaseUrl === process.env.TEST_DATABASE_URL
) {
	fail("TEST_DATABASE_URL and PROD_DATABASE_URL must not be identical.");
}

const confirmation = "--confirm-production";

if (target === "prod" && action === "deploy" && !options.includes(confirmation)) {
	fail(`Production deploy requires ${confirmation}.`);
}

let parsedUrl;

try {
	parsedUrl = new URL(databaseUrl);
} catch {
	fail(`${variable} is not a valid database URL.`);
}

const databaseName = decodeURIComponent(parsedUrl.pathname.replace(/^\//, ""));
const port = parsedUrl.port ? `:${parsedUrl.port}` : "";

console.log(`[database] target=${target} host=${parsedUrl.hostname}${port} database=${databaseName}`);

const forwardedOptions = options.filter(
	(option) => option !== confirmation && option !== "--",
);
const result = spawnSync(
	"prisma",
	[...actions[action], "--schema", "prisma/schema.prisma", ...forwardedOptions],
	{
		stdio: "inherit",
		env: {
			...process.env,
			DATABASE_URL: databaseUrl,
		},
		shell: process.platform === "win32",
	},
);

if (result.error) {
	fail(result.error.message);
}

process.exit(result.status ?? 1);
