import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

let supabaseInstance: SupabaseClient | null = null

if (supabaseUrl && supabaseAnonKey) {
  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  })
} else {
  console.warn('Supabase credentials not found. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local')
}

// Export a proxy that handles missing credentials gracefully
export const supabase = supabaseInstance || ({
  auth: {
    signIn: () => Promise.reject(new Error('Supabase not configured')),
    signOut: () => Promise.reject(new Error('Supabase not configured')),
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
  },
  from: () => ({
    select: () => ({ data: [], error: null }),
    insert: () => Promise.reject(new Error('Supabase not configured')),
    update: () => Promise.reject(new Error('Supabase not configured')),
    delete: () => Promise.reject(new Error('Supabase not configured')),
  }),
  channel: () => ({
    on: () => ({ subscribe: () => ({ unsubscribe: () => {} }) }),
  }),
} as any)

// Database helper functions
export const dbHelpers = {
  // Users
  async getUsers() {
    const { data, error } = await supabase.from('users').select('*')
    if (error) throw error
    return data
  },

  async getUserById(id: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single()
    return { data, error }
  },

  // Incidents (prefer 'civic_issues' if available, else fallback to 'incidents')
  async getIncidents(limit = 100) {
    // prefer civic_issues
    try {
      const { data, error } = await supabase
        .from('civic_issues')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit)
      if (!error) return data
    } catch (e) {
      console.debug('getIncidents: civic_issues read failed, trying incidents', e)
    }
    // fallback
    const { data, error } = await supabase
      .from('incidents')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)
    if (error) throw error
    return data
  },

  async getIncidentById(id: string) {
    try {
      const { data, error } = await supabase
        .from('civic_issues')
        .select('*')
        .eq('id', id)
        .single()
      if (!error) return data
    } catch (e) {
      console.debug('getIncidentById: civic_issues read failed, trying incidents', e)
    }

    const { data, error } = await supabase
      .from('incidents')
      .select('*')
      .eq('id', id)
      .single()
    if (error) throw error
    return data
  },

  async createIncident(incident: any) {
    try {
      const { data, error } = await supabase
        .from('civic_issues')
        .insert([incident])
        .select()
      if (!error) return data
    } catch (e) {
      console.debug('createIncident: civic_issues insert failed, trying incidents', e)
    }

    const { data, error } = await supabase
      .from('incidents')
      .insert([incident])
      .select()
    if (error) throw error
    return data
  },

  async updateIncident(id: string, updates: any) {
    // Try civic_issues table first
    const { data, error } = await supabase
      .from('civic_issues')
      .update(updates)
      .eq('id', id)
      .select()
    
    if (error) {
      console.error('updateIncident failed:', error)
      throw error
    }
    
    console.log('updateIncident success:', data)
    return data
  },

  // Real-time subscriptions (try both tables, but do not fail if one is missing)
  subscribeToIncidents(callback: (payload: any) => void) {
    const sub1 = supabase
      .channel('civic_issues-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'civic_issues' }, callback)
      .subscribe()

    let sub2: any = null
    // try to subscribe to incidents table but ignore failures
    try {
      sub2 = supabase
        .channel('incidents-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'incidents' }, callback)
        .subscribe()
    } catch (err) {
      console.debug('subscribeToIncidents: incidents subscription failed (table may not exist)', err)
    }

    return {
      unsubscribe() {
        sub1.unsubscribe()
        if (sub2) sub2.unsubscribe()
      }
    }
  },
}

// Auth helpers
export const authHelpers = {
  async signUp(email: string, password: string, userData?: any) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData,
      },
    })
    if (error) throw error
    return data
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
    return data
  },

  // Sign in with either email or username
  async signInWithEmailOrUsername(emailOrUsername: string, password: string) {
    let email = emailOrUsername

    // Check if input looks like a username (no @ symbol) and not an email
    if (!emailOrUsername.includes('@')) {
      // Look up user by username to get their email
      const { data, error } = await supabase
        .from('users')
        .select('email')
        .eq('username', emailOrUsername)
        .single()

      if (error || !data) {
        throw new Error(`User with username '${emailOrUsername}' not found`)
      }

      email = data.email
    }

    // Now sign in with the email
    return this.signIn(email, password)
  },

  async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  async getSession() {
    const { data, error } = await supabase.auth.getSession()
    if (error) throw error
    return data.session
  },

  async getUser() {
    const { data, error } = await supabase.auth.getUser()
    if (error) throw error
    return data.user
  },

  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback)
  },
}

// Storage helpers
export const storageHelpers = {
  async uploadFile(bucket: string, path: string, file: File) {
    const { data, error } = await supabase.storage.from(bucket).upload(path, file)
    if (error) throw error
    return data
  },

  async getPublicUrl(bucket: string, path: string) {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path)
    return data.publicUrl
  },

  async deleteFile(bucket: string, path: string) {
    const { error } = await supabase.storage.from(bucket).remove([path])
    if (error) throw error
  },
}

export default supabase
