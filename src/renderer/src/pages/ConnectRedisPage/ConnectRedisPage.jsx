import { Col, Form, Row } from 'antd'
import { useCallback, useEffect, useRef, useState } from 'react'
import PageHeader from '../../components/PageHeader/PageHeader'
import LogsViewer from '../../components/LogsViewer/LogsViewer'
import SelectFormItem from '../../components/SelectFormItem'
import SubmitBtnForm from '../../components/SubmitBtnForm'
import withNotification from '../../hoc/withNotification'
import { settingsFactory } from '../../repos/SettingsPage.repo'
import { shellFactory } from '../../repos/shell.repo'

// Constants
const COMMAND_TIMEOUT = 300000 // 5 minutes
const SUCCESS_CODE = 0

// Initialize repositories
const { companyRepo, environmentRepo, gcpProjectConfigRepo } = settingsFactory()
const { shellRepo } = shellFactory()

const ConnectRedisPageWoc = ({ renderErrorNotification, renderSuccessNotification }) => {
  // State management
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(false)
  const [datasource, setDatasource] = useState({
    companies: [],
    environments: []
  })

  const logRef = useRef(null)

  const validateRedisConfig = (config) => {
    if (!config?.redis_host || !config?.redis_password) {
      renderErrorNotification({
        message: 'Redis config does not exist'
      })
      return false
    }

    const { gcp_cluster: cluster, gcp_region: region, gcp_project: project } = config

    if (!cluster || !region || !project) {
      renderErrorNotification({
        message: 'Missing required GCP/Redis configuration (cluster, region, or project)'
      })
      return false
    }

    return true
  }

  const buildGcloudCommand = (config) => {
    const { gcp_cluster: cluster, gcp_region: region, gcp_project: project } = config
    return `gcloud container clusters get-credentials ${cluster} --region ${region} --project ${project}`
  }

  const getJumpboxPod = async () => {
    const kubectlCommand = 'kubectl get pods -o=name --field-selector=status.phase=Running'

    return new Promise((resolve, reject) => {
      let output = ''

      const handleLog = (data) => {
        output += data.output
      }

      const handleEnd = (data) => {
        if (data.code === 0) {
          try {
            const jumpboxPod = output
              .toString('utf-8')
              .split('\n')
              .find((line) => line.includes('jumpbox') || line.includes('pod'))
              ?.split('/')[1]
              ?.trim()

            if (jumpboxPod) {
              console.log(`#3 ---> jumpbox pod - ${jumpboxPod}`)
              resolve(jumpboxPod)
            } else {
              reject(new Error('No running jumpbox pod found'))
            }
          } catch (error) {
            reject(new Error(`Failed to parse jumpbox pod: ${error.message}`))
          }
        } else {
          reject(new Error(`Failed to get jumpbox pod with code ${data.code}`))
        }
      }

      const logUnsub = shellRepo.onLog(handleLog)
      const endUnsub = shellRepo.onEnd(handleEnd)

      shellRepo.run(kubectlCommand).catch(reject)
    })
  }

  const buildRedisConnectionCommand = (config, jumpboxPod) => {
    const { redis_host: host, redis_password: password } = config
    const shCommand = `kubectl exec ${jumpboxPod} -- sh`
    const redisCommand = `-c "export REDISCLI_AUTH='${password}' && redis-cli -h ${host} --no-auth-warning"`
    return `${shCommand} ${redisCommand}`
  }

  const handleLog = (data) => {
    const { output } = data
    setLogs((prevLogs) => [...prevLogs, output])

    // Auto-scroll to bottom
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight
    }
  }

  const handleEnd = (data) => {
    const { code } = data
    setLoading(false)

    if (code === SUCCESS_CODE) {
      renderSuccessNotification({ message: 'Command executed successfully' })
    } else {
      renderErrorNotification({ message: `Command failed with code ${code}` })
    }
  }

  const executeCommand = (command, isInteractive = false) => {
    if (!isInteractive) {
      setLogs([]) // Clear previous logs
    }
    setLoading(true)

    // Register event listeners
    const logUnsub = shellRepo.onLog(handleLog)
    const endUnsub = shellRepo.onEnd(handleEnd)

    // Cleanup function
    const cleanup = () => {
      if (logUnsub) logUnsub()
      if (endUnsub) endUnsub()
    }

    // Set up cleanup timeout as fallback (longer for interactive sessions)
    const timeout = isInteractive ? COMMAND_TIMEOUT * 2 : COMMAND_TIMEOUT
    const cleanupTimeout = setTimeout(cleanup, timeout)

    // Store cleanup function for potential manual cleanup
    window.currentCommandCleanup = () => {
      clearTimeout(cleanupTimeout)
      cleanup()
    }

    // Execute command
    shellRepo.run(command).catch((error) => {
      setLoading(false)
      renderErrorNotification({
        message: error.message || 'Command execution failed'
      })
    })
  }

  const runRedisCommand = (redisCommand, jumpboxPod, config) => {
    const { redis_host: host, redis_password: password } = config
    const command = `kubectl exec ${jumpboxPod} -- sh -c "export REDISCLI_AUTH='${password}' && redis-cli -h ${host} --no-auth-warning -c '${redisCommand}'"`

    console.log(`Running Redis command: ${redisCommand}`)
    executeCommand(command)
  }

  // Helper function to run custom Redis commands (can be called from browser console)
  window.runCustomRedisCommand = (command) => {
    if (window.currentJumpboxPod && window.currentRedisConfig) {
      runRedisCommand(command, window.currentJumpboxPod, window.currentRedisConfig)
    } else {
      console.error('No active Redis connection. Please connect to Redis first.')
    }
  }

  const executeCommandSequence = async (commands) => {
    for (let i = 0; i < commands.length; i++) {
      const { command, description, isAsync = false } = commands[i]

      console.log(`#${i + 1} ---> ${description}`)

      if (isAsync) {
        try {
          const result = await command()
          console.log(`#${i + 1} completed ---> ${description}`)
          return result
        } catch (error) {
          throw new Error(`Failed at step ${i + 1}: ${error.message}`)
        }
      } else {
        await new Promise((resolve, reject) => {
          const handleEnd = (data) => {
            if (data.code === 0) {
              console.log(`#${i + 1} completed ---> ${description}`)
              resolve()
            } else {
              reject(new Error(`Command failed with code ${data.code}`))
            }
          }

          const endUnsub = shellRepo.onEnd(handleEnd)
          shellRepo.run(command).catch(reject)
        })
      }
    }
  }

  const onFinish = async (values) => {
    try {
      // Step 1: Get Redis configuration
      console.log('#1 ---> Getting Redis configuration')
      const redisConfigObj = await gcpProjectConfigRepo.getOne({
        company_code: values.company_code,
        env_code: values.env_code
      })

      if (!validateRedisConfig(redisConfigObj)) {
        return
      }

      // Step 2: Get GCP cluster credentials
      const gcloudCommand = buildGcloudCommand(redisConfigObj)

      // Step 3: Get jumpbox pod
      const getJumpboxPodCommand = async () => {
        return await getJumpboxPod()
      }

      // Step 4: Test Redis connection and run commands
      const testRedisConnection = (jumpboxPod) => {
        console.log('#4 ---> Testing Redis connection through jumpbox')

        // Store connection details globally for custom commands
        window.currentJumpboxPod = jumpboxPod
        window.currentRedisConfig = redisConfigObj

        // Test Redis connection with ping
        runRedisCommand('ping', jumpboxPod, redisConfigObj)

        // Run additional Redis commands after a delay
        setTimeout(() => {
          console.log('Running Redis info command...')
          runRedisCommand('info server', jumpboxPod, redisConfigObj)
        }, 2000)

        setTimeout(() => {
          console.log('Listing Redis keys...')
          runRedisCommand('keys *', jumpboxPod, redisConfigObj)
        }, 4000)

        console.log(
          'Redis connection established! You can run custom commands using: window.runCustomRedisCommand("your-command")'
        )
      }

      // Execute the sequence
      setLogs([]) // Clear previous logs
      setLoading(true)

      const jumpboxPod = await executeCommandSequence([
        { command: gcloudCommand, description: 'Getting GCP cluster credentials' },
        { command: getJumpboxPodCommand, description: 'Getting jumpbox pod', isAsync: true }
      ])

      // Test Redis connection and run commands
      testRedisConnection(jumpboxPod)
    } catch (error) {
      setLoading(false)
      renderErrorNotification({
        message: error.message || 'Failed to connect to Redis'
      })
    }
  }

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [allCompanies, allEnvironments] = await Promise.all([
        companyRepo.getAll(),
        environmentRepo.getAll()
      ])

      setDatasource({
        companies: allCompanies,
        environments: allEnvironments
      })
    } catch (error) {
      renderErrorNotification({
        message: error.message
      })
    } finally {
      setLoading(false)
    }
  }, [renderErrorNotification])

  // Debug logging for development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log(
        'Available window APIs:',
        Object.keys(window).filter((key) => key.includes('API') || key.includes('shell'))
      )
      console.log('shellAPI available:', !!window.shellAPI)
    }
  }, [])

  // Initialize data and cleanup
  useEffect(() => {
    fetchData()

    // Cleanup function for component unmount
    return () => {
      if (window.currentCommandCleanup) {
        window.currentCommandCleanup()
        delete window.currentCommandCleanup
      }
    }
  }, [fetchData])

  return (
    <div>
      <PageHeader
        title="Connect to Redis"
        description="Connect to Redis through GCP cluster by getting credentials, finding jumpbox pod, and establishing Redis connection."
      />
      <Row gutter={[16, 16]}>
        <Col lg={10} xs={24}>
          <Form onFinish={onFinish} layout="vertical" requiredMark={false}>
            <SelectFormItem
              options={datasource.companies}
              name="company_code"
              label="Company"
              transform="COMPANIES"
            />
            <SelectFormItem
              options={datasource.environments}
              name="env_code"
              label="Environment"
              transform="ENVIRONMENTS"
            />
            <SubmitBtnForm loading={loading} />
          </Form>
        </Col>
        <Col lg={14} xs={24}>
          <LogsViewer logRef={logRef} logs={logs} />
        </Col>
      </Row>
    </div>
  )
}

const ConnectRedisPage = withNotification(ConnectRedisPageWoc)

export default ConnectRedisPage
