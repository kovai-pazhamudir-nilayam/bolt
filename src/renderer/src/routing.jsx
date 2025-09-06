import { Images, Bell, LayoutDashboard, Settings as SettingsIcon } from 'lucide-react'
import Notifications from './pages/Notifications'
import SettingsPage from './pages/SettingsPage/SettingsPage'
import MediaPage from './pages/MediaPage'
import ConfigDemo from './components/ConfigDemo'

export const ROUTES = [
  {
    path: '/',
    label: 'Dashboard',
    icon: LayoutDashboard,
    element: (
      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
        <div
          style={{
            flex: 1,
            minWidth: 240,
            background: '#222',
            padding: 16,
            borderRadius: 8
          }}
        >
          <h2 style={{ color: '#fff' }}>Widget 1</h2>
          <p style={{ color: '#fff' }}>This is a sample widget.</p>
        </div>
        <div
          style={{
            flex: 1,
            minWidth: 240,
            background: '#222',
            padding: 16,
            borderRadius: 8
          }}
        >
          <h2 style={{ color: '#fff' }}>Configuration Demo</h2>
          <ConfigDemo />
        </div>
      </div>
    )
  },
  {
    label: 'Settings',
    path: '/settings',
    icon: SettingsIcon,
    element: <SettingsPage />
  },
  {
    label: 'Media',
    path: '/media-procesing',
    icon: Images,
    element: <MediaPage />
  },
  {
    label: 'My Notification',
    path: '/notifications',
    icon: Bell,
    element: <Notifications />
  }
]
