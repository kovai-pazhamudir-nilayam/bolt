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
import Base64Page from './pages/Base64Page/Base64Page'
import ConnectPostgresPage from './pages/ConnectPostgresPage/ConnectPostgresPage'
import ConnectRedisPage from './pages/ConnectRedisPage/ConnectRedisPage'
import DBBackpupPage from './pages/DBBackpupPage/DBBackpupPage'
import FeatureConfigPage from './pages/FeatureConfigPage/FeatureConfigPage'
import GithubSettingsPage from './pages/GithubSettingsPage/GithubSettingsPage'
import JWTDecoderPage from './pages/JWTDecoderPage/JWTDecoderPage'
import JumpboxTransferPage from './pages/JumpboxTransferPage/JumpboxTransferPage'
import MediaProcessPage from './pages/MediaProcessPage/MediaProcessPage'
import NotesPage from './pages/NotesPage/NotesPage'
import OsTicketPage from './pages/OsTicketPage/OsTicketPage'
import PasswordManagerPage from './pages/PasswordManagerPage/PasswordManagerPage'
import SavedDBQueryPage from './pages/SavedDBQueryPage/SavedDBQueryPage'
import SettingsPage from './pages/SettingsPage/SettingsPage'
import TaskListPage from './pages/TaskListPage/TaskListPage'
import TaskManagerConfigPage from './pages/TaskManagerConfigPage/TaskManagerConfigPage'
import TimeConverterPage from './pages/TimeConverterPage/TimeConverterPage'
import DBDumpPage from './pages/DBDumpPage/DBDumpPage'
import JsonFormatterPage from './pages/JsonFormatterPage/JsonFormatterPage'
import ToolsPage from './pages/ToolsPage/ToolsPage'
import UserProfilePage from './pages/UserProfilePage/UserProfilePage'
import WelcomePage from './pages/WelcomePage/WelcomePage'

export const ROUTES = [
  {
    label: 'Tools',
    path: '/tools',
    icon: ToolCase,
    hideInMenu: false,
    element: <ToolsPage />
  },
  {
    label: 'Base64 Tool',
    path: '/tools/base64',
    icon: ToolCase,
    hideInMenu: true,
    element: <Base64Page />
  },
  {
    label: 'JWT Decoder',
    path: '/tools/jwt-decoder',
    icon: ToolCase,
    hideInMenu: true,
    element: <JWTDecoderPage />
  },
  {
    label: 'Time Converter',
    path: '/tools/time-converter',
    icon: ToolCase,
    hideInMenu: true,
    element: <TimeConverterPage />
  },
  {
    label: 'JSON Formatter',
    path: '/tools/json-formatter',
    icon: ToolCase,
    hideInMenu: true,
    element: <JsonFormatterPage />
  },
  {
    label: 'Welcome',
    path: '/',
    icon: ToolCase,
    hideInMenu: true,
    element: <WelcomePage />
  },
  {
    label: 'Jumpbox Transfer',
    path: '/tools/jumpbox-transfer',
    icon: ToolCase,
    hideInMenu: true,
    element: <JumpboxTransferPage />
  },
  {
    label: 'DB Dump',
    path: '/tools/db-dump',
    icon: ToolCase,
    hideInMenu: true,
    element: <DBDumpPage />
  },
  {
    label: 'Task Manager Config',
    path: '/tools/task-manager-config',
    icon: ToolCase,
    hideInMenu: true,
    element: <TaskManagerConfigPage />
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
    hideInMenu: false,
    element: <ConnectRedisPage />
  },
  {
    label: 'Postgres',
    path: '/connect-postgres',
    icon: Database,
    element: <ConnectPostgresPage />
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
