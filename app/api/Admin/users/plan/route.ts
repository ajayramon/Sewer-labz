import { NextRequest, NextResponse } from "next/server";
import { adminDb, adminAuth } from "@/app/Lib/firebase-admin";

const ADMIN_EMAILS = ["ajayraymon750@gmail.com"]; // ← add your admin email here

export async function POST(req: NextRequest) {
  try {
    // Verify admin
    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "");
    if (!token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = await adminAuth.verifyIdToken(token);
    if (!ADMIN_EMAILS.includes(decoded.email || "")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { uid, plan } = await req.json();

    if (!uid || !plan) {
      return NextResponse.json(
        { error: "Missing uid or plan" },
        { status: 400 },
      );
    }

    const validPlans = ["free", "pro_monthly", "pro_annually"];
    if (!validPlans.includes(plan)) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    // Update plan in Firestore
    await adminDb
      .collection("users")
      .doc(uid)
      .collection("settings")
      .doc("profile")
      .set({ plan, updatedAt: new Date().toISOString() }, { merge: true });

    return NextResponse.json({ success: true, uid, plan });
  } catch (err) {
    console.error("POST /api/admin/users/plan", err);
    return NextResponse.json(
      { error: "Failed to update plan" },
      { status: 500 },
    );
  }
}
