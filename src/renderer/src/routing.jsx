import { GitBranch, Shield, Settings as SettingsIcon } from 'lucide-react'
import GithubAccessPage from './pages/GithubAccessPage/GithubAccessPage'
import GithubSettingsPage from './pages/GithubSettingsPage/GithubSettingsPage'
import SettingsPage from './pages/SettingsPage/SettingsPage'

export const ROUTES = [
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
    element: <GithubSettingsPage />
  },
  {
    label: 'GitHub Access',
    path: '/github-access',
    icon: Shield,
    element: <GithubAccessPage />
  }
]
