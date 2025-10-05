import {
  BookOpen,
  Database,
  DatabaseZap,
  Github,
  HardDrive,
  ImageUp,
  ListCheck,
  Settings as SettingsIcon,
  Ticket,
  ToolCase,
  User
} from 'lucide-react'
import APIBuilderPage from './pages/APIBuilderPage/APIBuilderPage'
import ConnectRedisPage from './pages/ConnectRedisPage/ConnectRedisPage'
import DBBackpupPage from './pages/DBBackpupPage/DBBackpupPage'
import FetchLocalLogsPage from './pages/FetchLocalLogsPage/FetchLocalLogsPage'
import GithubSettingsPage from './pages/GithubSettingsPage/GithubSettingsPage'
import MediaProcessPage from './pages/MediaProcessPage/MediaProcessPage'
import OsTicketPage from './pages/OsTicketPage/OsTicketPage'
import PageBuilderPage from './pages/PageBuilderPage/PageBuilderPage'
import ProfilePage from './pages/ProfilePage/ProfilePage'
import ProxyConfiguratorPage from './pages/ProxyConfiguratorPage/ProxyConfiguratorPage'
import PushLogsToGCPPage from './pages/PushLogsToGCPPage/PushLogsToGCPPage'
import SavedDBQueryPage from './pages/SavedDBQueryPage/SavedDBQueryPage'
import SettingsPage from './pages/SettingsPage/SettingsPage'
import TableBuilderPage from './pages/TableBuilderPage/TableBuilderPage'
import TaskListPage from './pages/TaskListPage/TaskListPage'
import TaskManagerConfigPage from './pages/TaskManagerConfigPage/TaskManagerConfigPage'
import TaskManagerDIPage from './pages/TaskManagerDIPage/TaskManagerDIPage'
import ToolsPage from './pages/ToolsPage/ToolsPage'
import WelcomePage from './pages/WelcomePage/WelcomePage'
import ShellCommandPage from './pages/ShellCommandPage/ShellCommandPage'

export const ROUTES = [
  {
    label: 'Tools',
    path: '/tools',
    icon: ToolCase,
    element: <ToolsPage />
  },
  {
    label: 'Welcome',
    path: '/',
    icon: ToolCase,
    hideInMenu: true,
    element: <WelcomePage />
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
    path: '/tools/proxy-configurator',
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
    label: 'DB Query',
    path: '/db-Query',
    icon: DatabaseZap,
    element: <SavedDBQueryPage />
  },
  {
    label: 'Media Process',
    path: '/media-process',
    icon: ImageUp,
    element: <MediaProcessPage />
  },
  {
    label: 'Redis',
    path: '/connect-redis',
    icon: HardDrive,
    element: <ConnectRedisPage />
  },
  {
    label: 'Documentation',
    path: '/documentation',
    icon: BookOpen,
    element: <SavedDBQueryPage />
  },
  {
    label: 'Tasks',
    path: '/task-list',
    icon: ListCheck,
    element: <TaskListPage />
  },
  {
    label: 'Settings',
    path: '/settings',
    icon: SettingsIcon,
    element: <SettingsPage />
  },
  {
    label: 'DB Backup',
    path: '/db-backup',
    icon: Database,
    element: <DBBackpupPage />
  },
  {
    label: 'Profile',
    path: '/profile',
    icon: User,
    element: <ProfilePage />
  },
  {
    label: 'Shell Command ',
    path: '/shell-command',
    icon: User,
    element: <ShellCommandPage />
  },
  {
    label: 'osTicket',
    path: '/os-ticket',
    icon: Ticket,
    element: <OsTicketPage />
  }
]
