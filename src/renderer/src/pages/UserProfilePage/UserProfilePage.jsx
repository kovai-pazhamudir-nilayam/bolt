import CustomTabs from '../../components/CustomTabs/CustomTabs'
import { User, Key, Settings } from 'lucide-react'
import PageHeader from '../../components/PageHeader/PageHeader'
import PersonalInfoTab from './_tabs/PersonalInfoTab'
import UserIdTab from './_tabs/UserIdTab'
import FeaturesTab from './_tabs/FeaturesTab'

const UserProfilePage = () => {
  const tabItems = [
    {
      key: 'personal-info',
      label: (
        <span>
          <User size={16} style={{ marginRight: 8 }} />
          Personal Info
        </span>
      ),
      children: <PersonalInfoTab />
    },
    {
      key: 'user-id',
      label: (
        <span>
          <Key size={16} style={{ marginRight: 8 }} />
          User ID
        </span>
      ),
      children: <UserIdTab />
    },
    {
      key: 'features',
      label: (
        <span>
          <Settings size={16} style={{ marginRight: 8 }} />
          Features
        </span>
      ),
      children: <FeaturesTab />
    }
  ]

  return (
    <div>
      <PageHeader
        title="User Profile"
        description="Manage user profile information, company/environment specific settings, and feature permissions."
      />

      <CustomTabs items={tabItems} size="large" />
    </div>
  )
}

export default UserProfilePage
