import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/app/Lib/firebase-admin";

export async function GET(req: NextRequest) {
  try {
    const uid = req.headers.get("x-user-id");
    if (!uid)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const doc = await adminDb.collection("users").doc(uid).get();
    if (!doc.exists) return NextResponse.json(null);

    return NextResponse.json({ id: doc.id, ...doc.data() });
  } catch (err) {
    return NextResponse.json({ error: "Failed to get user" }, { status: 500 });
  }
}
