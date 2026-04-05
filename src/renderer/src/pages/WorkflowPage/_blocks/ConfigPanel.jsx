import { Button, Divider, Space, Typography } from 'antd'
import { X } from 'lucide-react'
import { NODE_CONFIGS } from '../workflow.helpers'
import ApiCallConfig from './config/ApiCallConfig'
import CsvReadConfig from './config/CsvReadConfig'
import CsvWriteConfig from './config/CsvWriteConfig'
import JsTransformConfig from './config/JsTransformConfig'
import LoopConfig from './config/LoopConfig'

const { Text, Title } = Typography

const CONFIG_FORMS = {
  csvRead: CsvReadConfig,
  apiCall: ApiCallConfig,
  jsTransform: JsTransformConfig,
  loop: LoopConfig,
  csvWrite: CsvWriteConfig
}

const ConfigPanel = ({ node, onUpdate, onClose }) => {
  if (!node) return null

  const cfg = NODE_CONFIGS[node.type] || {}
  const ConfigForm = CONFIG_FORMS[node.type]

  return (
    <div
      style={{
        width: 300,
        borderLeft: '1px solid #f0f0f0',
        display: 'flex',
        flexDirection: 'column',
        background: '#fafafa',
        flexShrink: 0
      }}
    >
      {/* Panel header */}
      <div
        style={{
          padding: '12px 16px',
          borderBottom: '1px solid #f0f0f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: cfg.headerBg,
        }}
      >
        <div>
          <Title level={5} style={{ margin: 0, color: '#fff', fontSize: 14 }}>
            {node.data.label || cfg.label}
          </Title>
          <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 11 }}>
            {node.type} · {node.id}
          </Text>
        </div>
        <Button
          type="text"
          icon={<X size={16} />}
          onClick={onClose}
          style={{ color: '#fff', padding: 4 }}
        />
      </div>

      {/* Config form */}
      <div style={{ padding: 16, overflowY: 'auto', flex: 1 }}>
        {ConfigForm ? (
          <ConfigForm
            config={node.data.config || {}}
            onChange={(newConfig) => onUpdate(node.id, newConfig)}
          />
        ) : (
          <Text type="secondary">No configuration available for this node type.</Text>
        )}
      </div>
    </div>
  )
}

export default ConfigPanel
