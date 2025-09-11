/**  API implementation  */
const githubConfigsAPI = {
  getGithubConfig: () => {},
  addGithubConfig: () => {},
  deleteGithubConfig: () => {}
}

/**  Local DB implementation  */
const githubConfigsDB = {
  getGitHubConfig: () => {
    return window.dbApi.githubConfigs.getAll()
  },
  addGithubConfig: (input) => {
    return window.dbApi.githubConfigs.add(input)
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
