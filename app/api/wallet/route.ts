import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    let { data: wallet } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', user.id)
      .single()

    // Auto-create wallet if missing (handles legacy users)
    if (!wallet) {
      const { data: newWallet } = await supabase
        .from('wallets')
        .insert({ user_id: user.id })
        .select('*')
        .single()
      wallet = newWallet
    }

    return NextResponse.json({ wallet })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
