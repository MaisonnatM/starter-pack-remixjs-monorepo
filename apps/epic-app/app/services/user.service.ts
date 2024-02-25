import { prisma } from "#app/utils/server/db.server.ts";

export async function getUserBydId(userId: string) {
	return prisma.user.findUnique({
		where: {
			id: userId
		}
	})
}