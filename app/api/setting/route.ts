import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    // Settings are saved in localStorage on the frontend
    // Add your database logic here if needed in the future
    return NextResponse.json({ success: true, data: body });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: "Failed to save settings" },
      { status: 500 },
    );
  }
}
