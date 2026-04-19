import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/app/Lib/firebase-admin";

export async function GET(req: NextRequest) {
  try {
    const uid = req.headers.get("x-user-id");
    if (!uid) return NextResponse.json({ templates: [] });

    const snap = await getAdminDb()
      .collection("users")
      .doc(uid)
      .collection("templates")
      .orderBy("createdAt", "desc")
      .get();

    const templates = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json({ templates });
  } catch (err) {
    console.error("GET /api/templates", err);
    return NextResponse.json({ templates: [] });
  }
}

export async function POST(req: NextRequest) {
  try {
    const uid = req.headers.get("x-user-id");
    if (!uid)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const id = body.id || Date.now().toString();
    const now = new Date().toISOString();

    const template = {
      ...body,
      id,
      createdAt: body.createdAt || now,
      updatedAt: now,
    };

    await getAdminDb()
      .collection("users")
      .doc(uid)
      .collection("templates")
      .doc(id)
      .set(template, { merge: true });

    return NextResponse.json(template, { status: 201 });
  } catch (err) {
    console.error("POST /api/templates", err);
    return NextResponse.json(
      { error: "Failed to save template" },
      { status: 500 },
    );
  }
}
