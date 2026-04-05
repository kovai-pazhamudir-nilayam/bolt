import { Badge, Button, Typography } from 'antd'
import { ChevronDown, ChevronUp, Trash2 } from 'lucide-react'
import { useEffect, useRef } from 'react'

const LEVEL_STYLE = {
  info:  { color: '#1677ff', prefix: 'ℹ' },
  warn:  { color: '#fa8c16', prefix: '⚠' },
  error: { color: '#f5222d', prefix: '✗' }
}

const LogsPanel = ({ logs, isOpen, onToggle, onClear }) => {
  const bottomRef = useRef(null)

  useEffect(() => {
    if (isOpen) bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logs, isOpen])

  const errorCount = logs.filter((l) => l.level === 'error').length

  return (
    <div
      style={{
        borderTop: '1px solid #f0f0f0',
        background: '#fff',
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Header bar */}
      <div
        style={{
          padding: '5px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          cursor: 'pointer',
          userSelect: 'none',
          borderBottom: isOpen ? '1px solid #f0f0f0' : 'none'
        }}
        onClick={onToggle}
      >
        {isOpen ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
        <Typography.Text strong style={{ fontSize: 12 }}>
          Execution Logs
        </Typography.Text>
        <Badge count={logs.length} size="small" style={{ background: '#999' }} showZero={false} />
        {errorCount > 0 && (
          <Badge count={errorCount} size="small" style={{ background: '#f5222d' }} />
        )}
        {isOpen && (
          <Button
            type="text"
            size="small"
            icon={<Trash2 size={12} />}
            onClick={(e) => { e.stopPropagation(); onClear() }}
            style={{ marginLeft: 'auto', color: '#999' }}
          />
        )}
      </div>

      {/* Log entries */}
      {isOpen && (
        <div
          style={{
            height: 160,
            overflowY: 'auto',
            padding: '6px 14px',
            fontFamily: 'monospace',
            fontSize: 12,
            background: '#0d1117',
            flex: 1
          }}
        >
          {logs.length === 0 && (
            <span style={{ color: '#555' }}>No logs yet. Run the workflow to see output.</span>
          )}
          {logs.map((log) => {
            const lvl = LEVEL_STYLE[log.level] || LEVEL_STYLE.info
            return (
              <div key={log.id} style={{ lineHeight: 1.7 }}>
                <span style={{ color: '#555' }}>{log.time} </span>
                <span style={{ color: lvl.color, fontWeight: 700 }}>{lvl.prefix} </span>
                {log.label && (
                  <span style={{ color: '#7dd3a8' }}>[{log.label}] </span>
                )}
                <span style={{ color: '#e8e8e8' }}>{log.message}</span>
              </div>
            )
          })}
          <div ref={bottomRef} />
        </div>
      )}
    </div>
  )
}

export default LogsPanel
