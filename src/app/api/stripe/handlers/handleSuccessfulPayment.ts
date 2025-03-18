
import Stripe from "stripe";
import { prisma } from "../../../../lib/prismaClient";

export const handleSuccessfulPayment = async (intent: Stripe.PaymentIntent) => {
	const { bookingId, userId } = intent.metadata;

	// Delete the old 'INTENT' entry
	await prisma.paymentLog.deleteMany({
		where: {
			stripePaymentIntentId: intent.id,
			status: "INTENT",
		},
	});

	// Create a new entry in Payment Table
	await prisma.payment.create({
		data: {
			userId: Number(userId),
			bookingId,
			amount: intent.amount / 100,
			currency: "USD",
			status: "COMPLETED",
			method: "card",
			transactionId: intent.id,
		},
	});

	// Update Booking Status to CONFIRMED
	await prisma.booking.update({
		where: { id: bookingId },
		data: { status: "CONFIRMED" },
	});
};
