// task.ipc.js
import { Notification } from 'electron'

// 🔔 Reminder Scheduler
const scheduledReminders = new Map()

export const registerTaskHandler = (ipcMain, configDb) => {
  function scheduleReminder(task) {
    if (!task.reminder_at) return
    const reminderTime = new Date(task.reminder_at).getTime() - 10 * 60 * 1000 // 10 mins before
    const delay = reminderTime - Date.now()

    if (delay <= 0) return // already passed

    if (scheduledReminders.has(task.id)) {
      clearTimeout(scheduledReminders.get(task.id))
    }

    const timeoutId = setTimeout(() => {
      new Notification({
        title: `Reminder: ${task.title}`,
        body: `Company: ${task.company_code}\n${task.description || ''}`
      }).show()

      scheduledReminders.delete(task.id)
    }, delay)

    scheduledReminders.set(task.id, timeoutId)
  }

  async function createTask(_event, payload) {
    const [task] = await configDb.knex('task').insert(payload).returning('*')
    scheduleReminder(task)
    return task
  }

  async function updateTask(_event, { id, updates }) {
    const [task] = await configDb
      .knex('task')
      .where({ id })
      .update({ ...updates, updated_at: configDb.knex.fn.now() })
      .returning('*')

    if (task.reminder_at) scheduleReminder(task)
    return task
  }

  async function getTaskList() {
    return configDb.knex('task').select('*').orderBy('reminder_at', 'asc')
  }

  ipcMain.handle('task:create', createTask)
  ipcMain.handle('task:update', updateTask)
  ipcMain.handle('task:list', getTaskList)
}
