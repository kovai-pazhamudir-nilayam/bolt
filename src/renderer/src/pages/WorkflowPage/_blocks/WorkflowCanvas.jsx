import '@xyflow/react/dist/style.css'
import {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  ReactFlow,
  addEdge,
  useEdgesState,
  useNodesState,
  useReactFlow
} from '@xyflow/react'
import { Alert, Button, Drawer, Space, Table, Tag, Tooltip, Typography } from 'antd'
import { Bug, Play, SkipForward } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { generateNodeId, NODE_CONFIGS } from '../workflow.helpers'
import { useRunWorkflow } from './useRunWorkflow'
import { WorkflowActionsContext } from './WorkflowActionsContext'
import ConfigPanel from './ConfigPanel'
import LogsPanel from './LogsPanel'
import nodeTypes from './nodes'

const MINIMAP_STYLE = { height: 100, border: '1px solid #f0f0f0', borderRadius: 6 }
const defaultEdgeOptions = {
  style: { strokeWidth: 2, stroke: '#b0b0b0' },
  animated: false
}

const WorkflowCanvasInner = ({ onSave, workflowName, exampleTrigger }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [selectedNodeId, setSelectedNodeId] = useState(null)
  const [outputDrawer, setOutputDrawer] = useState(null)
  const [logsOpen, setLogsOpen] = useState(false)
  const { screenToFlowPosition } = useReactFlow()

  const {
    isRunning, runError, validationErrors, lastOutputs,
    logs, isDebugMode, debugNodeId,
    run, debugStep, toggleDebug, clearLogs
  } = useRunWorkflow()

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) || null

  const onConnect = useCallback(
    (connection) => setEdges((eds) => addEdge(
      { ...connection, animated: false, style: { strokeWidth: 2, stroke: '#b0b0b0' } }, eds
    )),
    [setEdges]
  )

  const onDragOver = useCallback((event) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])

  const onDrop = useCallback(
    (event) => {
      event.preventDefault()
      const type = event.dataTransfer.getData('application/reactflow')
      if (!type || !NODE_CONFIGS[type]) return
      const position = screenToFlowPosition({ x: event.clientX, y: event.clientY })
      const newNode = {
        id: generateNodeId(type),
        type,
        position,
        data: { label: NODE_CONFIGS[type].label, config: { ...NODE_CONFIGS[type].defaultConfig }, status: 'idle' }
      }
      setNodes((nds) => [...nds, newNode])
      setSelectedNodeId(newNode.id)
    },
    [screenToFlowPosition, setNodes]
  )

  // Load example workflow when triggered from parent
  useEffect(() => {
    if (!exampleTrigger) return
    setNodes(exampleTrigger.nodes.map((n) => ({ ...n, data: { ...n.data, status: 'idle' } })))
    setEdges(exampleTrigger.edges || [])
    setSelectedNodeId(null)
    clearLogs()
  }, [exampleTrigger])

  const onNodeClick = useCallback((_, node) => setSelectedNodeId(node.id), [])

  const onNodeDoubleClick = useCallback(
    (_, node) => {
      if (!lastOutputs) return
      const items = lastOutputs.get(node.id)
      if (items && items.length > 0) {
        setOutputDrawer({ nodeId: node.id, label: node.data.label, items })
      }
    },
    [lastOutputs]
  )

  const onPaneClick = useCallback(() => setSelectedNodeId(null), [])

  const handleNodeConfigUpdate = useCallback(
    (nodeId, newConfig) => {
      setNodes((nds) =>
        nds.map((n) => n.id === nodeId ? { ...n, data: { ...n.data, config: newConfig } } : n)
      )
    },
    [setNodes]
  )

  const handleSave = () => {
    const workflow = {
      id: `wf_${Date.now()}`,
      version: '1.0',
      name: workflowName || 'Untitled Workflow',
      savedAt: new Date().toISOString(),
      nodes: nodes.map(({ id, type, position, data }) => ({
        id, type, position, data: { label: data.label, config: data.config }
      })),
      edges: edges.map(({ id, source, sourceHandle, target, targetHandle }) => ({
        id, source, sourceHandle, target, targetHandle
      }))
    }
    const blob = new Blob([JSON.stringify(workflow, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${(workflowName || 'workflow').replace(/\s+/g, '_')}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleLoad = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (e) => {
      const file = e.target.files[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = (ev) => {
        const wf = JSON.parse(ev.target.result)
        setNodes(wf.nodes.map((n) => ({ ...n, data: { ...n.data, status: 'idle' } })))
        setEdges(wf.edges || [])
        setSelectedNodeId(null)
      }
      reader.readAsText(file)
    }
    input.click()
  }

  const handleClear = () => {
    setNodes([])
    setEdges([])
    setSelectedNodeId(null)
    clearLogs()
  }

  const handleRun = () => run(nodes, edges, setNodes)

  // Node-level actions provided via context to BaseNode
  const retryNode = useCallback(
    (nodeId) => {
      // Reset just this node to idle then re-run the whole workflow
      setNodes((nds) =>
        nds.map((n) => (n.id === nodeId ? { ...n, data: { ...n.data, status: 'idle' } } : n))
      )
      run(nodes, edges, setNodes)
    },
    [nodes, edges, setNodes, run]
  )

  const deleteNode = useCallback(
    (nodeId) => {
      setNodes((nds) => nds.filter((n) => n.id !== nodeId))
      setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId))
      setSelectedNodeId((prev) => (prev === nodeId ? null : prev))
    },
    [setNodes, setEdges]
  )

  if (onSave) onSave({ handleSave, handleLoad, handleClear, handleRun, nodeCount: nodes.length })

  // Output preview table columns
  const outputColumns = outputDrawer?.items?.length
    ? Object.keys(outputDrawer.items[0]).map((key) => ({
        title: key, dataIndex: key, key,
        render: (v) => (typeof v === 'object' ? JSON.stringify(v) : String(v ?? ''))
      }))
    : []

  return (
    <WorkflowActionsContext.Provider value={{ retryNode, deleteNode }}>
    <div style={{ display: 'flex', flex: 1, overflow: 'hidden', flexDirection: 'column' }}>
      {/* Run toolbar */}
      <div style={{
        padding: '6px 14px',
        borderBottom: '1px solid #f0f0f0',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        background: '#fff',
        flexShrink: 0,
        flexWrap: 'wrap'
      }}>
        <Space size={6}>
          <Button
            type="primary"
            icon={<Play size={13} />}
            size="small"
            loading={isRunning && !isDebugMode}
            onClick={handleRun}
            disabled={nodes.length === 0}
            style={{ background: '#52c41a', borderColor: '#52c41a' }}
          >
            {isRunning && !isDebugMode ? 'Running…' : 'Run'}
          </Button>

          <Tooltip title={isDebugMode ? 'Exit debug mode' : 'Step-by-step debug mode'}>
            <Button
              icon={<Bug size={13} />}
              size="small"
              type={isDebugMode ? 'primary' : 'default'}
              onClick={toggleDebug}
              danger={isDebugMode}
            >
              Debug
            </Button>
          </Tooltip>

          {isDebugMode && isRunning && debugNodeId && (
            <Button
              icon={<SkipForward size={13} />}
              size="small"
              type="primary"
              ghost
              onClick={debugStep}
            >
              Next Step
            </Button>
          )}

          {isDebugMode && isRunning && debugNodeId && (
            <Tag color="purple" style={{ fontSize: 12 }}>
              Paused at: {nodes.find((n) => n.id === debugNodeId)?.data.label || debugNodeId}
            </Tag>
          )}
        </Space>

        {lastOutputs && !isRunning && (
          <Typography.Text type="secondary" style={{ fontSize: 12, marginLeft: 4 }}>
            Completed · double-click a node to preview output
          </Typography.Text>
        )}

        {runError && (
          <Alert
            message={runError}
            type="error"
            showIcon
            closable
            style={{ flex: 1, padding: '2px 10px', fontSize: 12 }}
          />
        )}
      </div>

      {/* Validation errors */}
      {validationErrors.length > 0 && (
        <div style={{ padding: '6px 14px', background: '#fff2f0', borderBottom: '1px solid #ffccc7' }}>
          {validationErrors.map((err, i) => (
            <div key={i} style={{ fontSize: 12, color: '#cf1322' }}>✗ {err}</div>
          ))}
        </div>
      )}

      {/* Canvas + config panel */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onNodeClick={onNodeClick}
            onNodeDoubleClick={onNodeDoubleClick}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            defaultEdgeOptions={defaultEdgeOptions}
            fitView
            deleteKeyCode="Delete"
            style={{ background: '#f8f9fa' }}
          >
            <Controls />
            <MiniMap style={MINIMAP_STYLE} nodeColor={(n) => NODE_CONFIGS[n.type]?.headerBg || '#ccc'} />
            <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="#ddd" />

            {nodes.length === 0 && (
              <div style={{
                position: 'absolute', top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center', color: '#bbb', pointerEvents: 'none', zIndex: 4
              }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>⚡</div>
                <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>
                  Drop nodes here to build your workflow
                </div>
                <div style={{ fontSize: 13 }}>Drag node types from the left panel onto the canvas</div>
              </div>
            )}
          </ReactFlow>
        </div>

        {selectedNode && (
          <ConfigPanel
            node={selectedNode}
            onUpdate={handleNodeConfigUpdate}
            onClose={() => setSelectedNodeId(null)}
          />
        )}
      </div>

      {/* Logs panel */}
      <LogsPanel
        logs={logs}
        isOpen={logsOpen}
        onToggle={() => setLogsOpen((o) => !o)}
        onClear={clearLogs}
      />

      {/* Output preview drawer */}
      <Drawer
        title={`Output: ${outputDrawer?.label || ''} (${outputDrawer?.items?.length || 0} rows)`}
        open={!!outputDrawer}
        onClose={() => setOutputDrawer(null)}
        width={640}
        placement="right"
      >
        {outputDrawer && (
          <Table
            dataSource={(outputDrawer.items || []).map((row, i) => ({ ...row, _key: i }))}
            columns={outputColumns}
            rowKey="_key"
            size="small"
            scroll={{ x: true }}
            pagination={{ pageSize: 25 }}
          />
        )}
      </Drawer>
    </div>
    </WorkflowActionsContext.Provider>
  )
}

export default WorkflowCanvasInner
