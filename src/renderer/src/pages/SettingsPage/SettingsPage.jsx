import CustomTabs from '../../components/CustomTabs'
import MediaSettings from './_blocks/MediaSettings'
import ConfigSettings from './_blocks/ConfigSettings'
import GitHubUserSettings from './_blocks/GitHubUserSettings'

const SettingsPage = () => {
  const settingsTabs = [
    {
      key: 'config',
      label: 'Configuration',
      children: <ConfigSettings />
    },
    {
      key: 'media',
      label: 'Media',
      children: <MediaSettings />
    },
    {
      key: 'github-user',
      label: 'Github User',
      children: <GitHubUserSettings />
    }
  ]
  return <CustomTabs items={settingsTabs} />
}

export default SettingsPage
