import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/app/Lib/firebase-admin";

export async function POST(req: NextRequest) {
  try {
    // 1. Verify Firebase token — prevents unauthenticated checkout creation
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = await adminAuth.verifyIdToken(token);
    const uid = decoded.uid;

    // 2. Parse and validate body
    const { plan, email, name } = await req.json();

    if (!plan || !email) {
      return NextResponse.json(
        { error: "Missing required fields: plan, email" },
        { status: 400 },
      );
    }

    if (!["PRO_MONTHLY", "PRO_ANNUALLY"].includes(plan)) {
      return NextResponse.json(
        { error: "Invalid plan. Must be PRO_MONTHLY or PRO_ANNUALLY" },
        { status: 400 },
      );
    }

    // 3. Resolve variant ID — must be a STRING for JSON:API spec
    const variantId =
      plan === "PRO_MONTHLY"
        ? process.env.LEMONSQUEEZY_VARIANT_MONTHLY
        : process.env.LEMONSQUEEZY_VARIANT_ANNUALLY;

    const storeId = process.env.LEMONSQUEEZY_STORE_ID;
    const apiKey = process.env.LEMONSQUEEZY_API_KEY;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;

    if (!variantId || !storeId || !apiKey || !appUrl) {
      console.error("Missing env vars:", {
        variantId,
        storeId,
        apiKey: !!apiKey,
        appUrl,
      });
      return NextResponse.json(
        { error: "Server misconfiguration — missing env variables" },
        { status: 500 },
      );
    }

    // 4. Call LemonSqueezy API
    const response = await fetch("https://api.lemonsqueezy.com/v1/checkouts", {
      method: "POST",
      headers: {
        Accept: "application/vnd.api+json",
        "Content-Type": "application/vnd.api+json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        data: {
          type: "checkouts",
          attributes: {
            checkout_data: {
              email,
              name: name ?? "",
              custom: {
                user_id: uid, // always use the verified uid, not client-supplied userId
              },
            },
            product_options: {
              redirect_url: `${appUrl}/billing?success=true`,
              receipt_button_text: "Go to Dashboard",
              receipt_thank_you_note:
                "Thanks for subscribing to Sewer Labz Pro!",
            },
            checkout_options: {
              embed: false,
              media: true,
              logo: true,
            },
          },
          relationships: {
            store: {
              data: {
                type: "stores",
                id: String(storeId), // must be a string — JSON:API rejects numbers
              },
            },
            variant: {
              data: {
                type: "variants",
                id: String(variantId), // must be a string — JSON:API rejects numbers
              },
            },
          },
        },
      }),
    });

    // 5. Handle LemonSqueezy response
    const data = await response.json();

    if (!response.ok) {
      console.error("LemonSqueezy API error:", JSON.stringify(data, null, 2));
      const lsError = data?.errors?.[0]?.detail ?? "Failed to create checkout";
      return NextResponse.json({ error: lsError }, { status: response.status });
    }

    const checkoutUrl = data?.data?.attributes?.url;

    if (!checkoutUrl) {
      console.error(
        "No checkout URL in response:",
        JSON.stringify(data, null, 2),
      );
      return NextResponse.json(
        { error: "LemonSqueezy returned no checkout URL" },
        { status: 500 },
      );
    }

    return NextResponse.json({ url: checkoutUrl });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Unexpected server error";
    console.error("Checkout route error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
