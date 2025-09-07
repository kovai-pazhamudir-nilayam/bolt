/**
 * GitHub Repo Access IPC handlers
 */

export const registerGithubRepoAccessHandlers = (ipcMain, configDb) => {
  ipcMain.handle('/get/github-repo-access', async () => {
    try {
      return await configDb
        .knex('github_repo_access as gra')
        .select(
          'gra.*',
          'c.name as company_name',
          'gr.name as repo_name',
          'u.name as user_name',
          'u.github_handle'
        )
        .join('companies as c', 'gra.company_id', 'c.id')
        .join('github_repos as gr', 'gra.repo_id', 'gr.id')
        .join('users as u', 'gra.user_id', 'u.id')
        .orderBy(['c.name', 'gr.name', 'u.name'])
    } catch (error) {
      console.error('Error getting repo access:', error)
      return []
    }
  })

  ipcMain.handle(
    '/add/github-repo-access',
    async (event, companyId, repoId, userId, accessLevel) => {
      try {
        const cfg = await configDb
          .knex('github_configs')
          .select('github_token', 'owner')
          .where({ company_id: companyId })
          .first()

        const headers = {
          Accept: 'application/vnd.github+json',
          Authorization: `Bearer ${cfg.github_token}`,
          'User-Agent': 'bolt-app'
        }

        async function addCollaborator(url) {
          const res = await fetch(url, {
            method: 'PUT',
            headers,
            body: JSON.stringify({
              permission: accessLevel
            })
          })
          if (res.status === 404) return null
          if (!res.ok) throw new Error(`GitHub API error: ${res.status}`)
          return await res.json()
        }

        const response = await addCollaborator(
          `https://api.github.com/repos/${cfg.owner}/${repoId}/collaborators`
        )
        console.log(response, '-------')

        // handle if response is not valid

        return await configDb
          .knex('github_repo_access')
          .insert({
            company_id: companyId,
            repo_id: repoId,
            user_id: userId,
            access_level: accessLevel
          })
          .onConflict(['company_id', 'repo_id', 'user_id'])
          .ignore()
      } catch (error) {
        console.error('Error adding repo access:', error)
        throw error
      }
    }
  )

  ipcMain.handle('/delete/github-repo-access', async (event, id) => {
    try {
      return await configDb.knex('github_repo_access').where({ id }).del()
    } catch (error) {
      console.error('Error deleting repo access:', error)
      throw error
    }
  })
}
