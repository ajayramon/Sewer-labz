import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/app/Lib/firebase-admin";

export async function GET(req: NextRequest) {
  try {
    // 1. Verify the user's token
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = await adminAuth.verifyIdToken(token);
    const uid = decoded.uid;

    // 2. Fetch user's reports from Firestore
    const reportsSnap = await adminDb
      .collection("reports")
      .where("userId", "==", uid)
      .orderBy("createdAt", "desc")
      .get();

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    let totalReports = 0;
    let monthReports = 0;
    let drafts = 0;
    const reports: object[] = [];

    reportsSnap.forEach((doc) => {
      const data = doc.data();
      totalReports++;

      // Count reports created this month
      const createdAt = data.createdAt?.toDate?.() ?? new Date(data.createdAt);
      if (createdAt >= startOfMonth) monthReports++;

      // Count drafts
      if (data.status === "draft" || data.status === "DRAFT") drafts++;

      // Build reports list for the dashboard
      reports.push({
        id: doc.id,
        title: data.title ?? "Untitled Report",
        status: data.status ?? "draft",
        createdAt: createdAt.toISOString(),
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() ?? null,
        clientName: data.clientName ?? null,
        address: data.address ?? null,
      });
    });

    // 3. Fetch user's subscription/plan from Firestore
    const userDoc = await adminDb.collection("users").doc(uid).get();
    const userData = userDoc.data() ?? {};

    const plan = userData.plan ?? "free";
    const status = userData.subscriptionStatus ?? "active";

    // 4. Count templates used by this user
    const templatesSnap = await adminDb
      .collection("templates")
      .where("userId", "==", uid)
      .get();

    const templatesUsed = templatesSnap.size;

    return NextResponse.json({
      stats: {
        totalReports,
        monthReports,
        drafts,
        templatesUsed,
      },
      subscription: {
        plan: plan.toUpperCase(),
        status: status.toUpperCase(),
      },
      reports,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Server error";
    console.error("Dashboard route error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
