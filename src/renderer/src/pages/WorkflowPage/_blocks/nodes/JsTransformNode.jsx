import BaseNode from './BaseNode'

const JsTransformNode = (props) => {
  const { code } = props.data.config || {}
  const preview = (code || '').split('\n')[0].trim().slice(0, 40)
  return (
    <BaseNode {...props}>
      {preview
        ? <code style={{ fontSize: 11, background: '#fff7e6', padding: '2px 4px', borderRadius: 3, fontFamily: 'monospace' }}>{preview}</code>
        : <span style={{ color: '#aaa', fontStyle: 'italic' }}>No code written</span>
      }
    </BaseNode>
  )
}

export default JsTransformNode
