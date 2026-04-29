import { NextRequest, NextResponse } from "next/server";
import { adminDb, adminAuth } from "@/app/Lib/firebase-admin";

const ADMIN_EMAILS = ["ajayraymon750@gmail.com"]; // ← add your admin email here

export async function GET(req: NextRequest) {
  try {
    // Verify the request is from an admin
    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "");
    if (!token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = await adminAuth.verifyIdToken(token);
    if (!ADMIN_EMAILS.includes(decoded.email || "")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get all users from Firebase Auth
    const listResult = await adminAuth.listUsers(1000);

    // Get all user settings from Firestore (plan info)
    const users = await Promise.all(
      listResult.users.map(async (u) => {
        try {
          // Get settings doc for this user
          const settingsDoc = await adminDb
            .collection("users")
            .doc(u.uid)
            .collection("settings")
            .doc("profile")
            .get();

          // Get report count
          const reportsSnap = await adminDb
            .collection("users")
            .doc(u.uid)
            .collection("reports")
            .get();

          const settings = settingsDoc.exists ? settingsDoc.data() : {};

          // Get last active from most recent report
          let lastActive = "";
          if (!reportsSnap.empty) {
            const sorted = reportsSnap.docs
              .map((d) => d.data())
              .sort((a, b) =>
                (b.updatedAt || "").localeCompare(a.updatedAt || ""),
              );
            lastActive = sorted[0]?.updatedAt || "";
          }

          return {
            uid: u.uid,
            email: u.email || "",
            displayName: u.displayName || (settings as any)?.fullName || "",
            createdAt: u.metadata.creationTime || "",
            plan: (settings as any)?.plan || "free",
            reportsCount: reportsSnap.size,
            lastActive,
            subscriptionId: (settings as any)?.subscriptionId || "",
          };
        } catch {
          return {
            uid: u.uid,
            email: u.email || "",
            displayName: u.displayName || "",
            createdAt: u.metadata.creationTime || "",
            plan: "free",
            reportsCount: 0,
            lastActive: "",
          };
        }
      }),
    );

    // Sort by createdAt descending (newest first)
    users.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

    return NextResponse.json({ users });
  } catch (err) {
    console.error("GET /api/admin/users", err);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 },
    );
  }
}
