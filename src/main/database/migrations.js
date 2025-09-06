/**
 * Database migration and sample data insertion
 */

export const migrateExistingData = (db) => {
  try {
    // Check if we need to migrate from old brand_configs table
    const existingBrandConfigs = db.prepare('SELECT COUNT(*) as count FROM brand_configs').get()
    if (existingBrandConfigs.count === 0) return

    // Check if companies and environments already exist
    const existingCompanies = db.prepare('SELECT COUNT(*) as count FROM companies').get()
    const existingEnvironments = db.prepare('SELECT COUNT(*) as count FROM environments').get()

    if (existingCompanies.count === 0) {
      // Insert companies from existing brand_configs
      const brands = db.prepare('SELECT DISTINCT brand FROM brand_configs').all()
      const insertCompany = db.prepare(`
      INSERT OR IGNORE INTO companies (code, name) VALUES (?, ?)
    `)

      brands.forEach((brand) => {
        const companyName =
          brand.brand === 'kpn'
            ? 'Kovai Pazhamudir Nilayam'
            : brand.brand === 'ibo'
              ? 'Ebomart'
              : brand.brand.charAt(0).toUpperCase() + brand.brand.slice(1)
        insertCompany.run(brand.brand, companyName)
      })
    }

    if (existingEnvironments.count === 0) {
      // Insert environments from existing brand_configs
      const environments = db.prepare('SELECT DISTINCT environment FROM brand_configs').all()
      const insertEnvironment = db.prepare(`
      INSERT OR IGNORE INTO environments (code, name) VALUES (?, ?)
    `)

      environments.forEach((env) => {
        const envName =
          env.environment === 'staging'
            ? 'Staging'
            : env.environment === 'production'
              ? 'Production'
              : env.environment.charAt(0).toUpperCase() + env.environment.slice(1)
        insertEnvironment.run(env.environment.toUpperCase(), envName)
      })
    }

    // Migrate GCP configs from brand_configs
    const gcpConfigs = db
      .prepare(
        `
    SELECT bc.brand, bc.environment, bc.config_data 
    FROM brand_configs bc 
    WHERE bc.config_type = 'GCP_CONFIG'
  `
      )
      .all()

    const insertGcpConfig = db.prepare(`
    INSERT OR REPLACE INTO gcp_project_configs 
    (company_id, environment_id, gcp_project, gcp_cluster, gcp_region)
    VALUES (
      (SELECT id FROM companies WHERE code = ?),
      (SELECT id FROM environments WHERE code = ?),
      ?, ?, ?
    )
  `)

    gcpConfigs.forEach((config) => {
      try {
        const configData = JSON.parse(config.config_data)

        // Check if company and environment exist before inserting
        const company = db.prepare('SELECT id FROM companies WHERE code = ?').get(config.brand)
        const environment = db
          .prepare('SELECT id FROM environments WHERE code = ?')
          .get(config.environment.toUpperCase())

        if (company && environment) {
          insertGcpConfig.run(
            config.brand,
            config.environment.toUpperCase(),
            configData.project,
            configData.cluster,
            configData.region
          )
        } else {
          console.warn(
            `Skipping GCP config migration for ${config.brand}/${config.environment} - company or environment not found`
          )
        }
      } catch (error) {
        console.warn(
          `Error migrating GCP config for ${config.brand}/${config.environment}:`,
          error.message
        )
      }
    })
  } catch (error) {
    console.warn('Error during migration of existing data:', error.message)
  }
}

// Sample data insertion has been removed as per requirements.
