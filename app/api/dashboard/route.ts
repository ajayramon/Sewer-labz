import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const getSupabase = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const uid = searchParams.get('uid')

    if (!uid) {
      return NextResponse.json({ error: 'Missing uid' }, { status: 400 })
    }

    // Get user from database
    const { data: user } = await supabase
      .from('users')
      .select('id, company_id')
      .eq('firebase_uid', uid)
      .single()

    if (!user) {
      return NextResponse.json({
        stats: { totalReports: 0, monthReports: 0, drafts: 0, templatesUsed: 0 },
        reports: []
      })
    }

    // Get all reports
    const { data: reports } = await supabase
      .from('reports')
      .select('*')
      .eq('company_id', user.company_id)
      .order('created_at', { ascending: false })
      .limit(10)

    // Get stats
    const { count: totalReports } = await supabase
      .from('reports')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', user.company_id)

    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const { count: monthReports } = await supabase
      .from('reports')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', user.company_id)
      .gte('created_at', startOfMonth.toISOString())

    const { count: drafts } = await supabase
      .from('reports')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', user.company_id)
      .eq('status', 'DRAFT')

    const { count: templatesUsed } = await supabase
      .from('templates')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', user.company_id)

    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('plan, status, trial_ends_at, current_period_end')
      .eq('company_id', user.company_id)
      .maybeSingle()

    return NextResponse.json({
      stats: {
        totalReports: totalReports || 0,
        monthReports: monthReports || 0,
        drafts: drafts || 0,
        templatesUsed: templatesUsed || 0
      },
      subscription: subscription || null,
      reports: reports || []
    })

  } catch (error) {
    console.error('Dashboard error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}