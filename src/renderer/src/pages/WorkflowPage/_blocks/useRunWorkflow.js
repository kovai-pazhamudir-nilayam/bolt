import { useCallback, useRef, useState } from 'react'
import { executeWorkflow } from '../engine/Engine'
import { validateWorkflow } from '../engine/validator'

/**
 * Hook that runs the workflow and keeps node status, logs, and outputs in sync.
 *
 * Returns:
 *   isRunning      — boolean
 *   runError       — string | null  (first fatal error)
 *   validationErrors — string[]
 *   lastOutputs    — Map<nodeId, items[]> | null
 *   logs           — { id, time, nodeId, label, message, level }[]
 *   isDebugMode    — boolean
 *   debugNodeId    — string | null  (node currently paused at in debug mode)
 *   run(nodes, edges, setNodes)         — start normal execution
 *   debugStep()                         — advance one step in debug mode
 *   toggleDebug()                       — toggle debug mode on/off
 *   clearLogs()
 */
export function useRunWorkflow() {
  const [isRunning, setIsRunning] = useState(false)
  const [runError, setRunError] = useState(null)
  const [validationErrors, setValidationErrors] = useState([])
  const [lastOutputs, setLastOutputs] = useState(null)
  const [logs, setLogs] = useState([])
  const [isDebugMode, setIsDebugMode] = useState(false)
  const [debugNodeId, setDebugNodeId] = useState(null)

  // Used to pause/resume in debug mode
  const stepResolveRef = useRef(null)
  const logIdRef = useRef(0)

  const appendLog = useCallback((nodeId, label, message, level = 'info') => {
    setLogs((prev) => [
      ...prev,
      {
        id: ++logIdRef.current,
        time: new Date().toLocaleTimeString(),
        nodeId,
        label: label || 'Engine',
        message,
        level
      }
    ])
  }, [])

  const clearLogs = useCallback(() => setLogs([]), [])

  const toggleDebug = useCallback(() => {
    setIsDebugMode((d) => !d)
  }, [])

  const debugStep = useCallback(() => {
    if (stepResolveRef.current) {
      stepResolveRef.current()
      stepResolveRef.current = null
      setDebugNodeId(null)
    }
  }, [])

  const run = useCallback(
    async (nodes, edges, setNodes) => {
      if (isRunning) return

      // Validate first
      const errors = validateWorkflow(nodes, edges)
      setValidationErrors(errors)
      if (errors.length > 0) return

      setIsRunning(true)
      setRunError(null)
      setLogs([])
      setLastOutputs(null)

      // Reset all node statuses to idle
      setNodes((nds) => nds.map((n) => ({ ...n, data: { ...n.data, status: 'idle' } })))

      const onNodeStatus = (nodeId, status) => {
        setNodes((nds) =>
          nds.map((n) => (n.id === nodeId ? { ...n, data: { ...n.data, status } } : n))
        )
      }

      const debugOptions = isDebugMode
        ? {
            stepMode: true,
            onStepReady: (nodeId) => {
              setDebugNodeId(nodeId)
              return new Promise((resolve) => {
                stepResolveRef.current = resolve
              })
            }
          }
        : {}

      const { outputs, error } = await executeWorkflow(
        nodes,
        edges,
        onNodeStatus,
        appendLog,
        debugOptions
      ).catch((err) => ({ outputs: new Map(), error: err.message }))

      if (error) setRunError(error)
      setLastOutputs(outputs)
      setIsRunning(false)
      setDebugNodeId(null)
      stepResolveRef.current = null
    },
    [isRunning, isDebugMode, appendLog]
  )

  return {
    isRunning,
    runError,
    validationErrors,
    lastOutputs,
    logs,
    isDebugMode,
    debugNodeId,
    run,
    debugStep,
    toggleDebug,
    clearLogs
  }
}
