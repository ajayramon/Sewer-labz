import { NextResponse } from "next/server";
import crypto from "crypto";
import { adminDb } from "@/app/Lib/firebase-admin";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-signature") || "";

    // Verify webhook signature
    const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET!;
    const hmac = crypto.createHmac("sha256", secret);
    const digest = hmac.update(rawBody).digest("hex");

    if (signature !== digest) {
      console.error("Invalid webhook signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);
    const eventName = payload.meta?.event_name;
    const userId = payload.meta?.custom_data?.user_id;
    const customerId = payload.data?.attributes?.customer_id?.toString();
    const status = payload.data?.attributes?.status;

    console.log("LemonSqueezy event:", eventName, "userId:", userId);

    if (!userId) {
      console.error("No user_id in webhook");
      return NextResponse.json({ error: "No user_id" }, { status: 400 });
    }

    const userRef = adminDb.collection("users").doc(userId);

    switch (eventName) {
      case "order_created":
        await userRef.update({
          lemonsqueezyCustomerId: customerId,
          subscriptionStatus: "active",
        });
        break;

      case "subscription_created":
        await userRef.update({
          plan: "PRO",
          subscriptionStatus: "active",
          lemonsqueezyCustomerId: customerId,
          lemonsqueezySubscriptionId: payload.data?.id,
        });
        break;

      case "subscription_updated":
        await userRef.update({
          subscriptionStatus: status === "active" ? "active" : status,
        });
        break;

      case "subscription_cancelled":
        await userRef.update({
          subscriptionStatus: "cancelled",
        });
        break;

      case "subscription_expired":
        await userRef.update({
          plan: "FREE",
          subscriptionStatus: "expired",
        });
        break;

      case "subscription_payment_failed":
        await userRef.update({
          subscriptionStatus: "past_due",
        });
        break;

      default:
        console.log("Unhandled event:", eventName);
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error("Webhook error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
