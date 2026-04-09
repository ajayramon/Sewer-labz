import { NextResponse } from "next/server"

export async function GET() {
  try {
    // ✅ Frontend-only mock data (no database)

    return NextResponse.json({
      stats: {
        totalReports: 0,
        monthReports: 0,
        drafts: 0,
        templatesUsed: 0
      },
      subscription: {
        plan: "FREE",
        status: "ACTIVE"
      },
      reports: []
    })

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Server error" },
      { status: 500 }
    )
  }
}