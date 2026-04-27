import { NextResponse } from "next/server";
import crypto from "crypto";
import { adminDb } from "@/app/Lib/firebase-admin";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-signature") || "";

    // 1. Verify webhook signature
    const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET!;
    const hmac = crypto.createHmac("sha256", secret);
    const digest = hmac.update(rawBody).digest("hex");

    if (!signature || signature !== digest) {
      console.error("Invalid webhook signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);
    const eventName = payload.meta?.event_name;
    const userId = payload.meta?.custom_data?.user_id;
    const customerId = payload.data?.attributes?.customer_id?.toString();
    const status = payload.data?.attributes?.status;

    console.log("LemonSqueezy webhook:", eventName, "| userId:", userId);

    if (!userId) {
      console.error("No user_id in webhook custom_data");
      return NextResponse.json({ error: "No user_id" }, { status: 400 });
    }

    const userRef = adminDb.collection("users").doc(userId);

    // 2. Detect which plan based on variant ID
    const variantId = payload.data?.attributes?.variant_id?.toString();
    const monthlyVariant = process.env.LEMONSQUEEZY_VARIANT_MONTHLY;
    const annualVariant = process.env.LEMONSQUEEZY_VARIANT_ANNUALLY;

    const plan =
      variantId === String(annualVariant)
        ? "pro_annual"
        : variantId === String(monthlyVariant)
          ? "pro_monthly"
          : "pro_monthly"; // safe default if variant unrecognised

    switch (eventName) {
      case "order_created":
        // Just store the customer ID — subscription_created fires separately
        await userRef.set(
          {
            lemonsqueezyCustomerId: customerId,
            updatedAt: new Date().toISOString(),
          },
          { merge: true },
        );
        break;

      case "subscription_created":
        await userRef.set(
          {
            plan, // "pro_monthly" or "pro_annual"
            subscriptionStatus: "active",
            lemonsqueezyCustomerId: customerId,
            lemonsqueezySubscriptionId: payload.data?.id,
            lemonsqueezyVariantId: variantId,
            updatedAt: new Date().toISOString(),
          },
          { merge: true },
        );
        console.log(`User ${userId} upgraded to ${plan}`);
        break;

      case "subscription_updated":
        // Plan may have changed (e.g. monthly → annual upgrade)
        await userRef.set(
          {
            plan,
            subscriptionStatus: status === "active" ? "active" : status,
            lemonsqueezyVariantId: variantId,
            updatedAt: new Date().toISOString(),
          },
          { merge: true },
        );
        break;

      case "subscription_cancelled":
        // Cancelled but still active until period ends
        await userRef.set(
          {
            subscriptionStatus: "cancelled",
            updatedAt: new Date().toISOString(),
          },
          { merge: true },
        );
        break;

      case "subscription_expired":
        // Period ended — downgrade to free
        await userRef.set(
          {
            plan: "free", // lowercase to match rest of app
            subscriptionStatus: "expired",
            updatedAt: new Date().toISOString(),
          },
          { merge: true },
        );
        console.log(`User ${userId} downgraded to free`);
        break;

      case "subscription_payment_failed":
        await userRef.set(
          {
            subscriptionStatus: "past_due",
            updatedAt: new Date().toISOString(),
          },
          { merge: true },
        );
        break;

      case "subscription_payment_success":
        // Renewal succeeded — make sure plan stays active
        await userRef.set(
          {
            subscriptionStatus: "active",
            updatedAt: new Date().toISOString(),
          },
          { merge: true },
        );
        break;

      default:
        console.log("Unhandled LemonSqueezy event:", eventName);
    }

    return NextResponse.json({ received: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Webhook error";
    console.error("Webhook error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
