import { NextRequest, NextResponse } from "next/server";

let settingsStore: any = {};

export async function GET() {
  return NextResponse.json(settingsStore);
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    settingsStore = {
      ...settingsStore,
      ...body,
      updatedAt: new Date().toISOString(),
    };
    return NextResponse.json(settingsStore);
  } catch {
    return NextResponse.json(
      { error: "Failed to save settings" },
      { status: 500 },
    );
  }
}
