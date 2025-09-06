import path from 'path'
import { app } from 'electron'
import knexFactory from 'knex'
import { createTables } from './database/schema.js'

class ConfigDatabase {
  constructor() {
    const userDataPath = app.getPath('userData')
    const dbPath = path.join(userDataPath, 'config.db')

    this.knex = knexFactory({
      client: 'better-sqlite3',
      connection: {
        filename: dbPath
      },
      useNullAsDefault: true
    })
    this.initialized = false
  }

  async initializeDatabase() {
    if (this.initialized) return
    await createTables(this.knex)
    this.initialized = true
  }

  // ===== BACKUP METHODS =====
  async exportDatabase() {
    const backupData = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      tables: {}
    }

    const tables = await this.knex
      .select('name')
      .from(this.knex.raw("sqlite_master"))
      .where({ type: 'table' })
      .where('name', 'not like', 'sqlite_%')
      .orderBy('name')

    for (const table of tables) {
      const tableName = table.name
      const data = await this.knex.select('*').from(tableName)
      backupData.tables[tableName] = data
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

      for (const table of tables) {
        await trx(table.name).del()
      }

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
