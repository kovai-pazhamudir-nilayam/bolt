import { dialog } from 'electron'
import fs from 'fs'

export const registerSystemHandler = (ipcMain) => {
  async function selectFolder() {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory']
    })
    if (result.canceled || !result.filePaths.length) return null
    return result.filePaths[0]
  }

  async function listFiles(_event, input_path) {
    const fileNames = fs
      .readdirSync(input_path, { withFileTypes: true })
      .filter((dirent) => !dirent.isDirectory() && dirent.name !== '.DS_Store')
      .filter((dirent) => !dirent.isDirectory() && dirent.name !== 'Thumbs.db')
      .filter((dirent) => !dirent.isDirectory() && dirent.name !== 'desktop.ini')
      .map((dir) => dir.name)

    return fileNames.sort((a, b) => {
      return Number(a.split('.')[0].split('_')[1]) - Number(b.split('.')[0].split('_')[1])
    })
  }

  async function makeHTTPRequest(_event, url, options = {}) {
    const { method = 'GET', headers = {}, body } = options

    try {
      const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const jsonResponse = await response.json()
      return jsonResponse
    } catch (error) {
      console.error('Error making HTTP request:', error)
      throw error
    }
  }

  ipcMain.handle('system:select-folder', selectFolder)
  ipcMain.handle('system:list-files', listFiles)
  ipcMain.handle('system:http-request', makeHTTPRequest)
}
