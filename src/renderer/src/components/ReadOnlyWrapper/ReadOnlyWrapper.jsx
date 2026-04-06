import { Alert } from 'antd'
import { Lock } from 'lucide-react'

const ReadOnlyWrapper = ({ 
  children, 
  isReadOnly, 
  message = "This feature is in read-only mode. You can view data but cannot make changes.",
  showAlert = true 
}) => {
  if (!isReadOnly) {
    return children
  }

  return (
    <div>
      {showAlert && (
        <Alert
          message="Read-Only Mode"
          description={message}
          type="warning"
          icon={<Lock size={16} />}
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}
      <div style={{ pointerEvents: 'none', opacity: 0.7 }}>
        {children}
      </div>
    </div>
  )
}

export default ReadOnlyWrapper
