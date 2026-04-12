import { NextRequest, NextResponse } from "next/server";

const templatesStore: any[] = [];

export async function GET() {
  try {
    return NextResponse.json({ templates: templatesStore });
  } catch {
    return NextResponse.json({ templates: [] });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const template = {
      ...body,
      id: body.id || Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    const existing = templatesStore.findIndex((t) => t.id === template.id);
    if (existing >= 0) {
      templatesStore[existing] = template;
    } else {
      templatesStore.unshift(template);
    }
    return NextResponse.json(template, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to save template" },
      { status: 500 },
    );
  }
}
