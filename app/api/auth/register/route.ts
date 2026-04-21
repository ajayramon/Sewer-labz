import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/app/Lib/firebase-admin";

export async function POST(req: Request) {
  try {
    const { email, password, firstName, lastName, company } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password required" },
        { status: 400 },
      );
    }

    // Create user in Firebase Auth
    const userRecord = await adminAuth.createUser({
      email,
      password,
      displayName: `${firstName} ${lastName}`,
    });

    // Save user data to Firestore
    await adminDb
      .collection("users")
      .doc(userRecord.uid)
      .set({
        uid: userRecord.uid,
        email,
        firstName,
        lastName,
        company: company || "",
        plan: "FREE",
        subscriptionStatus: "active",
        createdAt: new Date().toISOString(),
      });

    return NextResponse.json({ success: true, uid: userRecord.uid });
  } catch (err: any) {
    console.error("Signup error:", err);
    return NextResponse.json(
      { error: err.message || "Signup failed" },
      { status: 500 },
    );
  }
}
