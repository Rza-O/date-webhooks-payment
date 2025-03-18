import { prisma } from "@/lib/prismaClient";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
	try {
		const rooms = await prisma.room.findMany({
			where: { isDeleted: false },
		});
		return NextResponse.json({ rooms });
	} catch (error) {
		return NextResponse.json(
			{ error: "Failed to fetch rooms", message: error },
			{ status: 500 }
		);
	}
};
