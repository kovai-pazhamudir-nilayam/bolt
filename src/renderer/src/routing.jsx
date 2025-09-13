import { Github, Settings as SettingsIcon, ToolCase } from 'lucide-react'
import APIBuilderPage from './pages/APIBuilderPage/APIBuilderPage'
import FetchLocalLogsPage from './pages/FetchLocalLogsPage/FetchLocalLogsPage'
import GithubSettingsPage from './pages/GithubSettingsPage/GithubSettingsPage'
import PageBuilderPage from './pages/PageBuilderPage/PageBuilderPage'
import ProxyConfiguratorPage from './pages/ProxyConfiguratorPage/ProxyConfiguratorPage'
import PushLogsToGCPPage from './pages/PushLogsToGCPPage/PushLogsToGCPPage'
import SettingsPage from './pages/SettingsPage/SettingsPage'
import TableBuilderPage from './pages/TableBuilderPage/TableBuilderPage'
import TaskManagerConfigPage from './pages/TaskManagerConfigPage/TaskManagerConfigPage'
import TaskManagerDIPage from './pages/TaskManagerDIPage/TaskManagerDIPage'
import ToolsPage from './pages/ToolsPage/ToolsPage'

export const ROUTES = [
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
    element: <TaskManagerDIPage />
  },
  {
    label: 'Page Builder',
    path: '/tools/page-builder',
    icon: ToolCase,
    hideInMenu: true,
    element: <PageBuilderPage />
  },
  {
    label: 'UI Builder',
    path: '/tools/ui-builder',
    icon: ToolCase,
    hideInMenu: true,
    element: <PageBuilderPage />
  },
  {
    label: 'Table Builder',
    path: '/tools/table-builder',
    icon: ToolCase,
    hideInMenu: true,
    element: <TableBuilderPage />
  },
  {
    label: 'Proxy Configurator',
    path: '/tools/table-builder',
    icon: ToolCase,
    hideInMenu: true,
    element: <ProxyConfiguratorPage />
  },
  {
    label: 'Task Manager Config',
    path: '/tools/task-manager-config',
    icon: ToolCase,
    hideInMenu: true,
    element: <TaskManagerConfigPage />
  },
  {
    label: 'API Builder',
    path: '/tools/api-builder',
    icon: ToolCase,
    hideInMenu: true,
    element: <APIBuilderPage />
  },
  {
    label: 'Push Logs to GCP',
    path: '/tools/logs-push',
    icon: ToolCase,
    hideInMenu: true,
    element: <PushLogsToGCPPage />
  },
  {
    label: 'Fetch Local Logs',
    path: '/tools/logs-fetch',
    icon: ToolCase,
    hideInMenu: true,
    element: <FetchLocalLogsPage />
  },
  {
    label: 'GitHub Settings',
    path: '/github-settings',
    icon: Github,
    element: <GithubSettingsPage />
  },
  {
    label: 'Settings',
    path: '/settings',
    icon: SettingsIcon,
    element: <SettingsPage />
  }
]
