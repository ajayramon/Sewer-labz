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

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    await verifyAdmin(req);
    const body = await req.json();
    const { id } = params;

    const allowedFields: Record<string, boolean> = {
      active: true,
      message: true,
      type: true,
      target: true,
    };
    const update: Record<string, any> = {};
    for (const [k, v] of Object.entries(body)) {
      if (allowedFields[k]) update[k] = v;
    }

    await adminDb.collection("announcements").doc(id).update(update);
    return NextResponse.json({ success: true });
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

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    await verifyAdmin(req);
    const { id } = params;
    await adminDb.collection("announcements").doc(id).delete();
    return NextResponse.json({ success: true });
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
