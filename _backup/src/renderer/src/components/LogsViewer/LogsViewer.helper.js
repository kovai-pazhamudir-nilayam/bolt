const getLogLineTextColor = (logLine) => {
  let color = '#fff'
  if (/error|failed|not found|denied|no such/i.test(logLine)) {
    color = '#ff4d4f' // red for errors
  } else if (/uploading|progress|copied|transferred|%|bucket|info|starting/i.test(logLine)) {
    color = '#ffd700' // yellow for progress/info
  } else if (/console\.log|debug|log:/i.test(logLine)) {
    color = '#0ff' // cyan for console.log/debug
  } else if (/success|complete|done/i.test(logLine)) {
    color = '#52fa7c' // green for success
  }

  return color
}

export { getLogLineTextColor }
