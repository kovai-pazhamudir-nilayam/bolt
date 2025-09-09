import { Tabs } from 'antd'
import { Database, GitBranch, User } from 'lucide-react'
import PageHeader from './../../components/PageHeader/PageHeader'
import GithubUsersSettings from './GithubSettingsPageTabs/GithubUsersSettings'
import GitHubConfigsSettings from './GithubSettingsPageTabs/GitHubConfigsSettings'
import GithubReposSettings from './GithubSettingsPageTabs/GithubReposSettings'

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
      children: <GitHubConfigsSettings />
    },
    {
      key: 'github-users',
      label: (
        <span>
          <User size={16} style={{ marginRight: 8 }} />
          GitHub Users
        </span>
      ),
      children: <GithubUsersSettings />
    },
    {
      key: 'github-repos',
      label: (
        <span>
          <GitBranch size={16} style={{ marginRight: 8 }} />
          GitHub Repos
        </span>
      ),
      children: <GithubReposSettings />
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
