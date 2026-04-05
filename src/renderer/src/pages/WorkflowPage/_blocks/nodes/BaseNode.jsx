import { Handle, Position } from '@xyflow/react'
import { useState } from 'react'
import { NODE_CONFIGS } from '../../workflow.helpers'
import { useWorkflowActions } from '../WorkflowActionsContext'

const STATUS = {
  running: { symbol: '⟳', title: 'Running',  bg: '#1677ff' },
  success: { symbol: '✓', title: 'Done',     bg: '#52c41a' },
  error:   { symbol: '✗', title: 'Error',    bg: '#f5222d' }
}

const BaseNode = ({
  id,
  type,
  data,
  selected,
  hasInput = true,
  hasOutput = true,
  extraHandles = null,
  children
}) => {
  const cfg = NODE_CONFIGS[type] || {}
  const status = STATUS[data.status]
  const [hovered, setHovered] = useState(false)
  const { retryNode, deleteNode } = useWorkflowActions()

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        minWidth: 210,
        background: cfg.bodyBg || '#fff',
        border: `2px solid ${selected ? cfg.color : (data.status === 'error' ? '#f5222d' : cfg.border)}`,
        borderRadius: 8,
        boxShadow: selected
          ? `0 0 0 3px ${cfg.color}33, 0 4px 16px rgba(0,0,0,0.18)`
          : '0 2px 8px rgba(0,0,0,0.1)',
        transition: 'box-shadow 0.15s, border-color 0.15s',
        fontFamily: 'inherit',
        position: 'relative'
      }}
    >
      {hasInput && (
        <Handle
          type="target"
          position={Position.Top}
          style={{ background: cfg.headerBg, border: '2px solid white', width: 12, height: 12 }}
        />
      )}

      {/* Header */}
      <div
        style={{
          background: cfg.headerBg,
          borderRadius: '6px 6px 0 0',
          padding: '7px 12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <span style={{ color: '#fff', fontWeight: 600, fontSize: 13 }}>
          {data.label || cfg.label}
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          {/* Status badge */}
          {status && (
            <span
              title={status.title}
              style={{
                background: status.bg,
                color: '#fff',
                fontSize: 11,
                fontWeight: 700,
                lineHeight: 1,
                padding: '2px 5px',
                borderRadius: 4,
                border: '1.5px solid rgba(255,255,255,0.4)'
              }}
            >
              {status.symbol} {status.title}
            </span>
          )}

          {/* Action buttons — shown on hover */}
          {hovered && (
            <div style={{ display: 'flex', gap: 3 }}>
              {/* Retry */}
              {retryNode && (
                <button
                  title="Retry this node"
                  onClick={(e) => { e.stopPropagation(); retryNode(id) }}
                  style={{
                    background: 'rgba(255,255,255,0.25)',
                    border: '1px solid rgba(255,255,255,0.5)',
                    borderRadius: 4,
                    color: '#fff',
                    cursor: 'pointer',
                    fontSize: 11,
                    padding: '2px 6px',
                    lineHeight: 1.4,
                    fontWeight: 600
                  }}
                >
                  ↺
                </button>
              )}
              {/* Delete */}
              {deleteNode && (
                <button
                  title="Delete node"
                  onClick={(e) => { e.stopPropagation(); deleteNode(id) }}
                  style={{
                    background: 'rgba(255,80,80,0.7)',
                    border: '1px solid rgba(255,255,255,0.5)',
                    borderRadius: 4,
                    color: '#fff',
                    cursor: 'pointer',
                    fontSize: 11,
                    padding: '2px 6px',
                    lineHeight: 1.4,
                    fontWeight: 700
                  }}
                >
                  ✕
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '8px 12px', fontSize: 12, color: '#555', minHeight: 34 }}>
        {children || (
          <span style={{ color: '#aaa', fontStyle: 'italic' }}>{cfg.description}</span>
        )}
      </div>

      {extraHandles}

      {hasOutput && (
        <Handle
          type="source"
          position={Position.Bottom}
          style={{ background: cfg.headerBg, border: '2px solid white', width: 12, height: 12 }}
        />
      )}
    </div>
  )
}

export default BaseNode
