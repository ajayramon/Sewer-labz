import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/app/Lib/firebase-admin";

// Fields allowed to be saved — prevents overwriting plan/subscriptionId etc.
const ALLOWED_FIELDS = [
  "fullName",
  "companyName",
  "companyPhone",
  "companyAddress",
  "companyWebsite",
  "licenseNumber",
];

async function getUid(req: NextRequest): Promise<string | null> {
  // Try Firebase token first (most secure)
  const token = req.headers.get("Authorization")?.replace("Bearer ", "");
  if (token) {
    try {
      const decoded = await adminAuth.verifyIdToken(token);
      return decoded.uid;
    } catch {}
  }

  // Fall back to x-user-id header (already used across your app)
  return req.headers.get("x-user-id");
}

export async function GET(req: NextRequest) {
  try {
    const uid = await getUid(req);
    if (!uid) return NextResponse.json(null, { status: 401 });

    const doc = await adminDb.collection("users").doc(uid).get();
    if (!doc.exists) return NextResponse.json(null);

    // Only return safe fields to the client
    const data = doc.data() ?? {};
    return NextResponse.json({
      fullName: data.fullName ?? "",
      companyName: data.companyName ?? "",
      companyPhone: data.companyPhone ?? "",
      companyAddress: data.companyAddress ?? "",
      companyWebsite: data.companyWebsite ?? "",
      licenseNumber: data.licenseNumber ?? "",
      plan: data.plan ?? "free",
    });
  } catch (err) {
    console.error("GET /api/settings error:", err);
    return NextResponse.json(null, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const uid = await getUid(req);
    if (!uid)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();

    // Only save whitelisted fields — never let client overwrite plan or subscriptionId
    const safeData: Record<string, string> = {};
    for (const field of ALLOWED_FIELDS) {
      if (body[field] !== undefined) {
        safeData[field] = String(body[field]).trim();
      }
    }

    if (Object.keys(safeData).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to save" },
        { status: 400 },
      );
    }

    await adminDb.collection("users").doc(uid).set(safeData, { merge: true });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("PATCH /api/settings error:", err);
    return NextResponse.json(
      { error: "Failed to save settings" },
      { status: 500 },
    );
  }
}
