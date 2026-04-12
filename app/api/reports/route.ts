import { NextRequest, NextResponse } from "next/server";

// In-memory store for demo (replace with Firebase/DB later)
const reportsStore: any[] = [];

export async function GET() {
  try {
    return NextResponse.json({ reports: reportsStore });
  } catch {
    return NextResponse.json({ reports: [] });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { report, defects } = body;

    const newReport = {
      ...report,
      id: report.id || Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      defects: defects || [],
    };

    // Add to store if not exists
    const existing = reportsStore.findIndex((r) => r.id === newReport.id);
    if (existing >= 0) {
      reportsStore[existing] = newReport;
    } else {
      reportsStore.unshift(newReport);
    }

    return NextResponse.json(newReport, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to save report" },
      { status: 500 },
    );
  }
}
