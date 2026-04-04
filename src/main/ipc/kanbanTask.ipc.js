export const registerKanbanTaskHandler = (ipcMain, configDb) => {
  async function getAll() {
    const rows = await configDb.knex('kanban_task').select('*').orderBy('created_at', 'asc')
    return rows.map((r) => JSON.parse(r.data))
  }

  async function upsert(_event, task) {
    const exists = await configDb.knex('kanban_task').where({ id: task.id }).first()
    if (exists) {
      await configDb.knex('kanban_task').where({ id: task.id }).update({
        data: JSON.stringify(task),
        updated_at: configDb.knex.fn.now()
      })
    } else {
      await configDb.knex('kanban_task').insert({
        id: task.id,
        data: JSON.stringify(task),
        created_at: configDb.knex.fn.now(),
        updated_at: configDb.knex.fn.now()
      })
    }
    return task
  }

  async function remove(_event, id) {
    return configDb.knex('kanban_task').where({ id }).del()
  }

  ipcMain.handle('kanbanTask:getAll', getAll)
  ipcMain.handle('kanbanTask:upsert', upsert)
  ipcMain.handle('kanbanTask:delete', remove)
}
