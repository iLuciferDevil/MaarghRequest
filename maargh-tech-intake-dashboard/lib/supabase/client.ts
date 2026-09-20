import { createBrowserClient } from '@supabase/ssr'

const SUPABASE_URL = 'https://cpggikitfurjujtjmbnv.supabase.co'
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_u7FUe14_a8txADyczPhiNw_2s7FZFUc'

export function createClient() {
  return createBrowserClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY,
  )
}
