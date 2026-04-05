import { readFileSync } from 'fs'

export function registerFileHandler(ipcMain) {
  ipcMain.handle('file:readFile', (_, filePath) => {
    const content = readFileSync(filePath, 'utf-8')
    return { content }
  })
}
