import {
  BookOpen,
  Database,
  DatabaseZap,
  Github,
  HardDrive,
  ImageUp,
  Key,
  ListCheck,
  Play,
  Settings as SettingsIcon,
  Shield,
  Ticket,
  ToolCase,
  User,
  Workflow
} from 'lucide-react'
import Base64Page from './pages/Base64Page/Base64Page'
import ConnectPostgresPage from './pages/ConnectPostgresPage/ConnectPostgresPage'
import ConnectRedisPage from './pages/ConnectRedisPage/ConnectRedisPage'
import DBBackupPage from './pages/DBBackupPage/DBBackupPage'
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
import TimeConverterPage from './pages/TimeConverterPage/TimeConverterPage'
import DBDumpPage from './pages/DBDumpPage/DBDumpPage'
import ApiCollectionPage from './pages/ApiCollectionPage/ApiCollectionPage'
import JsonFormatterPage from './pages/JsonFormatterPage/JsonFormatterPage'
import ToolsPage from './pages/ToolsPage/ToolsPage'
import UserProfilePage from './pages/UserProfilePage/UserProfilePage'
import WelcomePage from './pages/WelcomePage/WelcomePage'
import WorkflowPage from './pages/WorkflowPage/WorkflowPage'

export const ROUTES = [
  {
    label: 'Tools',
    path: '/tools',
    icon: ToolCase,
    hideInMenu: false,
    description: 'Utility tools: Base64, JWT, JSON formatter, time converter and more',
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
    label: 'API Collection',
    path: '/api-collection',
    icon: Play,
    description: 'Save and run HTTP API requests with environment support',
    element: <ApiCollectionPage />
  },
  {
    label: 'GitHub Settings',
    path: '/github-settings',
    icon: Github,
    description: 'Manage GitHub tokens and repository settings',
    element: <GithubSettingsPage />
  },
  {
    label: 'Saved DB Query',
    path: '/saved-db-query',
    icon: DatabaseZap,
    description: 'Save and run database queries via jumpbox',
    element: <SavedDBQueryPage />
  },
  {
    label: 'Media Process',
    path: '/media-process',
    icon: ImageUp,
    description: 'Process and convert media files',
    element: <MediaProcessPage />
  },
  {
    label: 'Redis',
    path: '/connect-redis',
    icon: HardDrive,
    hideInMenu: false,
    description: 'Connect to and query Redis instances',
    element: <ConnectRedisPage />
  },
  {
    label: 'Postgres',
    path: '/connect-postgres',
    icon: Database,
    description: 'Connect to and query Postgres databases',
    element: <ConnectPostgresPage />
  },
  {
    label: 'Notes',
    path: '/Notes',
    icon: BookOpen,
    hideInMenu: false,
    description: 'Rich-text notes and documentation',
    element: <NotesPage />
  },
  {
    label: 'Tasks',
    path: '/task-list',
    hideInMenu: false,
    icon: ListCheck,
    description: 'Task tracking and kanban board',
    element: <TaskListPage />
  },
  {
    label: 'DB Backup',
    path: '/db-backup',
    icon: Database,
    description: 'Manage and restore database backups',
    element: <DBBackupPage />
  },
  {
    label: 'Password Manager',
    path: '/password-manager',
    icon: Key,
    description: 'Store and manage passwords securely',
    element: <PasswordManagerPage />
  },
  {
    label: 'User Profile',
    path: '/user-profile',
    icon: User,
    description: 'View and edit user profile information',
    element: <UserProfilePage />
  },
  {
    label: 'osTicket',
    path: '/os-ticket',
    icon: Ticket,
    description: 'Manage osTicket support tickets',
    element: <OsTicketPage />
  },
  {
    label: 'Workflow',
    path: '/workflow',
    icon: Workflow,
    description: 'Visual workflow builder and automation',
    element: <WorkflowPage />
  },
  {
    label: 'Feature Config',
    path: '/feature-config',
    icon: Shield,
    requiresAuth: true,
    description: 'Control page and tab visibility across the app',
    element: <FeatureConfigPage />
  },
  {
    label: 'Settings',
    path: '/settings',
    icon: SettingsIcon,
    description: 'App settings: companies, environments, configs and secrets',
    element: <SettingsPage />
  }
]
