import { shellFactory } from '../../../repos/shell.repo'

const { shellRepo } = shellFactory()

export const runShellCommand = async (command, description) => {
  return new Promise((resolve, reject) => {
    let output = ''
    const lUnsub = shellRepo.onLog((data) => {
      // Only include actual process output (stdout/stderr) in the returned string
      // Exclude meta-logs like 'Starting command' which are sent as type 'info'
      if (data.type === 'stdout' || data.type === 'stderr') {
        output += data.output
      }
    })
    const eUnsub = shellRepo.onEnd((data) => {
      lUnsub()
      eUnsub()
      if (data.code === 0) resolve(output)
      else reject(new Error(`${description} failed with code ${data.code}`))
    })
    shellRepo.run(command).catch((err) => {
      lUnsub()
      eUnsub()
      reject(err)
    })
  })
}

export const runRedisCommand = async (redisCommand, context) => {
  if (!context?.pod || !context?.config) {
    return null
  }
  const { redis_host: host, redis_password: password } = context.config
  // Escape shell glob characters so sh -c doesn't expand them before redis-cli sees them
  const safeCmd = redisCommand.replace(/\*/g, '\\*').replace(/\?/g, '\\?').replace(/\[/g, '\\[')
  const command = `kubectl exec ${context.pod} -- sh -c "export REDISCLI_AUTH='${password}' && redis-cli -h ${host} --no-auth-warning --raw ${safeCmd}"`
  return await runShellCommand(command, `Redis: ${redisCommand}`)
}
