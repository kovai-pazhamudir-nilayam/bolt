// All known tab-level feature keys across the app.
// Add an entry here whenever a new tab with a featureKey is added to any page.
export const KNOWN_TAB_CONFIGS = [
  { feature_key: 'github-repositories', feature_name: 'GitHub Settings › Repositories', feature_type: 'tab', description: 'View and manage GitHub repositories' },
  { feature_key: 'github-users', feature_name: 'GitHub Settings › Users', feature_type: 'tab', description: 'Manage GitHub users per company' },
  { feature_key: 'github-configs', feature_name: 'GitHub Settings › Configs', feature_type: 'tab', description: 'GitHub token and API configurations' },
  { feature_key: 'github-add-repo', feature_name: 'GitHub Settings › Add Repo', feature_type: 'tab', description: 'Add a new GitHub repository' },
  { feature_key: 'github-add-secret', feature_name: 'GitHub Settings › Add Secret', feature_type: 'tab', description: 'Add a GitHub repository secret' },
  { feature_key: 'settings-companies', feature_name: 'Settings › Companies', feature_type: 'tab', description: 'Manage company profiles and codes' },
  { feature_key: 'settings-environments', feature_name: 'Settings › Environments', feature_type: 'tab', description: 'Manage deployment environments (dev, staging, prod)' },
  { feature_key: 'settings-core-configs', feature_name: 'Settings › Core Configs', feature_type: 'tab', description: 'Core token and service configurations' },
  { feature_key: 'settings-gcp-project-configs', feature_name: 'Settings › GCP Project Configs', feature_type: 'tab', description: 'GCP project and cluster configurations' },
  { feature_key: 'settings-media-configs', feature_name: 'Settings › Media Config', feature_type: 'tab', description: 'Media storage and processing configuration' },
  { feature_key: 'settings-db-secrets', feature_name: 'Settings › DB Secrets', feature_type: 'tab', description: 'Database credentials per company and environment' }
]

export const ACCESS_OPTIONS = [
  { value: 'write', label: 'Write', color: 'green' },
  { value: 'read', label: 'Read', color: 'blue' },
  { value: 'hidden', label: 'Hidden', color: 'red' }
]

export const accessColor = (v) => ACCESS_OPTIONS.find((o) => o.value === v)?.color || 'default'

export const mockClaudeResponse = (prompt) => {
  const p = prompt.toLowerCase()
  if (p.includes('hide') || p.includes('disable')) {
    return 'Set the feature access to Hidden — it will disappear from the sidebar immediately.'
  }
  if (p.includes('read')) {
    return 'Read access means the page is visible in the sidebar but the app can check isFeatureReadOnly() to restrict edit actions.'
  }
  if (p.includes('write')) {
    return 'Write access is the default — the feature is fully accessible with no restrictions.'
  }
  if (p.includes('reset') || p.includes('default')) {
    return 'To reset all features, set each one back to Write access. Hidden features will reappear in the sidebar once changed.'
  }
  return 'I can help you configure feature access. Set each feature to Write (full access), Read (visible, restricted), or Hidden (removed from sidebar).'
}
