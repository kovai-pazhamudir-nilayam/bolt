import { ReactFlowProvider } from '@xyflow/react'
import { Button, Input, Space, Tooltip } from 'antd'
import { Download, FolderOpen, Sparkles, Trash2 } from 'lucide-react'
import { useRef, useState } from 'react'
import WorkflowCanvas from './_blocks/WorkflowCanvas'
import WorkflowSidebar from './_blocks/WorkflowSidebar'
import { EXAMPLE_WORKFLOW } from './workflow.example'

const WorkflowPage = () => {
  const [workflowName, setWorkflowName] = useState('Untitled Workflow')
  const actionsRef = useRef(null)
  // Controlled load trigger: pass example data down into canvas
  const [exampleTrigger, setExampleTrigger] = useState(null)

  const handleActionsReady = (actions) => {
    actionsRef.current = actions
  }

  const handleLoadExample = () => {
    setExampleTrigger({ ...EXAMPLE_WORKFLOW, _ts: Date.now() })
    setWorkflowName(EXAMPLE_WORKFLOW.name)
  }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)',
      background: '#fff', borderRadius: 8, overflow: 'hidden', border: '1px solid #f0f0f0'
    }}>
      {/* Toolbar */}
      <div style={{
        padding: '8px 16px', borderBottom: '1px solid #f0f0f0',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: '#fff', flexShrink: 0
      }}>
        <Input
          value={workflowName}
          onChange={(e) => setWorkflowName(e.target.value)}
          variant="borderless"
          style={{ fontSize: 15, fontWeight: 600, maxWidth: 280, padding: 0 }}
          placeholder="Workflow name..."
        />
        <Space>
          <Tooltip title="Load example pipeline (CSV → Loop → API → Transform → CSV)">
            <Button
              icon={<Sparkles size={15} />}
              size="small"
              onClick={handleLoadExample}
            >
              Load Example
            </Button>
          </Tooltip>
          <Tooltip title="Load workflow from JSON">
            <Button
              icon={<FolderOpen size={15} />}
              size="small"
              onClick={() => actionsRef.current?.handleLoad()}
            >
              Load
            </Button>
          </Tooltip>
          <Tooltip title="Save workflow as JSON">
            <Button
              icon={<Download size={15} />}
              size="small"
              type="primary"
              onClick={() => actionsRef.current?.handleSave()}
            >
              Save
            </Button>
          </Tooltip>
          <Tooltip title="Clear canvas">
            <Button
              icon={<Trash2 size={15} />}
              size="small"
              danger
              onClick={() => actionsRef.current?.handleClear()}
            />
          </Tooltip>
        </Space>
      </div>

      {/* Main area: sidebar + canvas */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <WorkflowSidebar />
        <ReactFlowProvider>
          <WorkflowCanvas
            workflowName={workflowName}
            onSave={handleActionsReady}
            exampleTrigger={exampleTrigger}
          />
        </ReactFlowProvider>
      </div>
    </div>
  )
}

export default WorkflowPage
