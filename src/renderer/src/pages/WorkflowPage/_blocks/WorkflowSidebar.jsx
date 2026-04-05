import { Typography } from 'antd'
import { NODE_CONFIGS, NODE_SIDEBAR_ITEMS } from '../workflow.helpers'

const { Text } = Typography

const WorkflowSidebar = () => {
  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType)
    event.dataTransfer.effectAllowed = 'move'
  }

  return (
    <div
      style={{
        width: 200,
        borderRight: '1px solid #f0f0f0',
        background: '#fff',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        overflowY: 'auto'
      }}
    >
      <div
        style={{
          padding: '12px 14px 8px',
          fontSize: 11,
          fontWeight: 700,
          color: '#888',
          textTransform: 'uppercase',
          letterSpacing: 1,
          borderBottom: '1px solid #f0f0f0'
        }}
      >
        Nodes
      </div>

      <div style={{ padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 6 }}>
        {NODE_SIDEBAR_ITEMS.map(({ type, emoji }) => {
          const cfg = NODE_CONFIGS[type]
          return (
            <div
              key={type}
              draggable
              onDragStart={(e) => onDragStart(e, type)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '8px 10px',
                background: cfg.bodyBg,
                border: `1.5px solid ${cfg.border}`,
                borderRadius: 7,
                cursor: 'grab',
                userSelect: 'none',
                transition: 'box-shadow 0.15s, transform 0.1s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = `0 2px 8px ${cfg.color}44`
                e.currentTarget.style.transform = 'translateY(-1px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'none'
                e.currentTarget.style.transform = 'none'
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  background: cfg.headerBg,
                  borderRadius: 6,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 14,
                  flexShrink: 0
                }}
              >
                {emoji}
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 12, color: cfg.color }}>
                  {cfg.label}
                </div>
                <div style={{ fontSize: 10, color: '#888', lineHeight: 1.3 }}>
                  {cfg.description}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div
        style={{
          marginTop: 'auto',
          padding: '12px 14px',
          borderTop: '1px solid #f0f0f0',
          fontSize: 11,
          color: '#aaa',
          textAlign: 'center'
        }}
      >
        Drag nodes onto the canvas
      </div>
    </div>
  )
}

export default WorkflowSidebar
