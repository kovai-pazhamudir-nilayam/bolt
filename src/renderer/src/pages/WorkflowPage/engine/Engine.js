import { findLoopBodyIds, topologicalSort } from './topologicalSort'
import { EXECUTORS } from './executors/index'

/**
 * Dispatch a single node's executor with optional retry.
 * Passed into context so loop.executor.js can call it without circular imports.
 */
async function dispatchExecutor(node, items, context) {
  const executor = EXECUTORS[node.type]
  if (!executor) throw new Error(`No executor for node type: ${node.type}`)

  const maxRetries = node.data?.config?.retryCount ?? 0
  let lastError

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    if (attempt > 0) {
      context.onLog(node.id, node.data.label, `Retrying (attempt ${attempt + 1}/${maxRetries + 1})…`, 'warn')
      await new Promise((res) => setTimeout(res, 500 * attempt))
    }
    const result = await executor(node, items, context).catch((err) => {
      lastError = err
      return undefined
    })
    if (result !== undefined) return result
  }
  throw lastError
}

/**
 * Main workflow execution function.
 *
 * @param {object[]} nodes
 * @param {object[]} edges
 * @param {function} onNodeStatus  (nodeId, status) — 'running' | 'success' | 'error'
 * @param {function} onLog         (nodeId, label, message, level) — 'info' | 'warn' | 'error'
 * @param {object}   debugOptions  { stepMode: bool, onStepReady: (nodeId) => Promise<void> }
 * @returns {{ outputs: Map, logs: array }}
 */
export async function executeWorkflow(nodes, edges, onNodeStatus, onLog = () => {}, debugOptions = {}) {
  if (!nodes.length) return { outputs: new Map(), logs: [] }

  const nodeMap = {}
  for (const n of nodes) nodeMap[n.id] = n

  const edgeMap = {}
  for (const n of nodes) edgeMap[n.id] = []
  for (const e of edges) {
    if (edgeMap[e.source]) edgeMap[e.source].push(e)
  }

  const loopBodyIds = findLoopBodyIds(nodes, edges)
  const loopBodySet = new Set(loopBodyIds)

  const mainNodes = nodes.filter((n) => !loopBodySet.has(n.id))
  const mainEdges = edges.filter(
    (e) => !loopBodySet.has(e.source) && !loopBodySet.has(e.target) && e.sourceHandle !== 'loopOutput'
  )
  const sortedIds = topologicalSort(mainNodes, mainEdges)

  const incomingEdges = {}
  for (const n of mainNodes) incomingEdges[n.id] = []
  for (const e of mainEdges) {
    if (incomingEdges[e.target]) incomingEdges[e.target].push(e)
  }

  const context = { nodeMap, edgeMap, loopBodyIds, onNodeStatus, onLog, dispatchExecutor }
  const outputs = new Map()

  onLog(null, 'Engine', `Starting execution — ${sortedIds.length} nodes`, 'info')

  for (const nodeId of sortedIds) {
    const node = nodeMap[nodeId]
    if (!node) continue

    // Debug step-mode: pause before each node
    if (debugOptions.stepMode && debugOptions.onStepReady) {
      await debugOptions.onStepReady(nodeId)
    }

    const upstream = incomingEdges[nodeId] || []
    let items = []
    for (const e of upstream) {
      items.push(...(outputs.get(e.source) || []))
    }

    onLog(nodeId, node.data.label, `Running with ${items.length} input item(s)`, 'info')
    onNodeStatus(nodeId, 'running')

    const result = await dispatchExecutor(node, items, context).catch((err) => {
      onNodeStatus(nodeId, 'error')
      onLog(nodeId, node.data.label, `Error: ${err.message}`, 'error')
      throw err
    })

    onNodeStatus(nodeId, 'success')
    onLog(nodeId, node.data.label, `Done — ${result.length} item(s) output`, 'info')
    outputs.set(nodeId, result)
  }

  onLog(null, 'Engine', 'Workflow completed successfully', 'info')
  return { outputs }
}
