const githubConfigsAPI = {
  getGithubConfig: () => {},
  addGithubConfig: () => {},
  updateGithubConfig: () => {},
  deleteGithubConfig: () => {}
}

const githubConfigsDB = {
  getGitHubConfig: () => {
    return window.dbApi.githubConfigs.getAll()
  },
  addGithubConfig: (input) => {
    return window.dbApi.githubConfigs.add(input)
  },
  updateGithubConfig: () => {
    return window.dbApi.githubConfigs.update()
  },
  deleteGithubConfig: () => {
    return window.dbApi.githubConfigs.delete()
  }
}

const githubConfigsFactory = () => {
  const mode = window.runtimeConfig?.mode || 'local'
  if (mode === 'api') {
    return { githubConfigsRepo: githubConfigsAPI }
  }
  return { githubConfigsRepo: githubConfigsDB }
}

export { githubConfigsFactory }
