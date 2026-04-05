/**
 * Loop executor.
 * Iterates over each item in the input array, runs the loop body sub-graph
 * per item, and collects all outputs into a flat array.
 *
 * config.iterateOver:
 *   'items' (default) — iterate over the items array itself
 *   'fieldName'       — iterate over items[0][fieldName] if it is an array
 *
 * Body nodes: those only reachable via the loopOutput edge from this loop node.
 * dispatchExecutor is injected by Engine.js to avoid circular imports.
 */
export async function loopExecutor(node, items, context) {
  const { loopBodyIds, nodeMap, edgeMap, onNodeStatus, onLog, dispatchExecutor } = context
  const { iterateOver = 'items' } = node.data?.config || {}

  // Determine the array to iterate over
  let iterItems = items
  if (iterateOver !== 'items' && items.length > 0 && Array.isArray(items[0]?.[iterateOver])) {
    iterItems = items[0][iterateOver]
  }

  if (!loopBodyIds || loopBodyIds.length === 0) {
    onLog(node.id, node.data.label, 'No body nodes connected via loopOutput — passing items through', 'warn')
    return iterItems
  }

  // Find first-level body nodes: targets of loopOutput edges from THIS loop node
  const loopOutputEdges = (edgeMap[node.id] || []).filter(
    (e) => e.sourceHandle === 'loopOutput'
  )

  if (loopOutputEdges.length === 0) return iterItems

  // Build adjacency within body nodes only (for sequential chaining)
  const bodyAdj = {}
  for (const id of loopBodyIds) bodyAdj[id] = []
  for (const id of loopBodyIds) {
    for (const e of (edgeMap[id] || [])) {
      if (loopBodyIds.includes(e.target)) bodyAdj[id].push(e.target)
    }
  }

  const collectedOutputs = []

  for (const item of iterItems) {
    let bodyItems = [item]

    for (const startEdge of loopOutputEdges) {
      // BFS through body, in topo order
      const visited = new Set()
      const queue = [{ nodeId: startEdge.target, currentItems: bodyItems }]

      while (queue.length) {
        const { nodeId, currentItems } = queue.shift()
        if (visited.has(nodeId) || !loopBodyIds.includes(nodeId)) continue
        visited.add(nodeId)

        const bodyNode = nodeMap[nodeId]
        if (!bodyNode) continue

        onNodeStatus(nodeId, 'running')
        const output = await dispatchExecutor(bodyNode, currentItems, context)
        onNodeStatus(nodeId, 'success')
        bodyItems = output

        for (const nextId of bodyAdj[nodeId]) {
          if (!visited.has(nextId)) queue.push({ nodeId: nextId, currentItems: bodyItems })
        }
      }
    }

    collectedOutputs.push(...bodyItems)
  }

  return collectedOutputs
}
