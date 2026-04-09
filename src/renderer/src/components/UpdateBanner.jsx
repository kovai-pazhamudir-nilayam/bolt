import { useEffect, useState } from 'react'
import { Button, Modal, Typography } from 'antd'
import { ExternalLink } from 'lucide-react'
import iconLogo from '../assets/icon-logo.png'

const { Text, Title } = Typography

const RELEASES_URL = 'https://github.com/kovai-pazhamudir-nilayam/bolt/releases'

const UpdateBanner = () => {
  const [open, setOpen] = useState(false)
  const [newVersion, setNewVersion] = useState(null)
  const [currentVersion, setCurrentVersion] = useState(null)

  useEffect(() => {
    if (!window.updaterAPI) return

    window.updaterAPI.getVersion().then(setCurrentVersion)

    window.updaterAPI.onAvailable((info) => {
      setNewVersion(info?.version ?? null)
      setOpen(true)
    })

    return () => {
      window.updaterAPI.removeAllListeners()
    }
  }, [])

  const handleOpenGitHub = () => {
    window.shellAPI?.openExternal(RELEASES_URL)
  }

  return (
    <Modal
      open={open}
      onCancel={() => setOpen(false)}
      footer={null}
      width={400}
      centered
    >
      <div style={{ textAlign: 'center', padding: '16px 8px 8px' }}>
        <img
          src={iconLogo}
          alt="Bolt"
          style={{ width: 64, height: 64, margin: '0 auto 16px', display: 'block' }}
        />

        <Title level={4} style={{ marginBottom: 4 }}>
          Update Available
        </Title>

        {newVersion && (
          <Text type="secondary" style={{ fontSize: 13 }}>
            Version {newVersion} is ready
          </Text>
        )}

        {currentVersion && newVersion && (
          <Text type="secondary" style={{ display: 'block', fontSize: 12, marginTop: 4 }}>
            You are on v{currentVersion}
          </Text>
        )}

        <Text type="secondary" style={{ display: 'block', marginTop: 14, fontSize: 13 }}>
          Download the latest DMG from GitHub Releases and install it manually.
        </Text>

        <div style={{ marginTop: 24, display: 'flex', gap: 8, justifyContent: 'center' }}>
          <Button onClick={() => setOpen(false)}>Later</Button>
          <Button type="primary" icon={<ExternalLink size={14} />} onClick={handleOpenGitHub}>
            Download on GitHub
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default UpdateBanner
