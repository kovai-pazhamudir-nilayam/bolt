const notesAPI = {
  getAll: (filters) => {},
  getById: (id) => {},
  upsert: (input) => {},
  delete: (id) => {},
  addAttachment: (data) => {},
  removeAttachment: (attachment_id) => {},
  getAttachmentPath: (attachment_id) => {},
  getAttachmentInfo: (attachment_id) => {},
  getCategories: () => {}
}

const notesDB = {
  getAll: (filters) => window.notesAPI.notes.getAll(filters),
  getById: (id) => window.notesAPI.notes.getById(id),
  upsert: (input) => window.notesAPI.notes.upsert(input),
  delete: (id) => window.notesAPI.notes.delete(id),
  addAttachment: (data) => window.notesAPI.notes.addAttachment(data),
  removeAttachment: (attachment_id) => window.notesAPI.notes.removeAttachment(attachment_id),
  getAttachmentPath: (attachment_id) => window.notesAPI.notes.getAttachmentPath(attachment_id),
  getAttachmentInfo: (attachment_id) => window.notesAPI.notes.getAttachmentInfo(attachment_id),
  getCategories: () => window.notesAPI.notes.getCategories()
}

const notesFactory = () => {
  const mode = window.runtimeConfig?.mode || 'local'
  if (mode === 'api') {
    return { notesRepo: notesAPI }
  }
  return {
    notesRepo: notesDB
  }
}

export { notesFactory }
