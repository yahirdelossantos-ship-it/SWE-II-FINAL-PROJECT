import { PrismaClient } from "@prisma/client";

let prismaInstance: PrismaClient | undefined;

export function getPrismaClient(): PrismaClient {
	if (!prismaInstance) {
		prismaInstance = new PrismaClient({
			log: ["query", "warn", "error"],
		});
	}

	return prismaInstance;
}

export const prisma = getPrismaClient();
export default prisma;

export { PrismaClient };
export * from "@prisma/client";
