import { Terminal } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import '@xterm/xterm/css/xterm.css'
import { useEffect, useRef } from 'react'

const TerminalViewer = ({ logs, height = 400 }) => {
  const terminalRef = useRef(null)
  const termInstance = useRef(null)
  const fitAddon = useRef(null)

  useEffect(() => {
    if (terminalRef.current && !termInstance.current) {
      termInstance.current = new Terminal({
        cursorBlink: true,
        theme: {
          background: '#1e1e1e',
          foreground: '#d4d4d4',
          cursor: '#ffffff',
          selectionBackground: 'rgba(255, 255, 255, 0.3)',
          black: '#000000',
          red: '#cd3131',
          green: '#0dbc79',
          yellow: '#e5e510',
          blue: '#2472c8',
          magenta: '#bc3fbc',
          cyan: '#11a8cd',
          white: '#e5e5e5',
          brightBlack: '#666666',
          brightRed: '#f14c4c',
          brightGreen: '#23d18b',
          brightYellow: '#f5f543',
          brightBlue: '#3b8eea',
          brightMagenta: '#d670d6',
          brightCyan: '#29b8db',
          brightWhite: '#e5e5e5'
        },
        fontSize: 13,
        fontFamily: 'Menlo, Monaco, "Courier New", monospace'
      })

      fitAddon.current = new FitAddon()
      termInstance.current.loadAddon(fitAddon.current)
      termInstance.current.open(terminalRef.current)
      fitAddon.current.fit()
    }

    return () => {
      if (termInstance.current) {
        termInstance.current.dispose()
        termInstance.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (termInstance.current && logs.length > 0) {
      // Clear and rewrite if needed, or just write segments
      // For now, let's write the newest log
      const lastLog = logs[logs.length - 1]
      termInstance.current.writeln(lastLog)
    }
  }, [logs])

  useEffect(() => {
    const handleResize = () => {
      if (fitAddon.current) {
        fitAddon.current.fit()
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div
      ref={terminalRef}
      style={{
        height,
        width: '100%',
        padding: '10px',
        backgroundColor: '#1e1e1e',
        borderRadius: '0 0 8px 8px',
        boxShadow: 'inset 0 0 10px rgba(0,0,0,0.5)'
      }}
    />
  )
}

export default TerminalViewer
