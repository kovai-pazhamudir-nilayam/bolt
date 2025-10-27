import CustomTabs from '../../components/CustomTabs/CustomTabs'
import { Building2, Cloud, Database, Image } from 'lucide-react'
// import CompaniesSettings from './SettingsPageTabs/CompaniesSettings'
// import CoreTokenConfigsSettings from './_blocks/CoreTokenConfigsSettings'
// import GcpProjectConfigsSettings from './_blocks/GcpProjectConfigsSettings'
import PageHeader from './../../components/PageHeader/PageHeader'
import EnvironmentsSettingsTab from './_tabs/EnvironmentsSettingsTab'
import CompanySettingsTab from './_tabs/CompanySettingsTab'
import CoreConfigsSettingsPageTab from './_tabs/CoreConfigsSettingsPageTab'
import GcpProjectConfigsSettingsTab from './_tabs/GcpProjectConfigsSettingsTab'
import MediaConfigSettingsTab from './_tabs/MediaConfigSettingsTab'
import { useFeatureConfig } from '../../context/featureConfigContext'

const SettingsPage = () => {
  const { isFeatureHidden } = useFeatureConfig()

  const allTabItems = [
    {
      key: 'companies',
      featureKey: 'settings-companies',
      label: (
        <span>
          <Building2 size={16} style={{ marginRight: 8 }} />
          Companies
        </span>
      ),
      children: <CompanySettingsTab />
    },
    {
      key: 'environments',
      featureKey: 'settings-environments',
      label: (
        <span>
          <Database size={16} style={{ marginRight: 8 }} />
          Environments
        </span>
      ),
      children: <EnvironmentsSettingsTab />
    },
    {
      key: 'core-configs',
      featureKey: 'settings-core-configs',
      label: (
        <span>
          <Database size={16} style={{ marginRight: 8 }} />
          Core Configs
        </span>
      ),
      children: <CoreConfigsSettingsPageTab />
    },
    {
      key: 'gcp-project-configs',
      featureKey: 'settings-gcp-project-configs',
      label: (
        <span>
          <Cloud size={16} style={{ marginRight: 8 }} />
          GCP Project Configs
        </span>
      ),
      children: <GcpProjectConfigsSettingsTab />
    },
    {
      key: 'media-configs',
      featureKey: 'settings-media-configs',
      label: (
        <span>
          <Image size={16} style={{ marginRight: 8 }} />
          Media Config
        </span>
      ),
      children: <MediaConfigSettingsTab />
    }
  ]

  // Filter out hidden tabs
  const tabItems = allTabItems.filter(tab => !isFeatureHidden(tab.featureKey))

  return (
    <div>
      <PageHeader
        title="Settings"
        description="Manage all database entities including companies, environments, users, and configurations."
      />

      <CustomTabs items={tabItems} size="large" />
    </div>
  )
}

export default SettingsPage
