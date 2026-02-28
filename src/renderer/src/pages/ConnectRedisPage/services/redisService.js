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
  const command = `kubectl exec ${context.pod} -- sh -c "export REDISCLI_AUTH='${password}' && redis-cli -h ${host} --no-auth-warning --raw ${redisCommand}"`
  return await runShellCommand(command, `Redis: ${redisCommand}`)
}

export const getJumpboxPod = async () => {
  const kubectlCommand = 'kubectl get pods -o=name --field-selector=status.phase=Running'
  return new Promise((resolve, reject) => {
    let output = ''
    const handleLog = (data) => (output += data.output)
    const handleEnd = (data) => {
      if (data.code === 0) {
        const jumpboxPod = output
          .split('\n')
          .find((line) => line.includes('jumpbox') || line.includes('pod'))
          ?.split('/')[1]
          ?.trim()
        jumpboxPod ? resolve(jumpboxPod) : reject(new Error('No running jumpbox pod found'))
      } else {
        reject(new Error(`Failed to get jumpbox pod with code ${data.code}`))
      }
    }
    shellRepo.onLog(handleLog)
    shellRepo.onEnd(handleEnd)
    shellRepo.run(kubectlCommand).catch(reject)
  })
}
