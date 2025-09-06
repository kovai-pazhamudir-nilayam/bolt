import Database from 'better-sqlite3'
import path from 'path'
import { app } from 'electron'

class ConfigDatabase {
  constructor() {
    // Store database in user data directory
    const userDataPath = app.getPath('userData')
    const dbPath = path.join(userDataPath, 'config.db')

    this.db = new Database(dbPath)
    this.initializeDatabase()
  }

  initializeDatabase() {
    // Create normalized tables for configuration management
    this.db.exec(`
      -- User Preferences (Global settings)
      CREATE TABLE IF NOT EXISTS user_preferences (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        key TEXT UNIQUE NOT NULL,
        value TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Companies Master Data
      CREATE TABLE IF NOT EXISTS companies (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        code TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        logo TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Environments Master Data
      CREATE TABLE IF NOT EXISTS environments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        code TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Core Token Configuration (Company + Environment dependent)
      CREATE TABLE IF NOT EXISTS core_token_configs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        company_id INTEGER NOT NULL,
        environment_id INTEGER NOT NULL,
        domain TEXT NOT NULL,
        token_api TEXT NOT NULL,
        auth_key TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (company_id) REFERENCES companies(id),
        FOREIGN KEY (environment_id) REFERENCES environments(id),
        UNIQUE(company_id, environment_id)
      );

      -- GCP Project Configuration (Company + Environment dependent)
      CREATE TABLE IF NOT EXISTS gcp_project_configs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        company_id INTEGER NOT NULL,
        environment_id INTEGER NOT NULL,
        gcp_project TEXT NOT NULL,
        gcp_cluster TEXT NOT NULL,
        gcp_region TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (company_id) REFERENCES companies(id),
        FOREIGN KEY (environment_id) REFERENCES environments(id),
        UNIQUE(company_id, environment_id)
      );

      -- GitHub Configuration (Company dependent only)
      CREATE TABLE IF NOT EXISTS github_configs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        company_id INTEGER NOT NULL,
        github_token TEXT NOT NULL,
        owner TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (company_id) REFERENCES companies(id),
        UNIQUE(company_id)
      );

      -- Users (Global, not dependent on company/environment)
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        github_handle TEXT UNIQUE NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Legacy table for backward compatibility (will be migrated)
      CREATE TABLE IF NOT EXISTS brand_configs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        brand TEXT NOT NULL,
        environment TEXT NOT NULL,
        config_type TEXT NOT NULL,
        config_data TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(brand, environment, config_type)
      );

      -- Create indexes for better performance
      CREATE INDEX IF NOT EXISTS idx_core_token_company_env ON core_token_configs(company_id, environment_id);
      CREATE INDEX IF NOT EXISTS idx_gcp_company_env ON gcp_project_configs(company_id, environment_id);
      CREATE INDEX IF NOT EXISTS idx_github_company ON github_configs(company_id);
      CREATE INDEX IF NOT EXISTS idx_user_preferences_key ON user_preferences(key);
    `)

    // Migrate existing data and insert sample data
    this.migrateExistingData()
    this.insertSampleData()
  }

