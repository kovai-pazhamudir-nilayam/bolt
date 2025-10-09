import { promises as fs } from 'fs'

export const registerNotesHandler = (ipcMain, configDb) => {
  async function getAllNotes(event, filters = {}) {
    let query = configDb.knex('notes').select('*').orderBy('created_at', 'desc')

    if (filters.category) {
      query = query.where('category', filters.category)
    }

    if (filters.company_code) {
      query = query.where('company_code', filters.company_code)
    }

    return query
  }

  async function getNoteById(event, id) {
    const note = await configDb.knex('notes').where({ id }).first()
    if (!note) return null

    const attachments = await configDb.knex('note_attachments').where({ note_id: id }).select('*')

    return { ...note, attachments }
  }

  async function upsertNote(event, input) {
    const { id, title, content, category, company_code } = input

    if (id) {
      // Update existing note
      const [note] = await configDb
        .knex('notes')
        .where({ id })
        .update({
          title,
          content,
          category,
          company_code,
          updated_at: configDb.knex.fn.now()
        })
        .returning('*')
      return note
    } else {
      // Create new note
      const [note] = await configDb
        .knex('notes')
        .insert({
          title,
          content,
          category,
          company_code,
          created_at: configDb.knex.fn.now(),
          updated_at: configDb.knex.fn.now()
        })
        .returning('*')
      return note
    }
  }

  async function deleteNote(event, id) {
    // Delete attachments first (due to foreign key constraint)
    await configDb.knex('note_attachments').where({ note_id: id }).del()

    // Delete the note
    return configDb.knex('notes').where({ id }).del()
  }

  async function addAttachment(event, { note_id, file_path, file_name, file_size, mime_type }) {
    const [attachment] = await configDb
      .knex('note_attachments')
      .insert({
        note_id,
        file_name,
        file_path,
        file_size,
        mime_type,
        created_at: configDb.knex.fn.now()
      })
      .returning('*')

    return attachment
  }

  async function removeAttachment(event, attachment_id) {
    const attachment = await configDb.knex('note_attachments').where({ id: attachment_id }).first()
    if (!attachment) return false

    // Delete file from filesystem
    try {
      await fs.unlink(attachment.file_path)
    } catch (error) {
      console.warn('Failed to delete attachment file:', error)
    }

    // Delete from database
    return configDb.knex('note_attachments').where({ id: attachment_id }).del()
  }

  async function getAttachmentPath(event, attachment_id) {
    const attachment = await configDb.knex('note_attachments').where({ id: attachment_id }).first()
    return attachment ? attachment.file_path : null
  }

  async function getAttachmentInfo(event, attachment_id) {
    return configDb.knex('note_attachments').where({ id: attachment_id }).first()
  }

  async function getCategories() {
    const categories = await configDb
      .knex('notes')
      .select('category')
      .whereNotNull('category')
      .where('category', '!=', '')
      .distinct()
      .orderBy('category')

    return categories.map((row) => row.category)
  }

  ipcMain.handle('notes:getAll', getAllNotes)
  ipcMain.handle('notes:getById', getNoteById)
  ipcMain.handle('notes:upsert', upsertNote)
  ipcMain.handle('notes:delete', deleteNote)
  ipcMain.handle('notes:addAttachment', addAttachment)
  ipcMain.handle('notes:removeAttachment', removeAttachment)
  ipcMain.handle('notes:getAttachmentPath', getAttachmentPath)
  ipcMain.handle('notes:getAttachmentInfo', getAttachmentInfo)
  ipcMain.handle('notes:getCategories', getCategories)
}
