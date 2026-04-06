import { useCallback, useRef, useState } from 'react'
import { useDevPanel } from '../../context/useDevPanel'
import { getLogLineTextColor } from '../LogsViewer/LogsViewer.helper'
import './BottomPanel.less'

const DEFAULT_HEIGHT = 400

const CONSOLE_TYPE_COLOR = {
  log: '#ccc',
  info: '#58a6ff',
  warn: '#ffd700',
  error: '#ff4d4f'
}

const BottomPanel = ({ siderWidth = 0 }) => {
  const {
    logs,
    consoleLogs,
    isOpen,
    setIsOpen,
    activeTab,
    openTab,
    panelHeight = DEFAULT_HEIGHT,
    setPanelHeight,
    clearLogs,
    clearConsoleLogs
  } = useDevPanel()

  const logsEndRef = useRef(null)
  const dragStartY = useRef(null)
  const dragStartHeight = useRef(null)
  const [copied, setCopied] = useState(false)

  const errorCount = consoleLogs.filter((l) => l.type === 'error').length
  const warnCount = consoleLogs.filter((l) => l.type === 'warn').length

  const handleTabClick = (tab) => {
    if (isOpen && activeTab === tab) {
      setIsOpen(false)
    } else {
      openTab(tab)
    }
  }

  const handleCopy = () => {
    let text
    if (activeTab === 'logs') {
      text = logs.map((e) => `[${e.time}] ${e.message}`).join('\n')
    } else {
      text = consoleLogs.map((e) => `[${e.time}] [${e.type}] ${e.message}`).join('\n')
    }
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }

  const handleDragMouseDown = useCallback(
    (e) => {
      dragStartY.current = e.clientY
      dragStartHeight.current = panelHeight

      const onMouseMove = (ev) => {
        const delta = dragStartY.current - ev.clientY
        const newHeight = Math.max(100, Math.min(600, dragStartHeight.current + delta))
        setPanelHeight(newHeight)
      }

      const onMouseUp = () => {
        window.removeEventListener('mousemove', onMouseMove)
        window.removeEventListener('mouseup', onMouseUp)
      }

      window.addEventListener('mousemove', onMouseMove)
      window.addEventListener('mouseup', onMouseUp)
    },
    [panelHeight, setPanelHeight]
  )

  const hasContent = activeTab === 'logs' ? logs.length > 0 : consoleLogs.length > 0

  return (
    <div className="BottomPanel" style={{ left: siderWidth }}>
      {/* Collapsed bar — always visible */}
      <div className="BottomPanel__bar">
        <div className="BottomPanel__tabs">
          <button
            className={`BottomPanel__tab ${activeTab === 'logs' && isOpen ? 'active' : ''}`}
            onClick={() => handleTabClick('logs')}
          >
            Logs
            {logs.length > 0 && <span className="BottomPanel__badge">{logs.length}</span>}
          </button>
          <button
            className={`BottomPanel__tab ${activeTab === 'console' && isOpen ? 'active' : ''}`}
            onClick={() => handleTabClick('console')}
          >
            Console
            {errorCount > 0 && (
              <span className="BottomPanel__badge error">{errorCount} errors</span>
            )}
            {warnCount > 0 && !errorCount && (
              <span className="BottomPanel__badge warn">{warnCount} warnings</span>
            )}
          </button>
        </div>

        <div className="BottomPanel__actions">
          {isOpen && hasContent && (
            <button className="BottomPanel__action-btn" onClick={handleCopy} title="Copy to clipboard">
              {copied ? '✓ Copied' : 'Copy'}
            </button>
          )}
          {isOpen && (
            <button
              className="BottomPanel__action-btn"
              onClick={activeTab === 'logs' ? clearLogs : clearConsoleLogs}
              title="Clear"
            >
              Clear
            </button>
          )}
          <button
            className="BottomPanel__action-btn"
            onClick={() => setIsOpen((v) => !v)}
            title={isOpen ? 'Collapse' : 'Expand'}
          >
            {isOpen ? '▼' : '▲'}
          </button>
        </div>
      </div>

      {/* Panel content */}
      {isOpen && (
        <>
          {/* Drag handle */}
          <div className="BottomPanel__resize-handle" onMouseDown={handleDragMouseDown} />

          <div className="BottomPanel__content" style={{ height: panelHeight }}>
            {activeTab === 'logs' && (
              <div className="BottomPanel__log-area">
                {logs.length === 0 ? (
                  <span className="BottomPanel__empty">No logs yet.</span>
                ) : (
                  logs.map((entry, i) => (
                    <div key={i} className="BottomPanel__console-entry" style={{ color: getLogLineTextColor(entry.message) }}>
                      <span className="BottomPanel__console-time">{entry.time}</span>
                      <span>{entry.message}</span>
                    </div>
                  ))
                )}
                <div ref={logsEndRef} />
              </div>
            )}

            {activeTab === 'console' && (
              <div className="BottomPanel__log-area">
                {consoleLogs.length === 0 ? (
                  <span className="BottomPanel__empty">No console output yet.</span>
                ) : (
                  consoleLogs.map((entry, i) => (
                    <div
                      key={i}
                      className="BottomPanel__console-entry"
                      style={{ color: CONSOLE_TYPE_COLOR[entry.type] || '#ccc' }}
                    >
                      <span className="BottomPanel__console-time">{entry.time}</span>
                      <span className="BottomPanel__console-type">[{entry.type}]</span>
                      <span className="BottomPanel__console-message">{entry.message}</span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default BottomPanel
