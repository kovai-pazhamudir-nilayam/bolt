/**
 * Core Token Configurations database operations
 */

export const getCoreTokenConfig = (db, companyCode, environmentCode) => {
  const stmt = db.prepare(`
    SELECT ctc.*, c.code as company_code, e.code as environment_code
    FROM core_token_configs ctc
    JOIN companies c ON ctc.company_id = c.id
    JOIN environments e ON ctc.environment_id = e.id
    WHERE c.code = ? AND e.code = ?
  `)
  return stmt.get(companyCode, environmentCode)
}

export const getAllCoreTokenConfigs = (db) => {
  const stmt = db.prepare(`
    SELECT ctc.*, c.code as company_code, c.name as company_name,
           e.code as environment_code, e.name as environment_name
    FROM core_token_configs ctc
    JOIN companies c ON ctc.company_id = c.id
    JOIN environments e ON ctc.environment_id = e.id
    ORDER BY c.name, e.name
  `)
  return stmt.all()
}

export const saveCoreTokenConfig = (db, companyCode, environmentCode, domain, tokenApi, authKey) => {
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO core_token_configs 
    (company_id, environment_id, domain, token_api, auth_key, updated_at)
    VALUES (
      (SELECT id FROM companies WHERE code = ?),
      (SELECT id FROM environments WHERE code = ?),
      ?, ?, ?, CURRENT_TIMESTAMP
    )
  `)
  return stmt.run(companyCode, environmentCode, domain, tokenApi, authKey)
}

export const addCoreTokenConfig = (db, companyId, environmentId, domain, tokenApi, authKey) => {
  const stmt = db.prepare(`
    INSERT INTO core_token_configs (company_id, environment_id, domain, token_api, auth_key)
    VALUES (?, ?, ?, ?, ?)
  `)
  return stmt.run(companyId, environmentId, domain, tokenApi, authKey)
}

export const updateCoreTokenConfig = (db, id, companyId, environmentId, domain, tokenApi, authKey) => {
  const stmt = db.prepare(`
    UPDATE core_token_configs 
    SET company_id = ?, environment_id = ?, domain = ?, token_api = ?, auth_key = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `)
  return stmt.run(companyId, environmentId, domain, tokenApi, authKey, id)
}

export const deleteCoreTokenConfig = (db, id) => {
  const stmt = db.prepare('DELETE FROM core_token_configs WHERE id = ?')
  return stmt.run(id)
}
