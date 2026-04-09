import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({ message: "API disabled temporarily" })
}

export async function POST() {
  return NextResponse.json({ message: "API disabled temporarily" })
}