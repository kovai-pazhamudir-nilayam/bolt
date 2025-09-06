/**
 * Companies database operations
 */

export const getCompanies = (db) => {
  const stmt = db.prepare('SELECT * FROM companies ORDER BY name')
  return stmt.all()
}

export const getCompanyByCode = (db, code) => {
  const stmt = db.prepare('SELECT * FROM companies WHERE code = ?')
  return stmt.get(code)
}

export const addCompany = (db, code, name, logo = null) => {
  const stmt = db.prepare(`
    INSERT INTO companies (code, name, logo) VALUES (?, ?, ?)
  `)
  return stmt.run(code, name, logo)
}

export const updateCompany = (db, id, code, name, logo) => {
  const stmt = db.prepare(`
    UPDATE companies SET code = ?, name = ?, logo = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `)
  return stmt.run(code, name, logo, id)
}

export const deleteCompany = (db, id) => {
  const stmt = db.prepare('DELETE FROM companies WHERE id = ?')
  return stmt.run(id)
}

export const getCompanyById = (db, id) => {
  const stmt = db.prepare('SELECT * FROM companies WHERE id = ?')
  return stmt.get(id)
}
