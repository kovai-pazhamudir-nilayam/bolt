import { dialog } from 'electron'
import { promises as fs } from 'fs'

export const registerDbBackupHandler = (ipcMain, configDb) => {
  async function getTables() {
    const rows = await configDb
      .knex('sqlite_master')
      .select('name')
      .where('type', 'table')
      .where('name', 'not like', 'knex_%')
      .where('name', 'not like', 'sqlite_%')
      .orderBy('name')
    return rows.map((r) => r.name)
  }

  async function getTableRecords(event, tableName) {
    return configDb.knex(tableName).select('*')
  }

  async function exportBackup(event, { tables }) {
    const { filePath, canceled } = await dialog.showSaveDialog({
      title: 'Save Backup',
      defaultPath: `bolt-backup-${new Date().toISOString().slice(0, 10)}.json`,
      filters: [{ name: 'JSON', extensions: ['json'] }]
    })
    if (canceled || !filePath) return { canceled: true }

    const payload = {
      version: 1,
      exported_at: new Date().toISOString(),
      tables
    }
    await fs.writeFile(filePath, JSON.stringify(payload, null, 2), 'utf-8')
    return { success: true, path: filePath }
  }

  async function importBackup() {
    const { filePaths, canceled } = await dialog.showOpenDialog({
      title: 'Select Backup File',
      filters: [{ name: 'JSON', extensions: ['json'] }],
      properties: ['openFile']
    })
    if (canceled || !filePaths.length) return { canceled: true }

    const content = await fs.readFile(filePaths[0], 'utf-8')
    const backup = JSON.parse(content)

    let totalInserted = 0
    const results = []

    for (const { name, records } of backup.tables) {
      const exists = await configDb.knex.schema.hasTable(name)
      if (!exists) {
        results.push({ table: name, inserted: 0, skipped: true, reason: 'table does not exist' })
        continue
      }

      let inserted = 0
      for (const record of records) {
        await configDb.knex(name).insert(record).onConflict().ignore()
        inserted++
      }
      totalInserted += inserted
      results.push({ table: name, inserted, skipped: false })
    }

    return { success: true, totalInserted, results }
  }

  async function getTableSchema(event, tableName) {
    const rows = await configDb.knex.raw(`PRAGMA table_info("${tableName}")`)
    return rows
  }

  async function insertRecord(event, { tableName, record }) {
    const [inserted] = await configDb.knex(tableName).insert(record).returning('*')
    return inserted
  }

  ipcMain.handle('dbBackup:getTables', getTables)
  ipcMain.handle('dbBackup:getTableRecords', getTableRecords)
  ipcMain.handle('dbBackup:exportBackup', exportBackup)
  ipcMain.handle('dbBackup:importBackup', importBackup)
  ipcMain.handle('dbBackup:getTableSchema', getTableSchema)
  ipcMain.handle('dbBackup:insertRecord', insertRecord)
}
