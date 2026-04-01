import { shellFactory } from '../repos/shell.repo'

const { shellRepo } = shellFactory()

export const getJumpboxPod = async () => {
  let output = ''
  const unsub = shellRepo.onLog((data) => {
    if (data.type === 'stdout') output += data.output
  })
  const result = await shellRepo.run(
    'kubectl get pods -o=name --field-selector=status.phase=Running'
  )
  unsub()
  if (result.code !== 0) throw new Error(`Failed to get jumpbox pods (code ${result.code})`)
  const pod = output
    .split('\n')
    .find((line) => line.includes('jumpbox') || line.includes('pod'))
    ?.split('/')[1]
    ?.trim()
  if (!pod) throw new Error('No running jumpbox pod found')
  return pod
}
