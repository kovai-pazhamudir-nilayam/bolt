export const ACCESS_OPTIONS = [
  { value: 'write', label: 'Write', color: 'green' },
  { value: 'read', label: 'Read', color: 'blue' },
  { value: 'hidden', label: 'Hidden', color: 'red' }
]

export const accessColor = (v) => ACCESS_OPTIONS.find((o) => o.value === v)?.color || 'default'

export const mockClaudeResponse = (prompt) => {
  const p = prompt.toLowerCase()
  if (p.includes('hide') || p.includes('disable')) {
    return 'Set the feature access to Hidden — it will disappear from the sidebar immediately.'
  }
  if (p.includes('read')) {
    return 'Read access means the page is visible in the sidebar but the app can check isFeatureReadOnly() to restrict edit actions.'
  }
  if (p.includes('write')) {
    return 'Write access is the default — the feature is fully accessible with no restrictions.'
  }
  if (p.includes('reset') || p.includes('default')) {
    return 'To reset all features, set each one back to Write access. Hidden features will reappear in the sidebar once changed.'
  }
  return 'I can help you configure feature access. Set each feature to Write (full access), Read (visible, restricted), or Hidden (removed from sidebar).'
}
