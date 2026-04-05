/**
 * CSV Write executor.
 * Serialises the items array to CSV and triggers a browser download.
 * Returns the items unchanged so further nodes can be chained.
 */
export async function csvWriteExecutor(node, items) {
  const { filePath = 'output.csv', delimiter = ',' } = node.data.config || {}

  if (!items || items.length === 0) return items

  const headers = Object.keys(items[0])
  const rows = [
    headers.join(delimiter),
    ...items.map((item) =>
      headers.map((h) => {
        const val = item[h] ?? ''
        const str = String(val)
        // Quote values that contain the delimiter, quotes, or newlines
        return str.includes(delimiter) || str.includes('"') || str.includes('\n')
          ? `"${str.replace(/"/g, '""')}"`
          : str
      }).join(delimiter)
    )
  ]

  const csvContent = rows.join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filePath.split('/').pop() || 'output.csv'
  a.click()
  URL.revokeObjectURL(url)

  return items
}
