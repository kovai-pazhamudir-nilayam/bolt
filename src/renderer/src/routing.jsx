import { GitBranch, Shield, ToolCase, Settings as SettingsIcon } from 'lucide-react'
import GithubAccessPage from './pages/GithubAccessPage/GithubAccessPage'
import GithubSettingsPage from './pages/GithubSettingsPage/GithubSettingsPage'
import SettingsPage from './pages/SettingsPage/SettingsPage'
import ToolsPage from './pages/ToolsPage/ToolsPage'
import TaskManagerDI from './pages/TaskManagerDI/TaskManagerDI'

export const ROUTES = [
  {
    label: 'Settings',
    path: '/settings',
    icon: SettingsIcon,
    element: <SettingsPage />
  },
  {
    label: 'Tools',
    path: '/tools',
    icon: ToolCase,
    element: <ToolsPage />
  },
  {
    label: 'Task Manager DI',
    path: '/tools/task-manager-di',
    icon: ToolCase,
    hideInMenu: true,
    element: <TaskManagerDI />
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
