import CustomTabs from '../../components/CustomTabs/CustomTabs'
import { BookKeyIcon, Database, GitBranch, TicketPlusIcon, User } from 'lucide-react'
import PageHeader from './../../components/PageHeader/PageHeader'
import { useFeatureConfig } from '../../context/featureConfigContext'
import AddGithubRepoSecretTab from './_tabs/AddGithubRepoSecretTab'
import AddGithubRepoTab from './_tabs/AddGithubRepoTab'
import GitHubConfigsTab from './_tabs/GitHubConfigsTab'
import GithubRepositoriesTab from './_tabs/GithubRepositoriesTab'
import GithubUsersTab from './_tabs/GithubUsersTab'

const GithubSettingsPage = () => {
  const { isFeatureHidden } = useFeatureConfig()

  const allTabItems = [
    {
      key: 'github-Repositories',
      featureKey: 'github-repositories',
      label: (
        <span>
          <GitBranch size={16} style={{ marginRight: 8 }} />
          GitHub Repositories
        </span>
      ),
      children: <GithubRepositoriesTab />
    },
    {
      key: 'github-users',
      featureKey: 'github-users',
      label: (
        <span>
          <User size={16} style={{ marginRight: 8 }} />
          GitHub Users
        </span>
      ),
      children: <GithubUsersTab />
    },
    {
      key: 'github-configs',
      featureKey: 'github-configs',
      label: (
        <span>
          <Database size={16} style={{ marginRight: 8 }} />
          GitHub Configs
        </span>
      ),
      children: <GitHubConfigsTab />
    },
    {
      key: 'add-github-repo',
      featureKey: 'github-add-repo',
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
      featureKey: 'github-add-secret',
      label: (
        <span>
          <BookKeyIcon size={16} style={{ marginRight: 8 }} />
          Add GitHub Secret
        </span>
      ),
      children: <AddGithubRepoSecretTab />
    }
  ]

  const tabItems = allTabItems.filter((tab) => !isFeatureHidden(tab.featureKey))

  return (
    <div>
      <PageHeader
        title="GitHub Settings"
        description="Manage GitHub configs, users, and repositories per company."
      />

      <CustomTabs items={tabItems} size="large" />
    </div>
  )
}

export default GithubSettingsPage
