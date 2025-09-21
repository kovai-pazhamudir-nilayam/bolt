import { ipcRenderer } from 'electron'

const terminalApi = {
  run: (command) => ipcRenderer.send('terminal:run', command),
  onLog: (cb) => ipcRenderer.on('terminal:log', (_e, log) => cb(log)),
  onEnd: (cb) => ipcRenderer.on('terminal:end', (_e, code) => cb(code))
}
export { terminalApi }
