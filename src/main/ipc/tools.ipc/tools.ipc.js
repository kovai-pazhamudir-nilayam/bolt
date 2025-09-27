import { registerPageBuilderHandler } from './page-builder.ipc'

export const registerToolsHandler = (ipcMain) => {
  registerPageBuilderHandler(ipcMain)
}
