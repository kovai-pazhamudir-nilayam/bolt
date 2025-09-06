/**
 * GCP Project Configurations database operations
 */

export const getGcpProjectConfig = (db, companyCode, environmentCode) => {
  const stmt = db.prepare(`
    SELECT gpc.*, c.code as company_code, e.code as environment_code
    FROM gcp_project_configs gpc
    JOIN companies c ON gpc.company_id = c.id
    JOIN environments e ON gpc.environment_id = e.id
    WHERE c.code = ? AND e.code = ?
  `)
  return stmt.get(companyCode, environmentCode)
}

export const getAllGcpProjectConfigs = (db) => {
  const stmt = db.prepare(`
    SELECT gpc.*, c.code as company_code, c.name as company_name,
           e.code as environment_code, e.name as environment_name
    FROM gcp_project_configs gpc
    JOIN companies c ON gpc.company_id = c.id
    JOIN environments e ON gpc.environment_id = e.id
    ORDER BY c.name, e.name
  `)
  return stmt.all()
}

export const saveGcpProjectConfig = (db, companyCode, environmentCode, gcpProject, gcpCluster, gcpRegion) => {
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO gcp_project_configs 
    (company_id, environment_id, gcp_project, gcp_cluster, gcp_region, updated_at)
    VALUES (
      (SELECT id FROM companies WHERE code = ?),
      (SELECT id FROM environments WHERE code = ?),
      ?, ?, ?, CURRENT_TIMESTAMP
    )
  `)
  return stmt.run(companyCode, environmentCode, gcpProject, gcpCluster, gcpRegion)
}

export const addGcpProjectConfig = (db, companyId, environmentId, gcpProject, gcpCluster, gcpRegion) => {
  const stmt = db.prepare(`
    INSERT INTO gcp_project_configs (company_id, environment_id, gcp_project, gcp_cluster, gcp_region)
    VALUES (?, ?, ?, ?, ?)
  `)
  return stmt.run(companyId, environmentId, gcpProject, gcpCluster, gcpRegion)
}

export const updateGcpProjectConfig = (db, id, companyId, environmentId, gcpProject, gcpCluster, gcpRegion) => {
  const stmt = db.prepare(`
    UPDATE gcp_project_configs 
    SET company_id = ?, environment_id = ?, gcp_project = ?, gcp_cluster = ?, gcp_region = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `)
  return stmt.run(companyId, environmentId, gcpProject, gcpCluster, gcpRegion, id)
}

export const deleteGcpProjectConfig = (db, id) => {
  const stmt = db.prepare('DELETE FROM gcp_project_configs WHERE id = ?')
  return stmt.run(id)
}
