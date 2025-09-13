import { Tabs } from 'antd'
import { BookKeyIcon, Database, GitBranch, ShieldPlus, TicketPlusIcon, User } from 'lucide-react'
import PageHeader from './../../components/PageHeader/PageHeader'
import AddGithubRepoSecretTab from './_tabs/AddGithubRepoSecretTab'
import AddGithubRepoTab from './_tabs/AddGithubRepoTab'
import GithubAccessTab from './_tabs/GithubAccessTab'
import GitHubConfigsTab from './_tabs/GitHubConfigsTab'
import GithubRepositoriesTab from './_tabs/GithubRepositoriesTab'
import GithubUsersTab from './_tabs/GithubUsersTab'

const GithubSettingsPage = () => {
  const tabItems = [
    {
      key: 'github-configs',
      label: (
        <span>
          <Database size={16} style={{ marginRight: 8 }} />
          GitHub Configs
        </span>
      ),
      children: <GitHubConfigsTab />
    },
    {
      key: 'github-users',
      label: (
        <span>
          <User size={16} style={{ marginRight: 8 }} />
          GitHub Users
        </span>
      ),
      children: <GithubUsersTab />
    },
    {
      key: 'github-Repositories',
      label: (
        <span>
          <GitBranch size={16} style={{ marginRight: 8 }} />
          GitHub Repositories
        </span>
      ),
      children: <GithubRepositoriesTab />
    },
    {
      key: 'add-github-repo',
      label: (
        <span>
          <TicketPlusIcon size={16} style={{ marginRight: 8 }} />
          Add GitHub Repo
        </span>
      ),
      children: <AddGithubRepoTab />
    },
    {
      key: 'add-github-secret',
      label: (
        <span>
          <BookKeyIcon size={16} style={{ marginRight: 8 }} />
          Add GitHub Secret
        </span>
      ),
      children: <AddGithubRepoSecretTab />
    },
    {
      key: 'add-github-access',
      label: (
        <span>
          <ShieldPlus size={16} style={{ marginRight: 8 }} />
          Repo Access
        </span>
      ),
      children: <GithubAccessTab />
    }
  ]

  return (
    <div>
      <PageHeader
        title="GitHub Settings"
        description="Manage GitHub configs, users, and repositories per company."
      />

      <Tabs items={tabItems} size="large" />
    </div>
  )
}

export default GithubSettingsPage
