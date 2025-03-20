import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prismaClient";

export const POST = async (req: Request) => {
	try {
		const requestData = await req.json();
		const { userId, ianaTZ } = requestData;
		console.log(requestData);
		// Check if the request is valid
		if (!userId || !ianaTZ) {
			return NextResponse.json(
				{ message: "Invalid request" },
				{ status: 400 }
			);
		}
		// Update the user's ianaTZ in the database
		const userTZUpdate = await prisma.user.update({
			where: { clerkId: userId },
			data: { timezone: ianaTZ },
		});
		return NextResponse.json(
			{ message: "Time zone updated", userTZUpdate },
			{ status: 200 }
		);
	} catch (error) {
		console.error("❌ Error updating time zone:", error);
		return NextResponse.json(
			{ error: "Failed to update time zone" },
			{ status: 500 }
		);
	}
};
