export const NODE_CONFIGS = {
  csvRead: {
    label: 'CSV Read',
    description: 'Read data from a CSV file',
    headerBg: '#52c41a',
    bodyBg: '#f6ffed',
    border: '#b7eb8f',
    color: '#389e0d',
    defaultConfig: { filePath: '', delimiter: ',' }
  },
  apiCall: {
    label: 'API Call',
    description: 'Make an HTTP request',
    headerBg: '#1677ff',
    bodyBg: '#e6f4ff',
    border: '#91caff',
    color: '#0958d9',
    defaultConfig: { url: '', method: 'GET', headers: '{}', body: '' }
  },
  jsTransform: {
    label: 'JS Transform',
    description: 'Transform data with JavaScript',
    headerBg: '#fa8c16',
    bodyBg: '#fff7e6',
    border: '#ffd591',
    color: '#d46b08',
    defaultConfig: { code: 'return items' }
  },
  loop: {
    label: 'Loop',
    description: 'Iterate over each item in array',
    headerBg: '#722ed1',
    bodyBg: '#f9f0ff',
    border: '#d3adf7',
    color: '#531dab',
    defaultConfig: { iterateOver: 'items' }
  },
  csvWrite: {
    label: 'CSV Write',
    description: 'Write data to a CSV file',
    headerBg: '#f5222d',
    bodyBg: '#fff1f0',
    border: '#ffa39e',
    color: '#cf1322',
    defaultConfig: { filePath: '', delimiter: ',' }
  }
}

export const NODE_SIDEBAR_ITEMS = [
  { type: 'csvRead',     emoji: '📄' },
  { type: 'apiCall',     emoji: '🌐' },
  { type: 'jsTransform', emoji: '⚙️' },
  { type: 'loop',        emoji: '🔁' },
  { type: 'csvWrite',    emoji: '💾' }
]

let counter = 0
export const generateNodeId = (type) => `${type}_${++counter}_${Date.now()}`
