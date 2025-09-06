import { getLogLineTextColor } from './LogsViewer.helper'
import './LogsViewer.less'
const LogsViewer = ({ logRef, logs }) => {
  return (
    <div className="LogsViewer">
      <div className="LogsViewer__header">
        <div style={{ display: 'flex', gap: 8 }}>
          <span className="red-circle" />
          <span className="yellow-circle" />
          <span className="green-circle" />
        </div>
      </div>
      <div
        style={{
          background: '#111',
          color: '#0f0',
          fontFamily: 'monospace',
          fontSize: 12,
          height: 268,
          overflowY: 'auto',
          padding: 8
        }}
        ref={logRef}
      >
        {logs.length === 0 ? (
          <span>No logs yet.</span>
        ) : (
          logs.map((line, i) => {
            let color = getLogLineTextColor(line)
            return (
              <div key={i} style={{ color }}>
                {line}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

export default LogsViewer
