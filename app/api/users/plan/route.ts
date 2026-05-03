import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/app/Lib/firebase-admin";

export async function PATCH(req: NextRequest) {
  try {
    const uid = req.headers.get("x-user-id");
    if (!uid)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { plan } = await req.json();
    await adminDb.collection("users").doc(uid).set({ plan }, { merge: true });

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to update plan" },
      { status: 500 },
    );
  }
}
