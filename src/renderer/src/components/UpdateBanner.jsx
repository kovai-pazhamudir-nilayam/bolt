import { useEffect, useState } from 'react'
import { Button, Progress, Space, Tag } from 'antd'
import { Download, RefreshCw, X } from 'lucide-react'

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
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (!window.updaterAPI) return

    window.updaterAPI.onAvailable((updateInfo) => {
      setInfo(updateInfo)
      setState(STATE.AVAILABLE)
      setDismissed(false)
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

  if (dismissed || state === STATE.IDLE || state === STATE.ERROR) return null

  return (
    <Space
      size={8}
      style={{
        background: '#1677ff',
        color: '#fff',
        padding: '4px 12px',
        borderRadius: 6,
        fontSize: 13,
        alignItems: 'center',
        display: 'flex'
      }}
    >
      {state === STATE.AVAILABLE && (
        <>
          <Tag color="green" style={{ marginRight: 0 }}>
            New
          </Tag>
          <span>v{info?.version} available</span>
          <Button
            size="small"
            icon={<Download size={13} />}
            onClick={handleDownload}
            style={{ background: '#fff', color: '#1677ff', border: 'none', fontWeight: 600 }}
          >
            Download
          </Button>
          <Button
            type="text"
            size="small"
            icon={<X size={13} />}
            onClick={() => setDismissed(true)}
            style={{ color: '#fff', padding: '0 4px' }}
          />
        </>
      )}

      {state === STATE.DOWNLOADING && (
        <>
          <span>Downloading update…</span>
          <Progress
            percent={progress}
            size="small"
            style={{ width: 120, margin: 0 }}
            strokeColor="#fff"
            trailColor="rgba(255,255,255,0.3)"
            format={(p) => <span style={{ color: '#fff', fontSize: 11 }}>{p}%</span>}
          />
        </>
      )}

      {state === STATE.DOWNLOADED && (
        <>
          <Tag color="green" style={{ marginRight: 0 }}>
            Ready
          </Tag>
          <span>Update downloaded</span>
          <Button
            size="small"
            icon={<RefreshCw size={13} />}
            onClick={handleInstall}
            style={{ background: '#fff', color: '#1677ff', border: 'none', fontWeight: 600 }}
          >
            Restart &amp; Update
          </Button>
        </>
      )}
    </Space>
  )
}

export default UpdateBanner
