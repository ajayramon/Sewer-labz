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

export async function POST(req: NextRequest) {
  try {
    await verifyAdmin(req);
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

    await adminDb.collection("users").doc(uid).update({
      plan,
      planUpdatedAt: new Date().toISOString(),
      planUpdatedBy: "admin",
    });

    return NextResponse.json({ success: true, uid, plan });
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
