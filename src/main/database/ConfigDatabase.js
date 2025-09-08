// src/main/database/ConfigDatabase.js
import path from 'path'
import { app } from 'electron'
import knexFactory from 'knex'
import fs from 'fs'
// import { fileURLToPath } from 'url'

// const __filename = fileURLToPath(import.meta.url)
// const __dirname = path.dirname(__filename)

// Helper: resolve migrations/seeds paths depending on environment
function resolveResourceDir(relativePath) {
  if (app.isPackaged) {
    // In production: bundled via extraResources → lives in resources/
    return path.join(process.resourcesPath, relativePath)
  } else {
    // In dev: use src folder directly (not out/)
    return path.join(process.cwd(), 'src/main/database', relativePath)
  }
}

class ConfigDatabase {
  constructor() {
    const userDataPath = app.getPath('userData')
    const dbPath = path.join(userDataPath, 'config.db')

    const migrationsDir = resolveResourceDir('migrations')
    const seedsDir = resolveResourceDir('seeds')

    if (!fs.existsSync(migrationsDir)) {
      console.warn('[DB] Missing migrations dir:', migrationsDir)
    }
    if (!fs.existsSync(seedsDir)) {
      console.warn('[DB] Missing seeds dir:', seedsDir)
    }

    this.knex = knexFactory({
      client: 'better-sqlite3',
      connection: { filename: dbPath },
      useNullAsDefault: true,
      migrations: { directory: migrationsDir },
      seeds: { directory: seedsDir }
    })

    this.initialized = false
  }

  async initializeDatabase() {
    if (this.initialized) return
    await this.knex.migrate.latest()
    // If you want to seed on first run, uncomment:
    // await this.knex.seed.run()
    this.initialized = true
    console.log('[DB] Initialized at', this.knex.client.config.connection.filename)
  }

  async exportDatabase() {
    const backupData = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      tables: {}
    }

    const tables = await this.knex
      .select('name')
      .from(this.knex.raw('sqlite_master'))
      .where({ type: 'table' })
      .where('name', 'not like', 'sqlite_%')
      .orderBy('name')

    for (const table of tables) {
      const tableName = table.name
      try {
        const data = await this.knex.select('*').from(tableName)
        backupData.tables[tableName] = data
      } catch (err) {
        console.warn(`[DB] Skipped table ${tableName}:`, err.message)
      }
    }

    return JSON.stringify(backupData, null, 2)
  }

  async importDatabase(jsonData) {
    const backupData = JSON.parse(jsonData)
    if (!backupData.version || !backupData.tables) {
      throw new Error('Invalid backup file format')
    }

    await this.knex.transaction(async (trx) => {
      const tables = await trx
        .select('name')
        .from(trx.raw('sqlite_master'))
        .where({ type: 'table' })
        .where('name', 'not like', 'sqlite_%')
        .orderBy('name')

      // Clear all tables first
      for (const table of tables) {
        await trx(table.name).del()
      }

      // Reinsert backup data
      for (const [tableName, data] of Object.entries(backupData.tables)) {
        if (Array.isArray(data) && data.length > 0) {
          await trx.batchInsert(tableName, data)
        }
      }
    })
  }

  async close() {
    await this.knex.destroy()
  }
}

export { ConfigDatabase }
