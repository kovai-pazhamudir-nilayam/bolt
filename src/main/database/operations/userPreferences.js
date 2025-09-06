/**
 * User Preferences database operations
 */

export const getUserPreference = (db, key) => {
  const stmt = db.prepare('SELECT value FROM user_preferences WHERE key = ?')
  const result = stmt.get(key)
  return result ? result.value : null
}

export const setUserPreference = (db, key, value) => {
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO user_preferences (key, value, updated_at)
    VALUES (?, ?, CURRENT_TIMESTAMP)
  `)
  return stmt.run(key, value)
}

export const getAllUserPreferences = (db) => {
  const stmt = db.prepare('SELECT key, value FROM user_preferences')
  const results = stmt.all()
  const preferences = {}
  results.forEach((row) => {
    preferences[row.key] = row.value
  })
  return preferences
}
