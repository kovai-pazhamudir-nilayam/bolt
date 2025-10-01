import CustomTabs from '../../components/CustomTabs/CustomTabs'
import { Building2, Cloud, Database } from 'lucide-react'
// import CompaniesSettings from './SettingsPageTabs/CompaniesSettings'
// import CoreTokenConfigsSettings from './_blocks/CoreTokenConfigsSettings'
// import GcpProjectConfigsSettings from './_blocks/GcpProjectConfigsSettings'
import PageHeader from './../../components/PageHeader/PageHeader'
import EnvironmentsSettingsTab from './_tabs/EnvironmentsSettingsTab'
import CompanySettingsTab from './_tabs/CompanySettingsTab'
import CoreConfigsSettingsPageTab from './_tabs/CoreConfigsSettingsPageTab'
import GcpProjectConfigsSettingsTab from './_tabs/GcpProjectConfigsSettingsTab'

const SettingsPage = () => {
  const tabItems = [
    {
      key: 'companies',
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
      label: (
        <span>
          <Cloud size={16} style={{ marginRight: 8 }} />
          GCP Project Configs
        </span>
      ),
      children: <GcpProjectConfigsSettingsTab />
    }
  ]

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
