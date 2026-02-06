import {
  BookOpen,
  Database,
  DatabaseZap,
  Github,
  HardDrive,
  ImageUp,
  Key,
  ListCheck,
  Settings as SettingsIcon,
  Shield,
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
import PasswordManagerPage from './pages/PasswordManagerPage/PasswordManagerPage'
import UserProfilePage from './pages/UserProfilePage/UserProfilePage'
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
import NotesPage from './pages/NotesPage/NotesPage'
import FeatureConfigPage from './pages/FeatureConfigPage/FeatureConfigPage'

export const ROUTES = [
  {
    label: 'Tools',
    path: '/tools',
    icon: ToolCase,
    hideInMenu: true,
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
    hideInMenu: true,
    element: <ConnectRedisPage />
  },
  {
    label: 'Notes',
    path: '/Notes',
    icon: BookOpen,
    hideInMenu: false,
    element: <NotesPage />
  },
  {
    label: 'Tasks',
    path: '/task-list',
    hideInMenu: true,
    icon: ListCheck,
    element: <TaskListPage />
  },
  {
    label: 'DB Backup',
    path: '/db-backup',
    icon: Database,
    element: <DBBackpupPage />
  },
  {
    label: 'Password Manager',
    path: '/password-manager',
    icon: Key,
    element: <PasswordManagerPage />
  },
  {
    label: 'User Profile',
    path: '/user-profile',
    icon: User,
    element: <UserProfilePage />
  },
  {
    label: 'Shell Command ',
    path: '/shell-command',
    icon: User,
    hideInMenu: true,
    element: <ShellCommandPage />
  },
  {
    label: 'osTicket',
    path: '/os-ticket',
    icon: Ticket,
    element: <OsTicketPage />
  },
  {
    label: 'Feature Config',
    path: '/feature-config',
    icon: Shield,
    element: <FeatureConfigPage />
  },
  {
    label: 'Settings',
    path: '/settings',
    icon: SettingsIcon,
    element: <SettingsPage />
  }
]
