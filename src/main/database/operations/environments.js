/**
 * Environments database operations
 */

export const getEnvironments = (db) => {
  const stmt = db.prepare('SELECT * FROM environments ORDER BY name')
  return stmt.all()
}

export const getEnvironmentByCode = (db, code) => {
  const stmt = db.prepare('SELECT * FROM environments WHERE code = ?')
  return stmt.get(code)
}

export const addEnvironment = (db, code, name) => {
  const stmt = db.prepare(`
    INSERT INTO environments (code, name) VALUES (?, ?)
  `)
  return stmt.run(code, name)
}

export const updateEnvironment = (db, id, code, name) => {
  const stmt = db.prepare(`
    UPDATE environments SET code = ?, name = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `)
  return stmt.run(code, name, id)
}

export const deleteEnvironment = (db, id) => {
  const stmt = db.prepare('DELETE FROM environments WHERE id = ?')
  return stmt.run(id)
}

export const getEnvironmentById = (db, id) => {
  const stmt = db.prepare('SELECT * FROM environments WHERE id = ?')
  return stmt.get(id)
}
