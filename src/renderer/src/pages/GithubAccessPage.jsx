import PageHeader from '../components/PageHeader/PageHeader'
import { useNotification } from '../context/notificationContext'

const GITHUB_REPO_ACCESS_LEVELS = [
  {
    label: 'WRITE',
    value: 'push'
  },
  {
    label: 'READ',
    value: 'pull'
  },
  {
    label: 'ADMIN',
    value: 'Admin'
  }
]

const GithubAccessPage = () => {
  const notificationApi = useNotification()

  return (
    <div>
      <PageHeader title="GitHub Access" description="Grant users access to company repos." />
      hello
    </div>
  )
}

export default GithubAccessPage
