/**
 * GitHub Repos IPC handlers
 */

export const registerGithubReposHandlers = (ipcMain, configDb) => {
  ipcMain.handle('/get/github-repos', async () => {
    try {
      return await configDb
        .knex('github_repos as gr')
        .select('gr.*', 'c.code as company_code', 'c.name as company_name')
        .join('companies as c', 'gr.company_id', 'c.id')
        .orderBy(['c.name', { column: 'gr.name', order: 'asc' }])
    } catch (error) {
      console.error('Error getting GitHub repos:', error)
      return []
    }
  })

  ipcMain.handle('/add/github-repos', async (event, companyId, name) => {
    try {
      return await configDb.knex('github_repos').insert({ company_id: companyId, name })
    } catch (error) {
      console.error('Error adding GitHub repo:', error)
      throw error
    }
  })

  ipcMain.handle('/delete/github-repos', async (event, id) => {
    try {
      return await configDb.knex('github_repos').where({ id }).del()
    } catch (error) {
      console.error('Error deleting GitHub repo:', error)
      throw error
    }
  })

  ipcMain.handle('/sync/github-repos', async (event, companyId) => {
    try {
      const cfg = await configDb
        .knex('github_configs')
        .select('github_token', 'owner')
        .where({ company_id: companyId })
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
            await trx('github_repos')
              .insert({ company_id: companyId, name: repo.name })
              .onConflict(['company_id', 'name'])
              .ignore()
          }
        }
      })

      return { inserted: true, count: repos.length }
    } catch (error) {
      console.error('Error syncing GitHub repos:', error)
      throw error
    }
  })
}
