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

const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

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

		const today = new Date();
		const currentYear = today.getFullYear();
		const currentMonth = today.getMonth();
		const currentDate = today.getDate();

		const room = await prisma.room.create({
			data: {
				name: parsedData.name,
				capacity: parsedData.capacity,
				location: parsedData.location,
				timezone: parsedData.timezone,
				availabilities: {
					create: Object.entries(parsedData.availability).flatMap(
						([day, slots]) =>
							Array.from({ length: 12 }).flatMap((_, weekOffset) => {
								const dayOfWeek = days.indexOf(day);
								const startDate = new Date(
									currentYear,
									currentMonth,
									currentDate
								);
								startDate.setDate(
									startDate.getDate() +
										((dayOfWeek - startDate.getDay() + 7) % 7) +
										weekOffset * 7
								);

								return Object.entries(slots).map(
									([timeSlot, isAvailable]) => {
										const cleanedTimeSlot = timeSlot
											.replace(/AM|PM/g, "")
											.trim();
										const [hours, minutes] = cleanedTimeSlot
											.split(":")
											.map(Number);

										if (
											isNaN(hours) ||
											isNaN(minutes) ||
											hours > 23 ||
											minutes > 59
										) {
											throw new Error(
												`Invalid time format: ${timeSlot}`
											);
										}

										const startTime = new Date(startDate);
										startTime.setHours(hours, minutes, 0, 0);

										const endTime = new Date(startTime);
										endTime.setHours(startTime.getHours() + 1);

										return {
											date: startDate,
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
									}
								);
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
