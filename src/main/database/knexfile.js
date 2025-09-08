import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const migrationsDir = path.join(__dirname, 'migrations')
const seedsDir = path.join(__dirname, 'seeds')

export default {
  development: {
    client: 'better-sqlite3',
    connection: {
      filename: path.join(__dirname, 'dev.db')
    },
    useNullAsDefault: true,
    migrations: {
      directory: migrationsDir,
      extension: 'js'
    },
    seeds: {
      directory: seedsDir
    }
  }
}
