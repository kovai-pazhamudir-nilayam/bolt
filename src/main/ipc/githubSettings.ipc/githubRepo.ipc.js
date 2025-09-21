export const registerGithubRepoHandler = (ipcMain, configDb) => {
  async function getGithubRepo() {
    return configDb.knex('github_repo').select('*')
  }

  async function upsertGithubRepo(event, input) {
    const { company_code, repo_name } = input

    return configDb
      .knex('github_repo')
      .insert({
        company_code,
        repo_name,
        updated_at: configDb.knex.fn.now()
      })
      .onConflict(['company_code', 'repo_name'])
      .merge({
        company_code,
        repo_name,
        updated_at: configDb.knex.fn.now()
      })
  }

  async function deleteGithubRepo(event, github_repo) {
    return configDb.knex('github_repo').where({ github_repo }).del()
  }
  async function syncGithubRepo(event, company_code) {
    try {
      const cfg = await configDb
        .knex('github_config')
        .select('github_token', 'owner')
        .where({ company_code: company_code })
        .first()

      if (!cfg) {
        throw new Error('GitHub config not found for selected company')
      }

      const headers = {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${cfg.github_token}`,
        'User-Agent': 'bolt-app'
      }

      async function fetchAll(url) {
        const res = await fetch(url, { headers })
        if (res.status === 404) return null
        if (!res.ok) throw new Error(`GitHub API error: ${res.status}`)
        return await res.json()
      }

      let repos = await fetchAll(`https://api.github.com/orgs/${cfg.owner}/repos?per_page=100`)
      if (repos === null) {
        repos = await fetchAll(`https://api.github.com/users/${cfg.owner}/repos?per_page=100`)
      }

      if (!Array.isArray(repos)) {
        throw new Error('Unexpected GitHub API response')
      }

      await configDb.knex.transaction(async (trx) => {
        for (const repo of repos) {
          if (repo && repo.name) {
            await trx('github_repo')
              .insert({ company_code, repo_name: repo.name })
              .onConflict(['company_code', 'repo_name'])
              .ignore()
          }
        }
      })

      return { inserted: true, count: repos.length }
    } catch (error) {
      console.error('Error syncing GitHub repos:', error)
      throw error
    }
  }

  ipcMain.handle('githubRepo:getAll', getGithubRepo)
  ipcMain.handle('githubRepo:upsert', upsertGithubRepo)
  ipcMain.handle('githubRepo:delete', deleteGithubRepo)
  ipcMain.handle('githubRepo:sync', syncGithubRepo)
}
