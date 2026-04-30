import { NextResponse } from "next/server";
import { adminDb } from "@/app/Lib/firebase-admin";

export async function GET() {
  try {
    const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;

    // Test Firebase connection
    await adminDb.collection("test").limit(1).get();

    return NextResponse.json({
      success: true,
      projectId,
      clientEmail,
      privateKeyStart: privateKey?.slice(0, 40),
      privateKeyEnd: privateKey?.slice(-20),
      privateKeyLength: privateKey?.length,
    });
  } catch (err) {
    return NextResponse.json({
      success: false,
      error: err instanceof Error ? err.message : String(err),
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKeyLength: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.length,
      privateKeyStart: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.slice(0, 40),
    });
  }
}
