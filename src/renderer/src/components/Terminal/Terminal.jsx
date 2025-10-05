import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react'
import { Terminal as XTerm } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import '@xterm/xterm/css/xterm.css'

const Terminal = forwardRef(({ onData, onKey, className = '', style = {} }, ref) => {
  const terminalRef = useRef(null)
  const xtermRef = useRef(null)
  const fitAddonRef = useRef(null)

  useEffect(() => {
    if (!terminalRef.current) {
      console.log('Terminal ref not available yet')
      return
    }

    console.log('Creating terminal instance...')

    // Create terminal instance
    const terminal = new XTerm({
      cursorBlink: true,
      theme: {
        background: '#1e1e1e',
        foreground: '#ffffff',
        cursor: '#ffffff',
        selection: '#ffffff40',
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
      fontSize: 14,
      fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
      rows: 24,
      cols: 80
    })

    // Create fit addon
    const fitAddon = new FitAddon()
    terminal.loadAddon(fitAddon)

    // Mount terminal
    console.log('Opening terminal...')
    terminal.open(terminalRef.current)
    fitAddon.fit()

    // Store references
    xtermRef.current = terminal
    fitAddonRef.current = fitAddon

    console.log('Terminal created and mounted successfully')

    // Handle data events
    terminal.onData((data) => {
      if (onData) {
        onData(data)
      }
    })

    // Handle key events
    terminal.onKey(({ key, domEvent }) => {
      if (onKey) {
        onKey({ key, domEvent })
      }
    })

    // Handle resize
    const handleResize = () => {
      if (fitAddonRef.current) {
        fitAddonRef.current.fit()
      }
    }

    window.addEventListener('resize', handleResize)

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize)
      terminal.dispose()
    }
  }, [onData, onKey])

  // Expose terminal methods via ref
  useImperativeHandle(ref, () => ({
    write: (text) => xtermRef.current?.write(text),
    clear: () => xtermRef.current?.clear(),
    focus: () => xtermRef.current?.focus(),
    terminal: xtermRef.current
  }))

  // Expose terminal methods globally
  useEffect(() => {
    if (xtermRef.current) {
      window.terminalInstance = xtermRef.current
    }
  }, [])

  return (
    <div
      ref={terminalRef}
      className={className}
      style={{
        width: '100%',
        height: '100%',
        minHeight: '400px',
        ...style
      }}
    />
  )
})

Terminal.displayName = 'Terminal'

export default Terminal
