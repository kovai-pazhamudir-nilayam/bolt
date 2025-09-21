import { spawn } from 'child_process'
import path from 'path'

function sendLog(event, message) {
  if (event && event.sender) {
    event.sender.send('taskManagerDI:log', message)
  }
  console.log(message) // still print to console for debugging
}

function getTemplateDir() {
  if (process.env.NODE_ENV === 'development') {
    return path.join(process.cwd(), 'src', 'main', 'templates')
  } else {
    return path.join(process.resourcesPath, 'templates')
  }
}

function runShellCommandInStream(event, command, args, cwd) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd, shell: true })

    child.stdout.on('data', (data) => {
      sendLog(event, `${data.toString().trim()}`)
    })

    child.stderr.on('data', (data) => {
      sendLog(event, `${data.toString().trim()}`)
    })

    child.on('close', (code) => {
      sendLog(event, `process exited with code ${code}`)
      if (code === 0) {
        resolve()
      } else {
        reject(new Error(`Process failed with code ${code}`))
      }
    })
  })
}

export { sendLog, runShellCommandInStream, getTemplateDir }
