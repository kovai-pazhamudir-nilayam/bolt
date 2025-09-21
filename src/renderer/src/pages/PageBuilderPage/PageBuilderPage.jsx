import { useState, useEffect, useRef } from 'react'

export default function Terminal() {
  const [logs, setLogs] = useState([])
  const [input, setInput] = useState('')
  const [history, setHistory] = useState([])
  const [historyIndex, setHistoryIndex] = useState(-1)

  // Reverse search
  const [searchMode, setSearchMode] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResult, setSearchResult] = useState('')

  const terminalEndRef = useRef(null)

  useEffect(() => {
    window.terminalAPI.onLog((log) => {
      setLogs((prev) => [...prev, `> ${log}`])
    })
    window.terminalAPI.onEnd((code) => {
      setLogs((prev) => [...prev, `Process exited with code ${code}`])
    })
  }, [])

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logs])

  const runCommand = () => {
    if (!input.trim()) return
    if (input === 'clear') {
      setLogs([])
      setInput('')
      return
    }

    setLogs((prev) => [...prev, `$ ${input}`])
    window.terminalAPI.run(input)

    setHistory((prev) => [...prev, input])
    setHistoryIndex(-1)
    setInput('')
  }

  const handleKeyDown = (e) => {
    if (searchMode) {
      if (e.key === 'Enter') {
        if (searchResult) setInput(searchResult)
        setSearchMode(false)
        setSearchQuery('')
        setSearchResult('')
      } else if (e.key === 'Escape' || (e.ctrlKey && e.key === 'c')) {
        setSearchMode(false)
        setSearchQuery('')
        setSearchResult('')
      }
      return
    }

    if (e.key === 'Enter') {
      runCommand()
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (history.length > 0) {
        const newIndex = historyIndex === -1 ? history.length - 1 : Math.max(0, historyIndex - 1)
        setHistoryIndex(newIndex)
        setInput(history[newIndex])
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (historyIndex >= 0) {
        const newIndex = historyIndex === history.length - 1 ? -1 : historyIndex + 1
        setHistoryIndex(newIndex)
        setInput(newIndex === -1 ? '' : history[newIndex])
      }
    } else if (e.ctrlKey && e.key.toLowerCase() === 'r') {
      e.preventDefault()
      setSearchMode(true)
      setSearchQuery('')
      setSearchResult('')
    }
  }

  const handleSearch = (e) => {
    const q = e.target.value
    setSearchQuery(q)

    if (!q) {
      setSearchResult('')
      return
    }

    // search backwards in history
    const match = [...history].reverse().find((cmd) => cmd.includes(q))
    setSearchResult(match || '')
  }

  return (
    <div
      style={{
        background: '#000',
        color: '#0f0',
        padding: '10px',
        fontFamily: 'monospace',
        height: '400px',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {logs.map((line, i) => (
          <div key={i}>{line}</div>
        ))}
        <div ref={terminalEndRef} />
      </div>

      {searchMode ? (
        <div style={{ background: '#111', padding: '5px' }}>
          <span>
            (reverse-i-search)`{searchQuery}`: {searchResult}
          </span>
          <input
            autoFocus
            value={searchQuery}
            onChange={handleSearch}
            style={{
              background: 'black',
              color: 'lime',
              border: 'none',
              outline: 'none',
              marginLeft: '10px'
            }}
          />
        </div>
      ) : (
        <div>
          <span>$ </span>
          <input
            style={{
              background: 'black',
              color: 'lime',
              border: 'none',
              outline: 'none',
              width: '90%'
            }}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            style={{
              marginLeft: '10px',
              background: '#222',
              color: 'lime',
              border: '1px solid lime',
              cursor: 'pointer'
            }}
            onClick={() => setLogs([])}
          >
            Clear
          </button>
        </div>
      )}
    </div>
  )
}
