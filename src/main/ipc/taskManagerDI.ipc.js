// taskManagerDI.ipc

import { dialog } from 'electron'
import fs from 'fs-extra'
import path from 'path'
import { generateTaskManagerCode } from './taskManagerDI/taskManagerDI.lib'

export const registerTaskManagerDIHandler = (ipcMain) => {
  // Folder selection dialog
  ipcMain.handle('generate:taskManagerDICode', async (_event, { targetDir, values }) => {
    return generateTaskManagerCode({ targetDir, values })
  })

  ipcMain.handle('folder:getExistingDomainFolders', async (_event, targetDir) => {
    const folders_needs_to_be_excluded = [
      'commons',
      'downstreamCalls',
      'errorHandler',
      'hooks',
      'plugins',
      'task-di',
      'utils'
    ]
    const appDirPath = path.join(targetDir, 'src', 'app')

    const folders = fs
      .readdirSync(appDirPath, { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name)

    const filteredFolders = folders.filter(
      (folder) => !folders_needs_to_be_excluded.includes(folder)
    )

    return filteredFolders
  })
}
