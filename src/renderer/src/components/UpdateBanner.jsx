import { useEffect, useState } from 'react'
import { Button, Modal, Progress, Typography } from 'antd'
import { Download, RefreshCw } from 'lucide-react'
import iconLogo from '../assets/icon-logo.png'

const { Text, Title } = Typography

const STATE = {
  IDLE: 'idle',
  AVAILABLE: 'available',
  DOWNLOADING: 'downloading',
  DOWNLOADED: 'downloaded',
  ERROR: 'error'
}

const UpdateBanner = () => {
  const [state, setState] = useState(STATE.IDLE)
  const [info, setInfo] = useState(null)
  const [progress, setProgress] = useState(0)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!window.updaterAPI) return

    window.updaterAPI.onAvailable((updateInfo) => {
      setInfo(updateInfo)
      setState(STATE.AVAILABLE)
      setOpen(true)
    })

    window.updaterAPI.onProgress((p) => {
      setProgress(Math.round(p.percent))
      setState(STATE.DOWNLOADING)
    })

    window.updaterAPI.onDownloaded((updateInfo) => {
      setInfo(updateInfo)
      setState(STATE.DOWNLOADED)
    })

    window.updaterAPI.onError((msg) => {
      console.error('[Updater]', msg)
      setState(STATE.ERROR)
      setOpen(false)
    })

    return () => {
      window.updaterAPI.removeAllListeners()
    }
  }, [])

  const handleDownload = () => {
    setState(STATE.DOWNLOADING)
    setProgress(0)
    window.updaterAPI.download()
  }

  const handleInstall = () => {
    window.updaterAPI.install()
  }

  const isDownloading = state === STATE.DOWNLOADING

  return (
    <Modal
      open={open}
      onCancel={() => !isDownloading && setOpen(false)}
      closable={!isDownloading}
      maskClosable={!isDownloading}
      footer={null}
      width={420}
      centered
    >
      <div style={{ textAlign: 'center', padding: '12px 8px 4px' }}>
        {/* Icon */}
        <img
          src={iconLogo}
          alt="Bolt"
          style={{ width: 64, height: 64, margin: '0 auto 16px', display: 'block' }}
        />

        {/* Title */}
        <Title level={4} style={{ marginBottom: 4 }}>
          {state === STATE.AVAILABLE && 'Update Available'}
          {state === STATE.DOWNLOADING && 'Downloading Update'}
          {state === STATE.DOWNLOADED && 'Ready to Install'}
        </Title>

        {/* Version */}
        {info?.version && (
          <Text type="secondary" style={{ fontSize: 13 }}>
            Version {info.version}
          </Text>
        )}

        {/* Progress bar */}
        {state === STATE.DOWNLOADING && (
          <div style={{ marginTop: 24, marginBottom: 8 }}>
            <Progress
              percent={progress}
              strokeColor={{ from: '#1677ff', to: '#4096ff' }}
              status="active"
              style={{ marginBottom: 4 }}
            />
            <Text type="secondary" style={{ fontSize: 12 }}>
              Please wait while the update is being downloaded…
            </Text>
          </div>
        )}

        {/* Description text */}
        {state === STATE.AVAILABLE && (
          <Text type="secondary" style={{ display: 'block', marginTop: 12, fontSize: 13 }}>
            A new version of Bolt is ready to download. You can install it now or later.
          </Text>
        )}

        {state === STATE.DOWNLOADED && (
          <Text type="secondary" style={{ display: 'block', marginTop: 12, fontSize: 13 }}>
            The update has been downloaded and is ready to install. Bolt will restart automatically.
          </Text>
        )}

        {/* Actions */}
        <div style={{ marginTop: 24, display: 'flex', gap: 8, justifyContent: 'center' }}>
          {state === STATE.AVAILABLE && (
            <>
              <Button onClick={() => setOpen(false)}>Later</Button>
              <Button type="primary" icon={<Download size={14} />} onClick={handleDownload}>
                Download Now
              </Button>
            </>
          )}

          {state === STATE.DOWNLOADED && (
            <>
              <Button onClick={() => setOpen(false)}>Later</Button>
              <Button type="primary" icon={<RefreshCw size={14} />} onClick={handleInstall}>
                Restart &amp; Update
              </Button>
            </>
          )}
        </div>
      </div>
    </Modal>
  )
}

export default UpdateBanner
