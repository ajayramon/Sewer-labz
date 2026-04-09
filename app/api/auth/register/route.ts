import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { firebaseUid, email, name, companyName } = await req.json()

    if (!firebaseUid || !email || !companyName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create company slug
    const slug = companyName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')

    // Create company
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .insert({ name: companyName, slug: `${slug}-${Date.now()}` })
      .select()
      .single()

    if (companyError) {
      console.error('Company error:', companyError)
      return NextResponse.json(
        { error: 'Failed to create company' },
        { status: 500 }
      )
    }

    // Create user
    const { data: user, error: userError } = await supabase
      .from('users')
      .insert({
        firebase_uid: firebaseUid,
        email,
        name,
        company_id: company.id,
        role: 'OWNER'
      })
      .select()
      .single()

    if (userError) {
      console.error('User error:', userError)
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      )
    }

    // Create free subscription
    await supabase
      .from('subscriptions')
      .insert({
        company_id: company.id,
        plan: 'FREE',
        status: 'TRIALING'
      })

    return NextResponse.json({ success: true, user, company })

  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}