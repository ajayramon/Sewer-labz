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
      .collection("templates")
      .doc(id)
      .get();

    if (!doc.exists)
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ id: doc.id, ...doc.data() });
  } catch (err) {
    console.error("GET /api/templates/[id]", err);
    return NextResponse.json(
      { error: "Failed to get template" },
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
    const template = { ...body, id, updatedAt: new Date().toISOString() };

    await getAdminDb()
      .collection("users")
      .doc(uid)
      .collection("templates")
      .doc(id)
      .set(template, { merge: true });

    return NextResponse.json(template);
  } catch (err) {
    console.error("PATCH /api/templates/[id]", err);
    return NextResponse.json(
      { error: "Failed to update template" },
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
      .collection("templates")
      .doc(id)
      .delete();

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/templates/[id]", err);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
