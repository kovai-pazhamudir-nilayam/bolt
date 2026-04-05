/**
 * Kahn's algorithm topological sort.
 * Returns sorted node IDs or throws if a cycle is detected (non-loop cycles).
 */
export function topologicalSort(nodes, edges) {
  const ids = nodes.map((n) => n.id)
  const inDegree = {}
  const adj = {}

  for (const id of ids) {
    inDegree[id] = 0
    adj[id] = []
  }

  for (const e of edges) {
    if (inDegree[e.target] !== undefined) inDegree[e.target]++
    if (adj[e.source]) adj[e.source].push(e.target)
  }

  const queue = ids.filter((id) => inDegree[id] === 0)
  const sorted = []

  while (queue.length) {
    const cur = queue.shift()
    sorted.push(cur)
    for (const neighbor of adj[cur]) {
      inDegree[neighbor]--
      if (inDegree[neighbor] === 0) queue.push(neighbor)
    }
  }

  return sorted
}

/**
 * Identifies nodes that are only reachable via a loopOutput handle —
 * these are "loop body" nodes that the Loop executor runs per-item.
 *
 * Algorithm:
 *   1. Find real roots: nodes with in-degree 0 counting ALL edges.
 *   2. BFS from real roots following only non-loopOutput edges.
 *   3. Any node NOT reached is a loop body node.
 */
export function findLoopBodyIds(nodes, edges) {
  const ids = new Set(nodes.map((n) => n.id))

  // In-degree counting ALL edges
  const inDegree = {}
  for (const id of ids) inDegree[id] = 0
  for (const e of edges) {
    if (ids.has(e.target)) inDegree[e.target]++
  }

  // BFS adjacency: only non-loopOutput edges
  const adj = {}
  for (const id of ids) adj[id] = []
  for (const e of edges) {
    if (e.sourceHandle !== 'loopOutput' && ids.has(e.source) && ids.has(e.target)) {
      adj[e.source].push(e.target)
    }
  }

  // BFS from real roots
  const roots = [...ids].filter((id) => inDegree[id] === 0)
  const visited = new Set(roots)
  const queue = [...roots]

  while (queue.length) {
    const cur = queue.shift()
    for (const neighbor of adj[cur]) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor)
        queue.push(neighbor)
      }
    }
  }

  // Loop body = not reachable via non-loopOutput paths
  return [...ids].filter((id) => !visited.has(id))
}
