import { NextRequest, NextResponse } from "next/server";

const templatesStore: any[] = [];

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const body = await req.json();
    const updated = {
      ...body,
      id: params.id,
      updatedAt: new Date().toISOString(),
    };
    const existing = templatesStore.findIndex((t) => t.id === params.id);
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
  { params }: { params: { id: string } },
) {
  try {
    const index = templatesStore.findIndex((t) => t.id === params.id);
    if (index >= 0) templatesStore.splice(index, 1);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete template" },
      { status: 500 },
    );
  }
}
