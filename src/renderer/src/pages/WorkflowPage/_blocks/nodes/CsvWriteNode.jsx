import BaseNode from './BaseNode'

const CsvWriteNode = (props) => {
  const { filePath, delimiter } = props.data.config || {}
  return (
    <BaseNode {...props} hasOutput={false}>
      {filePath
        ? <span title={filePath} style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 180 }}>{filePath}</span>
        : <span style={{ color: '#aaa', fontStyle: 'italic' }}>No file path set</span>
      }
      {delimiter && delimiter !== ',' && (
        <span style={{ color: '#888' }}> · delim: {delimiter}</span>
      )}
    </BaseNode>
  )
}

export default CsvWriteNode
