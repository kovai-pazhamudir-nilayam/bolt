export const savedDbQueryFactory = () => {
  const isWeb = typeof window !== 'undefined' && !window.electron

  class LocalStorageSavedDbQueryRepository {
    constructor() {
      this.storageKey = 'saved_db_queries'
    }

    async getAll() {
      const data = localStorage.getItem(this.storageKey)
      return data ? JSON.parse(data) : []
    }

    async getById(id) {
      const all = await this.getAll()
      return all.find((item) => item.id === id) || null
    }

    async upsert(input) {
      const all = await this.getAll()
      let updated
      if (input.id) {
        updated = all.map((item) => (item.id === input.id ? { ...item, ...input } : item))
      } else {
        const newEntry = {
          ...input,
          id: Date.now().toString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        updated = [...all, newEntry]
      }
      localStorage.setItem(this.storageKey, JSON.stringify(updated))
      return input.id ? input : updated[updated.length - 1]
    }

    async delete(id) {
      const all = await this.getAll()
      const filtered = all.filter((item) => item.id !== id)
      localStorage.setItem(this.storageKey, JSON.stringify(filtered))
    }
  }

  class ElectronSavedDbQueryRepository {
    async getAll() {
      return window.savedDbQueryAPI.getAll()
    }

    async getById(id) {
      return window.savedDbQueryAPI.getById(id)
    }

    async upsert(input) {
      return window.savedDbQueryAPI.upsert(input)
    }

    async delete(id) {
      return window.savedDbQueryAPI.delete(id)
    }
  }

  const savedDbQueryRepo = isWeb
    ? new LocalStorageSavedDbQueryRepository()
    : new ElectronSavedDbQueryRepository()

  return { savedDbQueryRepo }
}
