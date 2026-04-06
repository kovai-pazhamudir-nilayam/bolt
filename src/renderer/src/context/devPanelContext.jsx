// eslint-disable-next-line react-refresh/only-export-components
import { createContext, useCallback, useEffect, useState } from 'react'
import { shellFactory } from '../repos/shell.repo'

export const DevPanelContext = createContext(null)
const { shellRepo } = shellFactory()

export const DevPanelProvider = ({ children }) => {
  const [logs, setLogs] = useState([])
  const [consoleLogs, setConsoleLogs] = useState([])
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('logs')
  const [panelHeight, setPanelHeight] = useState(260)

  const makeEntry = (message) => ({ message, time: new Date().toLocaleTimeString() })

  const appendLog = useCallback((line) => {
    setLogs((prev) => [...prev, makeEntry(line)])
  }, [])

  // Capture all shell output globally
  useEffect(() => {
    const unsub = shellRepo.onLog((data) => {
      if (data.output?.trim()) setLogs((prev) => [...prev, makeEntry(data.output)])
    })
    return unsub
  }, [])

  // Intercept console.log / warn / error / info
  useEffect(() => {
    const methods = ['log', 'error', 'warn', 'info']
    const originals = {}

    methods.forEach((method) => {
      originals[method] = console[method].bind(console)
      console[method] = (...args) => {
        originals[method](...args)
        const message = args
          .map((a) => {
            if (a instanceof Error) return `${a.message}\n${a.stack}`
            if (typeof a === 'object' && a !== null) {
              try {
                return JSON.stringify(a, null, 2)
              } catch {
                return String(a)
              }
            }
            return String(a)
          })
          .join(' ')
        setConsoleLogs((prev) => [
          ...prev,
          { type: method, message, time: new Date().toLocaleTimeString() }
        ])
      }
    })

    return () => {
      methods.forEach((m) => {
        console[m] = originals[m]
      })
    }
  }, [])

  const openTab = useCallback((tab) => {
    setActiveTab(tab)
    setIsOpen(true)
  }, [])

  return (
    <DevPanelContext.Provider
      value={{
        logs,
        consoleLogs,
        appendLog,
        isOpen,
        setIsOpen,
        activeTab,
        setActiveTab,
        openTab,
        panelHeight,
        setPanelHeight,
        clearLogs: () => setLogs([]),
        clearConsoleLogs: () => setConsoleLogs([])
      }}
    >
      {children}
    </DevPanelContext.Provider>
  )
}
