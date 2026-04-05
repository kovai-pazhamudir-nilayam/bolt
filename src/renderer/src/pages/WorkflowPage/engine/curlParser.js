/**
 * Parses a cURL command string into an API Call node config object.
 *
 * Handles:
 *   -X / --request   → method
 *   URL (first non-flag arg or after --url)
 *   -H / --header    → headers object
 *   -d / --data      → body
 *   --data-raw       → body
 */
export function parseCurl(curlStr) {
  const result = { method: 'GET', url: '', headers: '{}', body: '' }
  if (!curlStr || !curlStr.trim().startsWith('curl')) return result

  // Tokenise: respect single/double quoted strings
  const tokens = []
  const re = /(?:[^\s"']+|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')+/g
  let match
  while ((match = re.exec(curlStr)) !== null) {
    tokens.push(match[0].replace(/^['"]|['"]$/g, ''))
  }

  const headers = {}
  let i = 1 // skip 'curl'

  while (i < tokens.length) {
    const tok = tokens[i]

    if (tok === '-X' || tok === '--request') {
      result.method = tokens[++i]?.toUpperCase() || 'GET'
    } else if (tok === '--url') {
      result.url = tokens[++i] || ''
    } else if (tok === '-H' || tok === '--header') {
      const hdr = tokens[++i] || ''
      const colonIdx = hdr.indexOf(':')
      if (colonIdx !== -1) {
        const name = hdr.slice(0, colonIdx).trim()
        const val = hdr.slice(colonIdx + 1).trim()
        headers[name] = val
      }
    } else if (tok === '-d' || tok === '--data' || tok === '--data-raw') {
      result.body = tokens[++i] || ''
      if (!result.method || result.method === 'GET') result.method = 'POST'
    } else if (!tok.startsWith('-') && !result.url) {
      result.url = tok
    }

    i++
  }

  result.headers = JSON.stringify(headers, null, 2)
  return result
}
