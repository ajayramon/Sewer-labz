import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    // ✅ Prevent crash during build or missing env
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({
        reports: 0,
        inspections: 0,
        defects: 0,
      })
    }

    // ✅ Create client ONLY at runtime
    const supabase = createClient(supabaseUrl, supabaseKey)

    const { data, error } = await supabase
      .from("reports")
      .select("*")

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      reports: data?.length ?? 0,
      inspections: data?.length ?? 0,
      defects: data?.length ?? 0,
    })
  } catch (err: unknown) {
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    )
  }
}