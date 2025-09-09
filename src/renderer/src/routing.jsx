import { GitBranch, Shield } from 'lucide-react'
import GithubAccessPage from './pages/GithubAccessPage'
import GithubSettingsPage from './pages/GithubSettingsPage/GithubSettingsPage'

export const ROUTES = [
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
