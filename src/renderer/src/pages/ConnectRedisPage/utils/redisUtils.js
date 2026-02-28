export const decodeJWT = (token) => {
  if (!token) return null
  try {
    const parts = token.replace(/^"(.*)"$/, '$1').split('.')
    if (parts.length !== 3) return null

    const decodePart = (part) => {
      const base64 = part.replace(/-/g, '+').replace(/_/g, '/')
      return JSON.parse(decodeURIComponent(escape(atob(base64))))
    }

    return {
      header: decodePart(parts[0]),
      payload: decodePart(parts[1])
    }
  } catch {
    return null
  }
}

export const formatTTL = (seconds) => {
  const s = parseInt(seconds)
  if (isNaN(s) || s < 0) {
    if (s === -1) return 'No Expiry'
    if (s === -2) return 'Expired'
    return '...'
  }

  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const rs = s % 60

  const parts = []
  if (h > 0) parts.push(`${h}h`)
  if (m > 0) parts.push(`${m}m`)
  if (rs > 0 || parts.length === 0) parts.push(`${rs}s`)

  return `${s}s (${parts.join(' ')})`
}
