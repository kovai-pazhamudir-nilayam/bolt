import { Images, Bell, LayoutDashboard, Settings as SettingsIcon, Database, GitBranch, Shield } from 'lucide-react'
import Notifications from './pages/Notifications'
import SettingsPage from './pages/SettingsPage/SettingsPage'
import GithubSettings from './pages/SettingsPage/GithubSettings'
import MediaPage from './pages/MediaPage'
import BackupPage from './pages/BackupPage'
import GithubAccessPage from './pages/GithubAccessPage'

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
          dsd
        </div>
      </div>
    )
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
  },
  {
    label: 'Settings',
    path: '/settings',
    icon: SettingsIcon,
    element: <SettingsPage />
  },
  {
    label: 'GitHub Settings',
    path: '/github-settings',
    icon: GitBranch,
    element: <GithubSettings />
  },
  {
    label: 'GitHub Access',
    path: '/github-access',
    icon: Shield,
    element: <GithubAccessPage />
  },
  {
    label: 'Backup',
    path: '/backup',
    icon: Database,
    element: <BackupPage />
  }
]
