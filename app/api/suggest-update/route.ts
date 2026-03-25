import { getSupabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const supabase = getSupabase() // ✅ FIXED

  const formData = await req.formData()

  const resource_id = formData.get('resource_id') as string
  const message = formData.get('message') as string

  if (!resource_id || !message) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const { error } = await supabase
    .from('resource_submissions')
    .insert({
      type: 'update',
      resource_id,
      message,
    })

  if (error) {
    console.error('INSERT ERROR:', error)
    return NextResponse.json({ error: 'Failed to submit' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}