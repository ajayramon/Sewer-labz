import { NextRequest, NextResponse } from "next/server";

// Shared store reference
const reportsStore: any[] = [];

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const report = reportsStore.find((r) => r.id === id);
    if (!report) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(report);
  } catch {
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
    const body = await req.json();
    const { report, defects } = body;

    const updated = {
      ...report,
      id,
      updatedAt: new Date().toISOString(),
      defects: defects || [],
    };

    const existing = reportsStore.findIndex((r) => r.id === id);
    if (existing >= 0) {
      reportsStore[existing] = updated;
    } else {
      reportsStore.unshift(updated);
    }

    return NextResponse.json(updated);
  } catch {
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
    const index = reportsStore.findIndex((r) => r.id === id);
    if (index >= 0) reportsStore.splice(index, 1);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
