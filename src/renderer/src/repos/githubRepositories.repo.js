/**  API implementation  */
const githubRepositoriesAPI = {
  getGithubRepository: () => {},
  addGithubRepository: () => {},
  deleteGithubRepository: () => {}
}

/**  Local DB implementation  */
const githubRepositoriesDB = {
  getGitHubRepository: () => {
    return window.dbApi.githubRepositories.getAll()
  },
  addGithubRepository: (input) => {
    return window.dbApi.githubRepositories.add(input)
  },
  deleteGithubRepository: () => {
    return window.dbApi.githubRepositories.delete()
  }
}

const githubRepositoriesFactory = () => {
  const mode = window.runtimeConfig?.mode || 'local'
  if (mode === 'api') {
    return { githubRepositoriesRepo: githubRepositoriesAPI }
  }
  return { githubRepositoriesRepo: githubRepositoriesDB }
}

export { githubRepositoriesFactory }
