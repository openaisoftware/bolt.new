import { supabase } from '~/lib/supabase'

export async function getSession(request: Request) {
  const { data: { session } } = await supabase.auth.getSession()
  return session
} 