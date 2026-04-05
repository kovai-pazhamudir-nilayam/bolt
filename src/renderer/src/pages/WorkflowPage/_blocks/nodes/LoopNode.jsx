import { Handle, Position } from '@xyflow/react'
import BaseNode from './BaseNode'
import { NODE_CONFIGS } from '../../workflow.helpers'

const LoopNode = (props) => {
  const { iterateOver } = props.data.config || {}
  const cfg = NODE_CONFIGS.loop

  const extraHandles = (
    <>
      {/* Loop body output — right side */}
      <Handle
        type="source"
        position={Position.Right}
        id="loopOutput"
        style={{
          background: cfg.headerBg,
          border: '2px solid white',
          width: 12,
          height: 12,
          top: '50%'
        }}
      />
      <div
        style={{
          position: 'absolute',
          right: -52,
          top: '50%',
          transform: 'translateY(-50%)',
          fontSize: 10,
          color: cfg.color,
          pointerEvents: 'none',
          whiteSpace: 'nowrap'
        }}
      >
        each item
      </div>
    </>
  )

  return (
    <BaseNode {...props} hasOutput={true} extraHandles={extraHandles}>
      <div>
        Iterate over:{' '}
        <code style={{ fontSize: 11, background: '#f9f0ff', padding: '1px 4px', borderRadius: 3 }}>
          {iterateOver || 'items'}
        </code>
      </div>
      <div style={{ marginTop: 4, fontSize: 11, color: '#aaa', display: 'flex', justifyContent: 'space-between' }}>
        <span>↓ done</span>
        <span>→ each item</span>
      </div>
    </BaseNode>
  )
}

export default LoopNode
