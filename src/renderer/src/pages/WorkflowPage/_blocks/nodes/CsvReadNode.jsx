import BaseNode from './BaseNode'

const CsvReadNode = (props) => {
  const { filePath, delimiter, fileContent } = props.data.config || {}
  return (
    <BaseNode {...props} hasInput={false}>
      {fileContent ? (
        <span style={{ color: '#389e0d' }}>
          ✓ {filePath || 'File loaded'}{' '}
          <span style={{ color: '#aaa', fontSize: 10 }}>
            ({(fileContent.length / 1024).toFixed(1)} KB)
          </span>
        </span>
      ) : filePath ? (
        <span title={filePath} style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 180 }}>
          {filePath}
        </span>
      ) : (
        <span style={{ color: '#aaa', fontStyle: 'italic' }}>Sample data (no file set)</span>
      )}
      {delimiter && delimiter !== ',' && (
        <span style={{ color: '#888', fontSize: 10 }}> · delim: {delimiter}</span>
      )}
    </BaseNode>
  )
}

export default CsvReadNode
