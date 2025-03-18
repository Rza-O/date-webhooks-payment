import { NextResponse } from "next/server";
import { prisma } from "@/lib/prismaClient";
import { z } from "zod";
import { currentUser } from "@clerk/nextjs/server";

const roomSchema = z.object({
	name: z.string().min(3, "Room name must be at least 3 characters"),
	capacity: z.number().min(1, "Capacity must be at least 1"),
	location: z.string().min(3, "Location is required"),
	timezone: z.string().default("UTC"),
	availability: z.record(
		z.string(), // Day of the week (e.g., "Sunday", "Monday")
		z.record(
			z.string(), // Time slot (e.g., "12:00", "14:00")
			z.boolean() // Availability status
		)
	),
});

export const POST = async (req: Request) => {
	try {
		const user = await currentUser();
		if (!user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const dbUser = await prisma.user.findUnique({
			where: { clerkId: user.id },
		});

		if (!dbUser || dbUser.role !== "ADMIN") {
			return NextResponse.json({ error: "Forbidden" }, { status: 403 });
		}

		const requestData = await req.json();
		const parsedData = roomSchema.parse(requestData);

		const today = new Date().toISOString().split("T")[0]; // Get YYYY-MM-DD

		const room = await prisma.room.create({
			data: {
				name: parsedData.name,
				capacity: parsedData.capacity,
				location: parsedData.location,
				timezone: parsedData.timezone,
				availabilities: {
					create: Object.entries(parsedData.availability).flatMap(
						([day, slots]) =>
							Object.entries(slots).map(([timeSlot, isAvailable]) => {
								// **Fix:** Remove AM/PM if time is in 24-hour format
								const cleanedTimeSlot = timeSlot
									.replace(/AM|PM/g, "")
									.trim();

								// Split hours and minutes
								const [hours, minutes] = cleanedTimeSlot
									.split(":")
									.map(Number);

								// **Fix:** Ensure hours are valid
								if (
									isNaN(hours) ||
									isNaN(minutes) ||
									hours > 23 ||
									minutes > 59
								) {
									throw new Error(`Invalid time format: ${timeSlot}`);
								}

								// Format as ISO string
								const dateTimeString = `${today}T${String(
									hours
								).padStart(2, "0")}:${String(minutes).padStart(
									2,
									"0"
								)}:00.000Z`;

								const startTime = new Date(dateTimeString);
								const endTime = new Date(startTime);
								endTime.setHours(startTime.getHours() + 1);

								console.log(
									`Parsed DateTime: ${startTime.toISOString()}`
								);

								return {
									date: new Date(today),
									timezone: parsedData.timezone,
									user: { connect: { id: dbUser.id } },
									slots: {
										create: {
											startTime,
											endTime,
											isBooked: !isAvailable,
										},
									},
								};
							})
					),
				},
			},
		});

		return NextResponse.json(
			{ message: "Room created successfully", room },
			{ status: 201 }
		);
	} catch (error) {
		console.error("Error creating room:", error);
		return NextResponse.json(
			{ error: error.message || "Failed to create room" },
			{ status: 500 }
		);
	}
};
