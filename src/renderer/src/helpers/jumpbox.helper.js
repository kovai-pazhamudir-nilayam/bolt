import { shellFactory } from '../repos/shell.repo'

const { shellRepo } = shellFactory()

export const getJumpboxPod = async () => {
  const result = await shellRepo.run(
    'kubectl get pods -o=name --field-selector=status.phase=Running'
  )
  if (result.code !== 0) throw new Error(`Failed to get jumpbox pods (code ${result.code})`)
  const pod = (result.stdout || '')
    .split('\n')
    .find((line) => line.includes('jumpbox') || line.includes('pod'))
    ?.split('/')[1]
    ?.trim()
  if (!pod) throw new Error('No running jumpbox pod found')
  return pod
}
