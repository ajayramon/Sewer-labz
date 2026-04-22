import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { plan, email, name, userId } = await req.json();

    const variantId =
      plan === "PRO_MONTHLY"
        ? process.env.LEMONSQUEEZY_VARIANT_MONTHLY
        : process.env.LEMONSQUEEZY_VARIANT_ANNUALLY;

    const response = await fetch("https://api.lemonsqueezy.com/v1/checkouts", {
      method: "POST",
      headers: {
        Accept: "application/vnd.api+json",
        "Content-Type": "application/vnd.api+json",
        Authorization: `Bearer ${process.env.LEMONSQUEEZY_API_KEY}`,
      },
      body: JSON.stringify({
        data: {
          type: "checkouts",
          attributes: {
            checkout_data: {
              email,
              name,
              custom: { user_id: userId },
            },
            product_options: {
              redirect_url: `${process.env.NEXT_PUBLIC_APP_URL}/`,
            },
          },
          relationships: {
            store: {
              data: { type: "stores", id: process.env.LEMONSQUEEZY_STORE_ID },
            },
            variant: {
              data: { type: "variants", id: variantId },
            },
          },
        },
      }),
    });

    const data = await response.json();
    const url = data?.data?.attributes?.url;

    if (!url) {
      console.error("LemonSqueezy error:", JSON.stringify(data));
      return NextResponse.json(
        { error: "Failed to create checkout" },
        { status: 500 },
      );
    }

    return NextResponse.json({ url });
  } catch (err: any) {
    console.error("Checkout error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
