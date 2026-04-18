import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/app/Lib/firebase-admin";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const uid = req.headers.get("x-user-id");
    if (!uid)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const doc = await getAdminDb()
      .collection("users")
      .doc(uid)
      .collection("reports")
      .doc(id)
      .get();

    if (!doc.exists)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({ id: doc.id, ...doc.data() });
  } catch (err) {
    console.error("GET /api/reports/[id]", err);
    return NextResponse.json(
      { error: "Failed to get report" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const uid = req.headers.get("x-user-id");
    if (!uid)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { report, defects } = body;

    const data = {
      ...report,
      id,
      defects: defects || [],
      updatedAt: new Date().toISOString(),
    };

    await getAdminDb()
      .collection("users")
      .doc(uid)
      .collection("reports")
      .doc(id)
      .set(data, { merge: true });

    return NextResponse.json(data);
  } catch (err) {
    console.error("PATCH /api/reports/[id]", err);
    return NextResponse.json(
      { error: "Failed to update report" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const uid = req.headers.get("x-user-id");
    if (!uid)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await getAdminDb()
      .collection("users")
      .doc(uid)
      .collection("reports")
      .doc(id)
      .delete();

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/reports/[id]", err);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
