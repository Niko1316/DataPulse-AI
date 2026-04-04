import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { apiRateLimit, checkRateLimit } from '@/lib/ratelimit'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Auth check
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Rate limit
  const rl = await checkRateLimit(apiRateLimit, user.id)
  if (!rl.success) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 }
    )
  }

  const { id } = await params

  // Fetch project with related data, enforcing ownership via user_id filter
  const { data: project, error } = await supabase
    .from('projects')
    .select(`
      *,
      document_insights (*),
      generated_assets (*)
    `)
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error || !project) {
    // Differentiate between not found and DB error
    if (error?.code === 'PGRST116') {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }
    console.error('Failed to fetch project:', error)
    return NextResponse.json({ error: 'Failed to fetch project' }, { status: 500 })
  }

  return NextResponse.json({ project })
}
