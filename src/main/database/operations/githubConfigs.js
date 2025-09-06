/**
 * GitHub Configurations database operations
 */

export const getGithubConfig = (db, companyCode) => {
  const stmt = db.prepare(`
    SELECT gc.*, c.code as company_code
    FROM github_configs gc
    JOIN companies c ON gc.company_id = c.id
    WHERE c.code = ?
  `)
  return stmt.get(companyCode)
}

export const getAllGithubConfigs = (db) => {
  const stmt = db.prepare(`
    SELECT gc.*, c.code as company_code, c.name as company_name
    FROM github_configs gc
    JOIN companies c ON gc.company_id = c.id
    ORDER BY c.name
  `)
  return stmt.all()
}

export const saveGithubConfig = (db, companyCode, githubToken, owner) => {
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO github_configs 
    (company_id, github_token, owner, updated_at)
    VALUES (
      (SELECT id FROM companies WHERE code = ?),
      ?, ?, CURRENT_TIMESTAMP
    )
  `)
  return stmt.run(companyCode, githubToken, owner)
}

export const addGithubConfig = (db, companyId, githubToken, owner) => {
  const stmt = db.prepare(`
    INSERT INTO github_configs (company_id, github_token, owner)
    VALUES (?, ?, ?)
  `)
  return stmt.run(companyId, githubToken, owner)
}

export const updateGithubConfig = (db, id, companyId, githubToken, owner) => {
  const stmt = db.prepare(`
    UPDATE github_configs 
    SET company_id = ?, github_token = ?, owner = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `)
  return stmt.run(companyId, githubToken, owner, id)
}

export const deleteGithubConfig = (db, id) => {
  const stmt = db.prepare('DELETE FROM github_configs WHERE id = ?')
  return stmt.run(id)
}
