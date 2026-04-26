import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/app/Lib/firebase-admin";

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ announcements: [] });

    // Verify user is logged in (any user)
    await adminAuth.verifyIdToken(token);

    const snap = await adminDb
      .collection("announcements")
      .where("active", "==", true)
      .orderBy("createdAt", "desc")
      .limit(5)
      .get();

    const announcements = snap.docs.map((d) => ({
      id: d.id,
      message: d.data().message,
      type: d.data().type,
      target: d.data().target,
      active: d.data().active,
    }));

    return NextResponse.json({ announcements });
  } catch {
    return NextResponse.json({ announcements: [] });
  }
}
