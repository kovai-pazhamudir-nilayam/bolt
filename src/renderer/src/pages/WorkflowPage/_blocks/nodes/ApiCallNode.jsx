import BaseNode from './BaseNode'

const METHOD_COLORS = { GET: '#52c41a', POST: '#1677ff', PUT: '#fa8c16', DELETE: '#f5222d', PATCH: '#722ed1' }

const ApiCallNode = (props) => {
  const { url, method = 'GET' } = props.data.config || {}
  return (
    <BaseNode {...props}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{
          background: METHOD_COLORS[method] || '#888',
          color: '#fff',
          fontSize: 10,
          fontWeight: 700,
          padding: '1px 5px',
          borderRadius: 3,
          flexShrink: 0
        }}>
          {method}
        </span>
        {url
          ? <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 150 }}>{url}</span>
          : <span style={{ color: '#aaa', fontStyle: 'italic' }}>No URL set</span>
        }
      </div>
    </BaseNode>
  )
}

export default ApiCallNode
