/**
 * Resolves {{field}} template variables in a string using a context object.
 *
 * Examples:
 *   resolveTemplate('Hello {{name}}', { name: 'Alice' }) → 'Hello Alice'
 *   resolveTemplate('/users/{{id}}/posts', { id: 42 })   → '/users/42/posts'
 */
export function resolveTemplate(str, context = {}) {
  if (!str || typeof str !== 'string') return str
  return str.replace(/\{\{([^}]+)\}\}/g, (_, key) => {
    const trimmed = key.trim()
    const val = trimmed.split('.').reduce((obj, part) => obj?.[part], context)
    return val !== undefined && val !== null ? String(val) : `{{${trimmed}}}`
  })
}

/**
 * Resolves all {{}} templates in an entire config object against a context.
 * Only processes string values, leaves non-strings untouched.
 */
export function resolveConfigTemplates(config, context) {
  if (!config || typeof config !== 'object') return config
  const resolved = {}
  for (const [key, val] of Object.entries(config)) {
    resolved[key] = typeof val === 'string' ? resolveTemplate(val, context) : val
  }
  return resolved
}
