import { Tabs } from 'antd'
import { Building2, Cloud, Database } from 'lucide-react'
import CompaniesSettings from './_blocks/CompaniesSettings'
import CoreTokenConfigsSettings from './_blocks/CoreTokenConfigsSettings'
import EnvironmentsSettings from './_blocks/EnvironmentsSettings'
import GcpProjectConfigsSettings from './_blocks/GcpProjectConfigsSettings'
import PageHeader from './../../components/PageHeader/PageHeader'

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
      children: <CompaniesSettings />
    },
    {
      key: 'environments',
      label: (
        <span>
          <Database size={16} style={{ marginRight: 8 }} />
          Environments
        </span>
      ),
      children: <EnvironmentsSettings />
    },
    {
      key: 'core-token-configs',
      label: (
        <span>
          <Database size={16} style={{ marginRight: 8 }} />
          Core Token Configs
        </span>
      ),
      children: <CoreTokenConfigsSettings />
    },
    {
      key: 'gcp-project-configs',
      label: (
        <span>
          <Cloud size={16} style={{ marginRight: 8 }} />
          GCP Project Configs
        </span>
      ),
      children: <GcpProjectConfigsSettings />
    }
  ]

  return (
    <div>
      <PageHeader
        title="Settings Management"
        description="Manage all database entities including companies, environments, users, and configurations."
      />

      <Tabs items={tabItems} size="large" />
    </div>
  )
}

export default SettingsPage
