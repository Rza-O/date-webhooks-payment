/* eslint-disable @typescript-eslint/no-unused-vars */
import { prisma } from "@/lib/prismaClient";
import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
	const user = await currentUser();
	if (!user) {
		return NextResponse.json(
			{ error: "Unauthorized", message: "User not found" },
			{ status: 401 }
		);
	}

	const dbUser = await prisma.user.findUnique({
		where: { clerkId: user.id },
	});

	if (!dbUser) {
		return NextResponse.json(
			{ error: "Not-Found", message: "DB User not found" },
			{ status: 404 }
		);
	}

	return NextResponse.json({ user: dbUser }, { status: 200 });
};
