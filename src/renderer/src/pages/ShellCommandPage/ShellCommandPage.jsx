import { Button, Col, Form, Input, Row, Space, Tabs } from 'antd'
import PageHeader from '../../components/PageHeader/PageHeader'
import LogsViewer from '../../components/LogsViewer/LogsViewer'
import TerminalWrapper from '../../components/Terminal/TerminalWrapper'
import SimpleTerminal from '../../components/Terminal/SimpleTerminal'
import { useCallback, useEffect, useRef, useState } from 'react'
import withNotification from '../../hoc/withNotification'
import { shellFactory } from '../../repos/shell.repo'

const { shellRepo } = shellFactory()

const ShellCommandPageWoc = ({ renderErrorNotification, renderSuccessNotification }) => {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(false)
  const [currentProcessId, setCurrentProcessId] = useState(null)
  const logRef = useRef(null)
  const logUnsubRef = useRef(null)
  const endUnsubRef = useRef(null)

  const onFinish = useCallback(
    async (values) => {
      const { command, workingDirectory } = values

      if (!command?.trim()) {
        renderErrorNotification({ message: 'Please enter a command' })
        return
      }

      // Clean up any existing listeners first
      if (logUnsubRef.current) {
        logUnsubRef.current()
        logUnsubRef.current = null
      }
      if (endUnsubRef.current) {
        endUnsubRef.current()
        endUnsubRef.current = null
      }

      setLoading(true)

      // Listen for logs and end events
      const handleLog = (data) => {
        const { output, processId } = data
        setLogs((prevLogs) => [...prevLogs, output])
        if (logRef.current) {
          logRef.current.scrollTop = logRef.current.scrollHeight
        }
      }

      const handleEnd = (data) => {
        const { code, processId } = data
        setLoading(false)
        setCurrentProcessId(null)

        // Clean up listeners when command ends
        if (logUnsubRef.current) {
          logUnsubRef.current()
          logUnsubRef.current = null
        }
        if (endUnsubRef.current) {
          endUnsubRef.current()
          endUnsubRef.current = null
        }

        if (code === 0) {
          renderSuccessNotification({ message: 'Command executed successfully' })
        } else {
          renderErrorNotification({ message: `Command failed with code ${code}` })
        }
      }

      try {
        // Register listeners and store unsubscribe functions
        logUnsubRef.current = shellRepo.onLog(handleLog)
        endUnsubRef.current = shellRepo.onEnd(handleEnd)

        // Run the command
        const result = await shellRepo.run(command, {
          cwd: workingDirectory || undefined
        })

        setCurrentProcessId(result.processId)
      } catch (error) {
        setLoading(false)
        renderErrorNotification({ message: error.message || 'Command execution failed' })
      }
    },
    [renderErrorNotification, renderSuccessNotification]
  )

  const handleKillCommand = useCallback(async () => {
    if (currentProcessId) {
      try {
        await shellRepo.kill(currentProcessId)
        renderSuccessNotification({ message: 'Command terminated' })
        setCurrentProcessId(null)
        setLoading(false)
      } catch (error) {
        renderErrorNotification({ message: 'Failed to terminate command' })
      }
    }
  }, [currentProcessId, renderErrorNotification, renderSuccessNotification])

  const clearLogs = useCallback(() => {
    setLogs([])
  }, [])

  useEffect(() => {
    // Cleanup function for component unmount
    return () => {
      if (logUnsubRef.current) {
        logUnsubRef.current()
        logUnsubRef.current = null
      }
      if (endUnsubRef.current) {
        endUnsubRef.current()
        endUnsubRef.current = null
      }
    }
  }, [])

  const handleCommandStart = useCallback((command) => {
    console.log('Command started:', command)
  }, [])

  const handleCommandEnd = useCallback(
    (success, code) => {
      if (success) {
        renderSuccessNotification({ message: 'Command executed successfully' })
      } else {
        renderErrorNotification({ message: `Command failed with code ${code}` })
      }
    },
    [renderSuccessNotification, renderErrorNotification]
  )

  const handleTerminalError = useCallback(
    (error) => {
      renderErrorNotification({ message: error.message || 'Command execution failed' })
    },
    [renderErrorNotification]
  )

  const tabItems = [
    {
      key: 'form',
      label: 'Form Interface',
      children: (
        <Row gutter={[16, 16]}>
          <Col lg={10} xs={24}>
            <Form onFinish={onFinish} layout="vertical" requiredMark={false}>
              <Form.Item
                name="command"
                label="Command"
                rules={[{ required: true, message: 'Please enter a command' }]}
              >
                <Input.TextArea
                  placeholder="Enter shell command (e.g., ls -la, npm install, git status)"
                  rows={3}
                />
              </Form.Item>

              <Form.Item name="workingDirectory" label="Working Directory (optional)">
                <Input placeholder="Leave empty to use current directory" />
              </Form.Item>

              <Space>
                <Button type="primary" htmlType="submit" loading={loading}>
                  {loading ? 'Running...' : 'Run Command'}
                </Button>

                {currentProcessId && (
                  <Button danger onClick={handleKillCommand}>
                    Kill Process
                  </Button>
                )}

                <Button onClick={clearLogs}>Clear Logs</Button>
              </Space>
            </Form>
          </Col>

          <Col lg={14} xs={24}>
            <LogsViewer logRef={logRef} logs={logs} />
          </Col>
        </Row>
      )
    },
    {
      key: 'terminal',
      label: 'Interactive Terminal',
      children: (
        <div
          style={{
            height: '600px',
            border: '1px solid #d9d9d9',
            borderRadius: '6px',
            position: 'relative'
          }}
        >
          <SimpleTerminal style={{ height: '100%', width: '100%' }} />
          <div
            style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              background: 'rgba(0,0,0,0.7)',
              color: 'white',
              padding: '5px 10px',
              borderRadius: '4px',
              fontSize: '12px'
            }}
          >
            Terminal Status: Testing
          </div>
        </div>
      )
    }
  ]

  return (
    <div>
      <PageHeader
        title="Shell Command Executor"
        description="Execute shell commands using either a form interface or an interactive terminal."
      />
      <Tabs defaultActiveKey="form" items={tabItems} />
    </div>
  )
}

const ShellCommandPage = withNotification(ShellCommandPageWoc)

export default ShellCommandPage
