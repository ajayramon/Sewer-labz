import { NextRequest, NextResponse } from 'next/server'
import { adminAuth } from '@/app/Lib/firebase-admin'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const { uid, email, displayName, companyName } = await request.json()

    // Create company if companyName is provided
    let companyId = null
    if (companyName) {
      const company = await prisma.company.create({
        data: {
          name: companyName,
          slug: companyName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        },
      })
      companyId = company.id
    }

    // Create user in database
    const user = await prisma.user.create({
      data: {
        firebaseUid: uid,
        email: email,
        name: displayName,
        companyId: companyId,
      },
    })

    return NextResponse.json({ success: true, user })
  } catch (error: any) {
    console.error('Registration error:', error)

    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    )
  }
}