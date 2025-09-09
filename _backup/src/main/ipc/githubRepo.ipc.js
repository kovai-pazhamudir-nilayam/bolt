/**
 * GitHub Repos IPC Handler
 */

export const registerGithubRepoHandler = (ipcMain, configDb) => {
  ipcMain.handle('/get/github-repo', async () => {
    try {
      return await configDb
        .knex('github_repo as gr')
        .select('gr.*', 'c.code as company_code', 'c.name as company_name')
        .join('company as c', 'gr.company_id', 'c.id')
        .orderBy(['c.name', { column: 'gr.name', order: 'asc' }])
    } catch (error) {
      console.error('Error getting GitHub repos:', error)
      return []
    }
  })

  ipcMain.handle('/add/github-repo', async (event, companyId, name) => {
    try {
      return await configDb.knex('github_repo').insert({ company_id: companyId, name })
    } catch (error) {
      console.error('Error adding GitHub repo:', error)
      throw error
    }
  })

  ipcMain.handle('/delete/github-repo', async (event, id) => {
    try {
      return await configDb.knex('github_repo').where({ id }).del()
    } catch (error) {
      console.error('Error deleting GitHub repo:', error)
      throw error
    }
  })

  ipcMain.handle('/sync/github-repo', async (event, companyId) => {
    try {
      const cfg = await configDb
        .knex('github_config')
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
            await trx('github_repo')
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
