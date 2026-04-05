import { resolveConfigTemplates } from '../templateResolver'

/**
 * API Call executor.
 * Makes HTTP requests with optional {{template}} variable resolution per item.
 *
 * If items contains exactly one item, resolves templates against that item.
 * Multiple items: resolves against each item and merges all results.
 */
export async function apiCallExecutor(node, items) {
  const baseConfig = node.data.config || {}
  if (!baseConfig.url?.trim()) throw new Error('API Call node requires a URL')

  // If we have items with template vars, resolve per item; otherwise single call
  const contexts = items.length > 0 ? items : [{}]
  const allResults = []

  for (const ctx of contexts) {
    const cfg = resolveConfigTemplates(baseConfig, ctx)
    const { url, method = 'GET', headers: headersStr = '{}', body } = cfg

    let parsedHeaders = {}
    try { parsedHeaders = JSON.parse(headersStr || '{}') } catch { parsedHeaders = {} }

    const options = {
      method: method.toUpperCase(),
      headers: { 'Content-Type': 'application/json', ...parsedHeaders }
    }
    if (body && method.toUpperCase() !== 'GET') {
      options.body = body
    }

    const response = await fetch(url, options)
    const contentType = response.headers.get('content-type') || ''
    let data
    if (contentType.includes('application/json')) {
      data = await response.json()
    } else {
      data = await response.text()
    }

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${typeof data === 'string' ? data : JSON.stringify(data)}`)
    }

    if (Array.isArray(data)) {
      allResults.push(...data)
    } else {
      allResults.push(data)
    }
  }

  return allResults
}
