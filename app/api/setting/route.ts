import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/app/Lib/firebase-admin";

export async function GET(req: NextRequest) {
  try {
    const uid = req.headers.get("x-user-id");
    if (!uid) return NextResponse.json(null);

    const doc = await getAdminDb().collection("users").doc(uid).get();

    if (!doc.exists) return NextResponse.json(null);

    return NextResponse.json(doc.data());
  } catch (err) {
    console.error("GET /api/settings", err);
    return NextResponse.json(null);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const uid = req.headers.get("x-user-id");
    if (!uid) return NextResponse.json({ success: false }, { status: 401 });

    const body = await req.json();

    await getAdminDb().collection("users").doc(uid).set(body, { merge: true });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("PATCH /api/settings", err);
    return NextResponse.json(
      { success: false, error: "Failed to save" },
      { status: 500 },
    );
  }
}
