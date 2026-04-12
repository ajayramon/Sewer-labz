import { NextRequest, NextResponse } from "next/server";

const templatesStore: any[] = [];

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const template = templatesStore.find((t) => t.id === id);
    if (!template) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(template);
  } catch {
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
    const body = await req.json();

    const updated = {
      ...body,
      id,
      updatedAt: new Date().toISOString(),
    };

    const existing = templatesStore.findIndex((t) => t.id === id);
    if (existing >= 0) {
      templatesStore[existing] = updated;
    } else {
      templatesStore.unshift(updated);
    }

    return NextResponse.json(updated);
  } catch {
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
    const index = templatesStore.findIndex((t) => t.id === id);
    if (index >= 0) templatesStore.splice(index, 1);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
