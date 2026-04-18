import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/app/Lib/firebase-admin";

export async function GET(req: NextRequest) {
  try {
    const uid = req.headers.get("x-user-id");
    if (!uid) return NextResponse.json({ reports: [] });

    const snap = await adminDb
      .collection("users")
      .doc(uid)
      .collection("reports")
      .orderBy("updatedAt", "desc")
      .get();

    const reports = snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ reports });
  } catch (err) {
    console.error("GET /api/reports", err);
    return NextResponse.json({ reports: [] });
  }
}

export async function POST(req: NextRequest) {
  try {
    const uid = req.headers.get("x-user-id");
    if (!uid)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { report, defects } = body;

    const id = report.id || Date.now().toString();
    const now = new Date().toISOString();

    const data = {
      ...report,
      id,
      defects: defects || [],
      createdAt: report.createdAt || now,
      updatedAt: now,
    };

    await adminDb
      .collection("users")
      .doc(uid)
      .collection("reports")
      .doc(id)
      .set(data, { merge: true });

    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    console.error("POST /api/reports", err);
    return NextResponse.json(
      { error: "Failed to save report" },
      { status: 500 },
    );
  }
}
