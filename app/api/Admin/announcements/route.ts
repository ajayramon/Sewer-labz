import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";

const ADMIN_EMAILS = ["your-email@gmail.com", "client-email@gmail.com"];

async function verifyAdmin(req: NextRequest) {
  const token = req.headers.get("Authorization")?.replace("Bearer ", "");
  if (!token) throw new Error("Unauthorized");
  const decoded = await adminAuth.verifyIdToken(token);
  if (!ADMIN_EMAILS.includes(decoded.email ?? "")) throw new Error("Forbidden");
  return decoded;
}

export async function GET(req: NextRequest) {
  try {
    await verifyAdmin(req);
    const snap = await adminDb
      .collection("announcements")
      .orderBy("createdAt", "desc")
      .limit(50)
      .get();

    const announcements = snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
      createdAt:
        d.data().createdAt?.toDate?.()?.toISOString() ?? d.data().createdAt,
    }));

    return NextResponse.json({ announcements });
  } catch (err: any) {
    const status =
      err.message === "Unauthorized"
        ? 401
        : err.message === "Forbidden"
          ? 403
          : 500;
    return NextResponse.json({ error: err.message }, { status });
  }
}

export async function POST(req: NextRequest) {
  try {
    await verifyAdmin(req);
    const { message, type, target } = await req.json();

    if (!message?.trim()) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 },
      );
    }

    const validTypes = ["info", "warning", "success"];
    const validTargets = ["all", "free", "pro"];

    const doc = await adminDb.collection("announcements").add({
      message: message.trim(),
      type: validTypes.includes(type) ? type : "info",
      target: validTargets.includes(target) ? target : "all",
      active: true,
      createdAt: new Date(),
    });

    return NextResponse.json({ id: doc.id, success: true });
  } catch (err: any) {
    const status =
      err.message === "Unauthorized"
        ? 401
        : err.message === "Forbidden"
          ? 403
          : 500;
    return NextResponse.json({ error: err.message }, { status });
  }
}
