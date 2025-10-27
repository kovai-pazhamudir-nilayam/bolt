import { useCallback, useEffect, useRef, useState } from 'react'
import Terminal from './Terminal'
import { shellFactory } from '../../repos/shell.repo'

const { shellRepo } = shellFactory()

const TerminalWrapper = ({ onCommandStart, onCommandEnd, onError, className = '', style = {} }) => {
  const [currentProcessId, setCurrentProcessId] = useState(null)
  const terminalRef = useRef(null)
  const logUnsubRef = useRef(null)
  const endUnsubRef = useRef(null)
  const commandBuffer = useRef('')
  const isCommandRunning = useRef(false)

  const writeToTerminal = useCallback((text) => {
    console.log('Writing to terminal:', text)
    if (terminalRef.current) {
      terminalRef.current.write(text)
    } else {
      console.log('Terminal ref not available')
    }
  }, [])

  const clearTerminal = useCallback(() => {
    if (terminalRef.current) {
      terminalRef.current.clear()
    }
  }, [])

  const handleTerminalData = useCallback(
    (data) => {
      if (isCommandRunning.current) {
        // If a command is running, send the data to the running process
        // Note: This would require implementing input sending in the terminal repo
        console.log('Sending input to process:', data)
      } else {
        // If no command is running, treat as new command
        commandBuffer.current += data

        // Handle special keys
        if (data === '\r' || data === '\n') {
          const command = commandBuffer.current.trim()
          commandBuffer.current = ''

          if (command) {
            executeCommand(command)
          } else {
            writeToTerminal('\r\n$ ')
          }
        } else if (data === '\u007f' || data === '\b') {
          // Handle backspace
          if (commandBuffer.current.length > 0) {
            commandBuffer.current = commandBuffer.current.slice(0, -1)
            writeToTerminal('\b \b')
          }
        } else {
          // Echo the character
          writeToTerminal(data)
        }
      }
    },
    [executeCommand, writeToTerminal]
  )

  const executeCommand = useCallback(
    async (command) => {
      if (isCommandRunning.current) {
        writeToTerminal('\r\nCommand already running. Please wait...\r\n$ ')
        return
      }

      try {
        isCommandRunning.current = true
        onCommandStart?.(command)

        // Clean up existing listeners
        if (logUnsubRef.current) {
          logUnsubRef.current()
          logUnsubRef.current = null
        }
        if (endUnsubRef.current) {
          endUnsubRef.current()
          endUnsubRef.current = null
        }

        // Set up new listeners
        const handleLog = (data) => {
          const { output } = data
          writeToTerminal(output)
        }

        const handleEnd = (data) => {
          const { code } = data
          isCommandRunning.current = false
          setCurrentProcessId(null)

          // Clean up listeners
          if (logUnsubRef.current) {
            logUnsubRef.current()
            logUnsubRef.current = null
          }
          if (endUnsubRef.current) {
            endUnsubRef.current()
            endUnsubRef.current = null
          }

          writeToTerminal('\r\n')
          onCommandEnd?.(code === 0, code)
        }

        // Register listeners
        logUnsubRef.current = shellRepo.onLog(handleLog)
        endUnsubRef.current = shellRepo.onEnd(handleEnd)

        // Execute command
        const result = await shellRepo.run(command)
        setCurrentProcessId(result.processId)
      } catch (error) {
        isCommandRunning.current = false
        writeToTerminal(`\r\nError: ${error.message}\r\n`)
        onError?.(error)
      }
    },
    [onCommandStart, onCommandEnd, onError, writeToTerminal]
  )

  const handleTerminalKey = useCallback(
    ({ key, domEvent }) => {
      // Handle special key combinations
      if (domEvent.ctrlKey && key === 'c') {
        // Ctrl+C to interrupt
        if (isCommandRunning.current && currentProcessId) {
          shellRepo.kill(currentProcessId)
          writeToTerminal('^C\r\n')
          isCommandRunning.current = false
          setCurrentProcessId(null)
        }
      }
    },
    [currentProcessId, writeToTerminal]
  )

  useEffect(() => {
    // Initialize terminal
    writeToTerminal('Welcome to Bolt Terminal\r\n$ ')

    // Cleanup on unmount
    return () => {
      if (logUnsubRef.current) {
        logUnsubRef.current()
      }
      if (endUnsubRef.current) {
        endUnsubRef.current()
      }
    }
  }, [writeToTerminal])

  // Expose methods for external control
  useEffect(() => {
    window.terminalWrapper = {
      executeCommand,
      clearTerminal,
      writeToTerminal,
      isCommandRunning: () => isCommandRunning.current
    }
  }, [executeCommand, clearTerminal, writeToTerminal])

  return (
    <Terminal
      ref={terminalRef}
      onData={handleTerminalData}
      onKey={handleTerminalKey}
      className={className}
      style={style}
    />
  )
}

export default TerminalWrapper
