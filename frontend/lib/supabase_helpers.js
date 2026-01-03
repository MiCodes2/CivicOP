import { supabase } from './supabase'

const _cache = {}

export async function tableExists(tableName) {
  if (_cache[tableName] !== undefined) return _cache[tableName]
  try {
    const { data, error } = await supabase.from(tableName).select('id').limit(1)
    if (error) {
      const msg = (error && error.message) || ''
      // Common Postgres message when relation doesn't exist
      if (/does not exist|relation .* does not exist/i.test(msg)) {
        _cache[tableName] = false
        console.info(`[supabase_helpers] tableExists(${tableName}) -> false (missing)`)
        return false
      }
      // Permission or other errors: treat as not available but log
      console.warn('[supabase_helpers] tableExists check returned error:', tableName, error)
      _cache[tableName] = false
      return false
    }

    _cache[tableName] = true
    console.info(`[supabase_helpers] tableExists(${tableName}) -> true`)
    return true
  } catch (err) {
    console.warn('[supabase_helpers] tableExists exception:', err)
    _cache[tableName] = false
    return false
  }
}