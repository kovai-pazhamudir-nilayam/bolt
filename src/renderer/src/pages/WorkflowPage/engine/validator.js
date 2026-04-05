/**
 * Pre-execution workflow validator.
 * Returns an array of error strings (empty = valid).
 */
export function validateWorkflow(nodes, edges) {
  const errors = []

  if (nodes.length === 0) {
    errors.push('Canvas is empty — add at least one node.')
    return errors
  }

  // Check for isolated nodes (no edges at all)
  if (nodes.length > 1) {
    const connectedIds = new Set()
    for (const e of edges) {
      connectedIds.add(e.source)
      connectedIds.add(e.target)
    }
    const isolated = nodes.filter((n) => !connectedIds.has(n.id))
    if (isolated.length > 0) {
      errors.push(
        `Isolated nodes (not connected): ${isolated.map((n) => n.data.label).join(', ')}`
      )
    }
  }

  // Per-node required field checks
  for (const node of nodes) {
    const cfg = node.data?.config || {}
    const label = node.data?.label || node.type

    if (node.type === 'apiCall' && !cfg.url?.trim()) {
      errors.push(`"${label}": URL is required.`)
    }

    if (node.type === 'jsTransform' && !cfg.code?.trim()) {
      errors.push(`"${label}": Transform code is required.`)
    }
  }

  // Detect cycles using DFS
  const adj = {}
  for (const n of nodes) adj[n.id] = []
  for (const e of edges) {
    if (e.sourceHandle !== 'loopOutput') adj[e.source]?.push(e.target)
  }

  const WHITE = 0, GRAY = 1, BLACK = 2
  const color = {}
  for (const n of nodes) color[n.id] = WHITE

  let hasCycle = false
  const dfs = (id) => {
    if (hasCycle) return
    color[id] = GRAY
    for (const neighbor of (adj[id] || [])) {
      if (color[neighbor] === GRAY) { hasCycle = true; return }
      if (color[neighbor] === WHITE) dfs(neighbor)
    }
    color[id] = BLACK
  }
  for (const n of nodes) {
    if (color[n.id] === WHITE) dfs(n.id)
  }
  if (hasCycle) errors.push('Workflow contains a cycle — remove circular connections.')

  return errors
}
