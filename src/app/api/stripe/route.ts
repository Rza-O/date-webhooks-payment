/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { handleSuccessfulPayment } from "./handlers/handleSuccessfulPayment";
import { handleFailedPayment } from "./handlers/handleFailedPayment";
import { stripe } from "../../../lib/stripe";

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET as string;

export const POST = async (req: NextRequest) => {
	const signature = req.headers.get("stripe-signature") || "";

	let event: Stripe.Event;
	try {
		const rawBody = await req.text();
		event = stripe.webhooks.constructEvent(
			rawBody,
			signature,
			endpointSecret
		);
	} catch (error: any) {
		console.error("⚠️ Webhook Error:", error.message);
		return NextResponse.json(
			{ error: "Invalid webhook signature" },
			{ status: 400 }
		);
	}

	try {
		const intent = event.data.object as Stripe.PaymentIntent;

		switch (event.type) {
			case "payment_intent.succeeded":
				console.log("✅ Payment succeeded:", intent.id);
				await handleSuccessfulPayment(intent);
				break;

			case "payment_intent.payment_failed":
				console.log("❌ Payment failed:", intent.id);
				await handleFailedPayment(intent);
				break;

			default:
				console.warn(`⚠️ Unhandled event type: ${event.type}`);
		}

		return NextResponse.json({ received: true });
	} catch (error: any) {
		console.error("🚨 Internal Server Error:", error.message);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 }
		);
	}
};