  migrateExistingData() {
    // Check if we need to migrate from old brand_configs table
    const existingBrandConfigs = this.db
      .prepare('SELECT COUNT(*) as count FROM brand_configs')
      .get()
    if (existingBrandConfigs.count === 0) return

    // Check if companies and environments already exist
    const existingCompanies = this.db.prepare('SELECT COUNT(*) as count FROM companies').get()
    const existingEnvironments = this.db.prepare('SELECT COUNT(*) as count FROM environments').get()

    if (existingCompanies.count === 0) {
      // Insert companies from existing brand_configs
      const brands = this.db.prepare('SELECT DISTINCT brand FROM brand_configs').all()
      const insertCompany = this.db.prepare(`
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
      const environments = this.db.prepare('SELECT DISTINCT environment FROM brand_configs').all()
      const insertEnvironment = this.db.prepare(`
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
    const gcpConfigs = this.db
      .prepare(
        `
      SELECT bc.brand, bc.environment, bc.config_data 
      FROM brand_configs bc 
      WHERE bc.config_type = 'GCP_CONFIG'
    `
      )
      .all()

    const insertGcpConfig = this.db.prepare(`
      INSERT OR REPLACE INTO gcp_project_configs 
      (company_id, environment_id, gcp_project, gcp_cluster, gcp_region)
      VALUES (
        (SELECT id FROM companies WHERE code = ?),
        (SELECT id FROM environments WHERE code = ?),
        ?, ?, ?
      )
    `)

    gcpConfigs.forEach((config) => {
      const configData = JSON.parse(config.config_data)
      insertGcpConfig.run(
        config.brand,
        config.environment.toUpperCase(),
        configData.project,
        configData.cluster,
        configData.region
      )
    })
  }

  insertSampleData() {
    // Check if sample data already exists
    const existingCompanies = this.db.prepare('SELECT COUNT(*) as count FROM companies').get()
    if (existingCompanies.count > 0) return

    // Insert sample companies
    const companies = [
      { code: 'IBO', name: 'Ebomart', logo: null },
      { code: 'KPN', name: 'Kovai Pazhamudir Nilayam', logo: null }
    ]

    const insertCompany = this.db.prepare(`
      INSERT INTO companies (code, name, logo) VALUES (?, ?, ?)
    `)
    companies.forEach((company) => {
      insertCompany.run(company.code, company.name, company.logo)
    })

    // Insert sample environments
    const environments = [
      { code: 'STAGING', name: 'Staging' },
      { code: 'PRODUCTION', name: 'Production' }
    ]

    const insertEnvironment = this.db.prepare(`
      INSERT INTO environments (code, name) VALUES (?, ?)
    `)
    environments.forEach((env) => {
      insertEnvironment.run(env.code, env.name)
    })

    // Insert sample core token configurations
    const coreTokenConfigs = [
      {
        company_code: 'KPN',
        environment_code: 'STAGING',
        domain: 'https://kpn-staging-api.example.com',
        token_api: '/api/auth/token',
        auth_key: 'kpn-staging-auth-key'
      },
      {
        company_code: 'KPN',
        environment_code: 'PRODUCTION',
        domain: 'https://kpn-prod-api.example.com',
        token_api: '/api/auth/token',
        auth_key: 'kpn-prod-auth-key'
      },
      {
        company_code: 'IBO',
        environment_code: 'STAGING',
        domain: 'https://ibo-staging-api.example.com',
        token_api: '/api/auth/token',
        auth_key: 'ibo-staging-auth-key'
      }
    ]

    const insertCoreToken = this.db.prepare(`
      INSERT INTO core_token_configs (company_id, environment_id, domain, token_api, auth_key)
      VALUES (
        (SELECT id FROM companies WHERE code = ?),
        (SELECT id FROM environments WHERE code = ?),
        ?, ?, ?
      )
    `)
    coreTokenConfigs.forEach((config) => {
      insertCoreToken.run(
        config.company_code,
        config.environment_code,
        config.domain,
        config.token_api,
        config.auth_key
      )
    })

    // Insert sample GCP project configurations
    const gcpConfigs = [
      {
        company_code: 'KPN',
        environment_code: 'STAGING',
        gcp_project: 'kpn-staging-380605',
        gcp_cluster: 'kpn-staging-gke-cluster',
        gcp_region: 'asia-south1'
      },
      {
        company_code: 'KPN',
        environment_code: 'PRODUCTION',
        gcp_project: 'kpn-prod-380605',
        gcp_cluster: 'kpn-prod-gke-cluster',
        gcp_region: 'asia-south1'
      },
      {
        company_code: 'IBO',
        environment_code: 'STAGING',
        gcp_project: 'ibo-staging-380605',
        gcp_cluster: 'ibo-staging-gke-cluster',
        gcp_region: 'asia-south1'
      }
    ]

    const insertGcp = this.db.prepare(`
      INSERT INTO gcp_project_configs (company_id, environment_id, gcp_project, gcp_cluster, gcp_region)
      VALUES (
        (SELECT id FROM companies WHERE code = ?),
        (SELECT id FROM environments WHERE code = ?),
        ?, ?, ?
      )
    `)
    gcpConfigs.forEach((config) => {
      insertGcp.run(
        config.company_code,
        config.environment_code,
        config.gcp_project,
        config.gcp_cluster,
        config.gcp_region
      )
    })

    // Insert sample GitHub configurations
    const githubConfigs = [
      {
        company_code: 'KPN',
        github_token: 'ghp_kpn_token_example',
        owner: 'kpn-org'
      },
      {
        company_code: 'IBO',
        github_token: 'ghp_ibo_token_example',
        owner: 'ibo-org'
      }
    ]

    const insertGithub = this.db.prepare(`
      INSERT INTO github_configs (company_id, github_token, owner)
      VALUES (
        (SELECT id FROM companies WHERE code = ?),
        ?, ?
      )
    `)
    githubConfigs.forEach((config) => {
      insertGithub.run(config.company_code, config.github_token, config.owner)
    })

    // Insert sample users
    const users = [
      { name: 'John Doe', github_handle: 'johndoe' },
      { name: 'Jane Smith', github_handle: 'janesmith' }
    ]

    const insertUser = this.db.prepare(`
      INSERT INTO users (name, github_handle) VALUES (?, ?)
    `)
    users.forEach((user) => {
      insertUser.run(user.name, user.github_handle)
    })

    // Insert sample user preferences
    const userPreferences = [
      { key: 'notifications_enabled', value: 'true' },
      { key: 'left_menu_enabled', value: 'true' },
      { key: 'selected_company', value: 'KPN' },
      { key: 'selected_environment', value: 'STAGING' }
    ]

    const insertPreference = this.db.prepare(`
      INSERT INTO user_preferences (key, value) VALUES (?, ?)
    `)
    userPreferences.forEach((pref) => {
      insertPreference.run(pref.key, pref.value)
    })
  }

  // ===== USER PREFERENCES METHODS =====

  // Get user preference by key
  getUserPreference(key) {
    const stmt = this.db.prepare('SELECT value FROM user_preferences WHERE key = ?')
    const result = stmt.get(key)
    return result ? result.value : null
  }

  // Set user preference
  setUserPreference(key, value) {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO user_preferences (key, value, updated_at)
      VALUES (?, ?, CURRENT_TIMESTAMP)
    `)
    return stmt.run(key, value)
  }

  // Get all user preferences
  getAllUserPreferences() {
    const stmt = this.db.prepare('SELECT key, value FROM user_preferences')
    const results = stmt.all()
    const preferences = {}
    results.forEach((row) => {
      preferences[row.key] = row.value
    })
    return preferences
  }

  // ===== COMPANIES METHODS =====

  // Get all companies
  getCompanies() {
    const stmt = this.db.prepare('SELECT * FROM companies ORDER BY name')
    return stmt.all()
  }

  // Get company by code
  getCompanyByCode(code) {
    const stmt = this.db.prepare('SELECT * FROM companies WHERE code = ?')
    return stmt.get(code)
  }

  // Add new company
  addCompany(code, name, logo = null) {
    const stmt = this.db.prepare(`
      INSERT INTO companies (code, name, logo) VALUES (?, ?, ?)
    `)
    return stmt.run(code, name, logo)
  }

  // ===== ENVIRONMENTS METHODS =====

  // Get all environments
  getEnvironments() {
    const stmt = this.db.prepare('SELECT * FROM environments ORDER BY name')
    return stmt.all()
  }

  // Get environment by code
  getEnvironmentByCode(code) {
    const stmt = this.db.prepare('SELECT * FROM environments WHERE code = ?')
    return stmt.get(code)
  }

  // Add new environment
  addEnvironment(code, name) {
    const stmt = this.db.prepare(`
      INSERT INTO environments (code, name) VALUES (?, ?)
    `)
    return stmt.run(code, name)
  }

  // ===== CORE TOKEN CONFIGURATION METHODS =====

  // Get core token config for company and environment
  getCoreTokenConfig(companyCode, environmentCode) {
    const stmt = this.db.prepare(`
      SELECT ctc.*, c.code as company_code, e.code as environment_code
      FROM core_token_configs ctc
      JOIN companies c ON ctc.company_id = c.id
      JOIN environments e ON ctc.environment_id = e.id
      WHERE c.code = ? AND e.code = ?
    `)
    return stmt.get(companyCode, environmentCode)
  }

  // Save core token config
  saveCoreTokenConfig(companyCode, environmentCode, domain, tokenApi, authKey) {
    const stmt = this.db.prepare(`
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

  // ===== GCP PROJECT CONFIGURATION METHODS =====

  // Get GCP project config for company and environment
  getGcpProjectConfig(companyCode, environmentCode) {
    const stmt = this.db.prepare(`
      SELECT gpc.*, c.code as company_code, e.code as environment_code
      FROM gcp_project_configs gpc
      JOIN companies c ON gpc.company_id = c.id
      JOIN environments e ON gpc.environment_id = e.id
      WHERE c.code = ? AND e.code = ?
    `)
    return stmt.get(companyCode, environmentCode)
  }

  // Save GCP project config
  saveGcpProjectConfig(companyCode, environmentCode, gcpProject, gcpCluster, gcpRegion) {
    const stmt = this.db.prepare(`
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

  // ===== GITHUB CONFIGURATION METHODS =====

  // Get GitHub config for company
  getGithubConfig(companyCode) {
    const stmt = this.db.prepare(`
      SELECT gc.*, c.code as company_code
      FROM github_configs gc
      JOIN companies c ON gc.company_id = c.id
      WHERE c.code = ?
    `)
    return stmt.get(companyCode)
  }

  // Save GitHub config
  saveGithubConfig(companyCode, githubToken, owner) {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO github_configs 
      (company_id, github_token, owner, updated_at)
      VALUES (
        (SELECT id FROM companies WHERE code = ?),
        ?, ?, CURRENT_TIMESTAMP
      )
    `)
    return stmt.run(companyCode, githubToken, owner)
  }

  // ===== USERS METHODS =====

  // Get all users
  getUsers() {
    const stmt = this.db.prepare('SELECT * FROM users ORDER BY name')
    return stmt.all()
  }

  // Get user by GitHub handle
  getUserByGithubHandle(githubHandle) {
    const stmt = this.db.prepare('SELECT * FROM users WHERE github_handle = ?')
    return stmt.get(githubHandle)
  }

  // Add new user
  addUser(name, githubHandle) {
    const stmt = this.db.prepare(`
      INSERT INTO users (name, github_handle) VALUES (?, ?)
    `)
    return stmt.run(name, githubHandle)
  }

  // Update user
  updateUser(id, name, githubHandle) {
    const stmt = this.db.prepare(`
      UPDATE users SET name = ?, github_handle = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `)
    return stmt.run(name, githubHandle, id)
  }

  // Delete user
  deleteUser(id) {
    const stmt = this.db.prepare('DELETE FROM users WHERE id = ?')
    return stmt.run(id)
  }

  // Get user by ID
  getUserById(id) {
    const stmt = this.db.prepare('SELECT * FROM users WHERE id = ?')
    return stmt.get(id)
  }

  // ===== LEGACY METHODS (for backward compatibility) =====

  // Get configuration for specific brand and environment (legacy)
  getConfig(brand, environment, configType = null) {
    if (configType) {
      const stmt = this.db.prepare(`
        SELECT config_data FROM brand_configs 
        WHERE brand = ? AND environment = ? AND config_type = ?
      `)
      const result = stmt.get(brand, environment, configType)
      return result ? JSON.parse(result.config_data) : null
    } else {
      // Get all configs for brand/environment
      const stmt = this.db.prepare(`
        SELECT config_type, config_data FROM brand_configs 
        WHERE brand = ? AND environment = ?
      `)
      const results = stmt.all(brand, environment)

      const configs = {}
      results.forEach((row) => {
        configs[row.config_type] = JSON.parse(row.config_data)
      })
      return configs
    }
  }

  // Save configuration for brand and environment (legacy)
  saveConfig(brand, environment, configType, configData) {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO brand_configs (brand, environment, config_type, config_data, updated_at)
      VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
    `)

    return stmt.run(brand, environment, configType, JSON.stringify(configData))
  }

  // Get all available brands (legacy)
  getBrands() {
    const stmt = this.db.prepare(`
      SELECT DISTINCT brand FROM brand_configs ORDER BY brand
    `)
    return stmt.all().map((row) => row.brand)
  }

  // Get all available environments for a brand (legacy)
  getEnvironments(brand) {
    const stmt = this.db.prepare(`
      SELECT DISTINCT environment FROM brand_configs 
      WHERE brand = ? ORDER BY environment
    `)
    return stmt.all(brand).map((row) => row.environment)
  }

  // Get all brand/environment combinations (legacy)
  getBrandEnvironmentPairs() {
    const stmt = this.db.prepare(`
      SELECT DISTINCT brand, environment FROM brand_configs ORDER BY brand, environment
    `)
    return stmt.all()
  }

  // Delete configuration (legacy)
  deleteConfig(brand, environment, configType) {
    const stmt = this.db.prepare(`
      DELETE FROM brand_configs 
      WHERE brand = ? AND environment = ? AND config_type = ?
    `)
    return stmt.run(brand, environment, configType)
  }

  close() {
    this.db.close()
  }
}

export { ConfigDatabase }
