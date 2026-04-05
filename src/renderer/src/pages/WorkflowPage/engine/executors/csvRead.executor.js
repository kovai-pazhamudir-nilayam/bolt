/**
 * CSV Read executor.
 * Priority:
 *   1. config.fileContent (loaded in browser via file picker — no IPC needed)
 *   2. config.filePath via window.fileAPI.readFile IPC
 *   3. Sample data fallback
 */

function parseCSV(text, delimiter = ',') {
  const lines = text.trim().split('\n').filter(Boolean)
  if (lines.length === 0) return []
  const headers = lines[0].split(delimiter).map((h) => h.trim().replace(/^"|"$/g, ''))
  return lines.slice(1).map((line) => {
    const values = line.split(delimiter).map((v) => v.trim().replace(/^"|"$/g, ''))
    const row = {}
    headers.forEach((h, i) => { row[h] = values[i] ?? '' })
    return row
  })
}

export async function csvReadExecutor(node) {
  const { filePath, fileContent, delimiter = ',' } = node.data.config || {}

  // Priority 1: content already loaded in renderer memory
  if (fileContent) {
    return parseCSV(fileContent, delimiter)
  }

  // Priority 2: read via Electron IPC
  if (filePath && window.fileAPI?.readFile) {
    const result = await window.fileAPI.readFile(filePath)
    if (result.error) throw new Error(result.error)
    return parseCSV(result.content, delimiter)
  }

  // Priority 3: sample data
  return [
    { id: '1', name: 'Alice', amount: '100' },
    { id: '2', name: 'Bob', amount: '200' },
    { id: '3', name: 'Carol', amount: '150' }
  ]
}
