import { Modal, Space, Tag, Typography } from 'antd'
import { Edit, Eye, EyeOff, Monitor } from 'lucide-react'
import { useState } from 'react'
import { accessColor } from '../featureConfig.helpers'

const ACCESS_ICONS = { write: <Edit size={12} />, read: <Eye size={12} />, hidden: <EyeOff size={12} /> }
const accessIcon = (v) => ACCESS_ICONS[v] || null

const { Text } = Typography

const AppPreviewModal = ({ open, onClose, features, routes }) => {
  const [selectedPageKey, setSelectedPageKey] = useState(null)

  const visibleRoutes = (routes || []).filter((r) => {
    if (r.hideInMenu) return false
    const feat = features.find((f) => f.feature_key === r.path.replace('/', '').toLowerCase())
    return !feat || feat.access_level !== 'hidden'
  })

  const pageTabs = selectedPageKey
    ? features.filter(
        (f) => f.feature_type === 'tab' && f.feature_key.startsWith(selectedPageKey + '-')
      )
    : []

  const selectedRoute = visibleRoutes.find((r) => r.path.replace('/', '').toLowerCase() === selectedPageKey)
  const selectedFeat = features.find((f) => f.feature_key === selectedPageKey)

  const handleClose = () => {
    setSelectedPageKey(null)
    onClose()
  }

  return (
    <Modal
      title={
        <Space>
          <Monitor size={16} />
          App Preview — User View
        </Space>
      }
      open={open}
      onCancel={handleClose}
      footer={null}
      width={720}
    >
      <div style={{ display: 'flex', gap: 12, minHeight: 400 }}>
        {/* Sidebar */}
        <div
          style={{
            width: 180,
            background: '#141414',
            borderRadius: 8,
            padding: '12px 0',
            flexShrink: 0
          }}
        >
          <div
            style={{
              padding: '0 14px 10px',
              color: '#666',
              fontSize: 10,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: 1
            }}
          >
            Navigation
          </div>
          {visibleRoutes.map((r) => {
            const pageKey = r.path.replace('/', '').toLowerCase()
            const feat = features.find((f) => f.feature_key === pageKey)
            const access = feat ? feat.access_level : 'write'
            const isSelected = selectedPageKey === pageKey
            return (
              <div
                key={r.path}
                onClick={() => setSelectedPageKey(pageKey)}
                style={{
                  padding: '7px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  color: isSelected ? '#1677ff' : '#d9d9d9',
                  background: isSelected ? 'rgba(22,119,255,0.1)' : 'transparent',
                  fontSize: 13,
                  cursor: 'pointer',
                  borderLeft: isSelected ? '2px solid #1677ff' : '2px solid transparent'
                }}
              >
                <span style={{ flex: 1 }}>{r.label}</span>
                {access === 'read' && (
                  <Tag
                    color="blue"
                    style={{ fontSize: 10, margin: 0, padding: '0 3px', lineHeight: '16px' }}
                  >
                    Read
                  </Tag>
                )}
              </div>
            )
          })}
        </div>

        {/* Content panel */}
        <div
          style={{
            flex: 1,
            background: '#1a1a1a',
            borderRadius: 8,
            padding: 20,
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {selectedRoute ? (
            <>
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: '#fff', marginBottom: 4 }}>
                  {selectedRoute.label}
                </div>
                <Space size={6}>
                  <Tag
                    color={accessColor(selectedFeat?.access_level || 'write')}
                    icon={accessIcon(selectedFeat?.access_level || 'write')}
                  >
                    {(selectedFeat?.access_level || 'write').toUpperCase()}
                  </Tag>
                  {selectedFeat?.description && (
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {selectedFeat.description}
                    </Text>
                  )}
                </Space>
              </div>

              {pageTabs.length > 0 ? (
                <>
                  <div
                    style={{
                      color: '#666',
                      fontSize: 11,
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      marginBottom: 10
                    }}
                  >
                    Tabs
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {pageTabs.map((tab) => (
                      <div
                        key={tab.feature_key}
                        style={{
                          background: '#262626',
                          borderRadius: 6,
                          padding: '10px 16px',
                          minWidth: 150,
                          opacity: tab.access_level === 'hidden' ? 0.4 : 1
                        }}
                      >
                        <div style={{ color: '#d9d9d9', fontSize: 13, marginBottom: 6 }}>
                          {tab.feature_name}
                        </div>
                        <Tag
                          color={accessColor(tab.access_level)}
                          icon={accessIcon(tab.access_level)}
                          style={{ fontSize: 11 }}
                        >
                          {tab.access_level.toUpperCase()}
                        </Tag>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div style={{ color: '#555', fontSize: 13, marginTop: 8 }}>
                  No tabs configured for this page.
                </div>
              )}
            </>
          ) : (
            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#555'
              }}
            >
              <Monitor size={40} style={{ opacity: 0.2, marginBottom: 12 }} />
              <div style={{ fontSize: 13 }}>Click a page to see its details and tabs</div>
              <div style={{ fontSize: 12, marginTop: 8 }}>
                {visibleRoutes.length} of {(routes || []).filter((r) => !r.hideInMenu).length} pages visible
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  )
}

export default AppPreviewModal
