import { useEffect, useRef } from 'react'
import { Terminal as XTerm } from '@xterm/xterm'
import '@xterm/xterm/css/xterm.css'

const SimpleTerminal = ({ style = {} }) => {
  const terminalRef = useRef(null)
  const xtermRef = useRef(null)

  useEffect(() => {
    console.log('SimpleTerminal: useEffect running')
    console.log('SimpleTerminal: terminalRef.current:', terminalRef.current)

    if (!terminalRef.current) {
      console.log('SimpleTerminal: terminalRef.current is null, retrying in 100ms')
      setTimeout(() => {
        if (terminalRef.current) {
          console.log('SimpleTerminal: terminalRef.current now available')
          initializeTerminal()
        } else {
          console.log('SimpleTerminal: terminalRef.current still null after timeout')
        }
      }, 100)
      return
    }

    initializeTerminal()

    return () => {
      console.log('SimpleTerminal: Cleaning up')
      if (xtermRef.current) {
        xtermRef.current.dispose()
      }
    }
  }, [])

  const initializeTerminal = () => {
    console.log('SimpleTerminal: Creating terminal instance')

    try {
      const terminal = new XTerm({
        cursorBlink: true,
        theme: {
          background: '#1e1e1e',
          foreground: '#ffffff',
          cursor: '#ffffff'
        },
        fontSize: 14,
        fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
        rows: 20,
        cols: 80
      })

      console.log('SimpleTerminal: Terminal created, opening...')
      terminal.open(terminalRef.current)

      terminal.write('Welcome to Simple Terminal!\r\n')
      terminal.write('Type some text here...\r\n')
      terminal.write('$ ')

      xtermRef.current = terminal

      console.log('SimpleTerminal: Terminal opened successfully')
    } catch (error) {
      console.error('SimpleTerminal: Error creating terminal:', error)
    }
  }

  return (
    <div
      ref={terminalRef}
      style={{
        width: '100%',
        height: '400px',
        border: '1px solid #ccc',
        backgroundColor: '#1e1e1e',
        ...style
      }}
    />
  )
}

export default SimpleTerminal
