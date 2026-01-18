import sodium from 'sodium-native'

// Step 1: Fetch the repository's public key
async function getPublicKey({ repo, owner, github_token }) {
  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/actions/secrets/public-key`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${github_token}`,
        Accept: 'application/vnd.github.v3+json'
      }
    }
  )

  if (!response.ok) {
    throw new Error(`Failed to fetch public key: ${response.statusText}`)
  }

  return response.json()
}

// Step 2: Encrypt the secret using LibSodium
function encryptSecret(publicKey, secretValue) {
  const keyBytes = Buffer.from(publicKey, 'base64')
  const messageBytes = Buffer.from(secretValue)
  const encryptedBytes = Buffer.alloc(messageBytes.length + sodium.crypto_box_SEALBYTES)

  sodium.crypto_box_seal(encryptedBytes, messageBytes, keyBytes)

  return encryptedBytes.toString('base64')
}

// Step 3: Send the encrypted secret to GitHub
async function addSecret({
  publicKey,
  keyId,
  repo,
  owner,
  github_token,
  secret_name,
  secret_value
}) {
  const encryptedValue = encryptSecret(publicKey, secret_value)

  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/actions/secrets/${secret_name}`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${github_token}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        encrypted_value: encryptedValue,
        key_id: keyId
      })
    }
  )

  if (!response.ok) {
    throw new Error(`Error adding secret: ${response.statusText}`)
  }

  console.log(`✅ Secret ${secret_name} added successfully!`)
}

export const registerGithubRepoHandler = (ipcMain, configDb) => {
  async function getGithubRepo() {
    return configDb.knex('github_repo').select('*')
  }

  async function upsertGithubRepo(_event, input) {
    const { company_code, repo_name, repo_url } = input

    return configDb
      .knex('github_repo')
      .insert({
        company_code,
        repo_name,
        repo_url,
        updated_at: configDb.knex.fn.now()
      })
      .onConflict(['company_code', 'repo_name'])
      .merge({
        company_code,
        repo_name,
        repo_url,
        updated_at: configDb.knex.fn.now()
      })
  }

  async function deleteGithubRepo(_event, input) {
    const { company_code, repo_name } = input
    return configDb.knex('github_repo').where({ company_code }).andWhere({ repo_name }).del()
  }

  async function syncGithubRepo(_event, company_code) {
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

      async function fetchAllRepos(url) {
        let page = 1
        let allRepos = []

        while (true) {
          const updatedUrl = `${url}?per_page=100&page=${page}`
          const res = await fetch(updatedUrl, { headers })
          if (!res.ok) throw new Error(`GitHub error ${res.status}`)
          const repos = await res.json()
          if (repos.length === 0) break // no more pages
          allRepos = allRepos.concat(repos)
          page++
        }

        return allRepos
      }

      let repos = await fetchAllRepos(`https://api.github.com/orgs/${cfg.owner}/repos`)
      if (repos === null) {
        repos = await fetchAllRepos(`https://api.github.com/users/${cfg.owner}/repos`)
      }

      if (!Array.isArray(repos)) {
        throw new Error('Unexpected GitHub API response')
      }

      await configDb.knex.transaction(async (trx) => {
        for (const repo of repos) {
          if (repo && repo.name) {
            await trx('github_repo')
              .insert({
                company_code,
                repo_name: repo.name,
                repo_url: repo.html_url,
                updated_at: configDb.knex.fn.now()
              })
              .onConflict(['company_code', 'repo_name'])
              .merge({
                repo_url: repo.html_url,
                updated_at: configDb.knex.fn.now()
              })
          }
        }
      })

      return { inserted: true, count: repos.length }
    } catch (error) {
      console.error('Error syncing GitHub repos:', error)
      throw error
    }
  }

  async function githubRepoAccess(_event, input) {
    const { company_code, access_level = 'pull', repo_name, github_handle } = input
    try {
      const cfg = await configDb
        .knex('github_config')
        .select('github_token', 'owner')
        .where({ company_code: company_code })
        .first()

      const headers = {
        Accept: 'application/vnd.github+json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${cfg.github_token}`,
        'User-Agent': 'bolt-app'
      }

      const body = JSON.stringify({
        permission: access_level
      })
      const url = `https://api.github.com/repos/${cfg.owner}/${repo_name}/collaborators/${github_handle}`

      const response = await fetch(url, {
        method: 'PUT',
        headers,
        body
      })

      if (response.status === 201) {
        return {
          success: true,
          message: `Invitation sent to ${github_handle}`
        }
      } else if (response.status === 204) {
        return {
          success: true,
          message: `${github_handle} already has access`
        }
      } else {
        const error = await response.json()
        return {
          success: false,
          message: `Error inviting user:, ${error.response?.data} || ${error.message}`
        }
      }
      // return response
    } catch (error) {
      console.error('Error adding repo access:', error)
      throw error
    }
  }

  async function createGithubRepo(_event, input) {
    const { company_code, template_repo, repo_name } = input
    try {
      const cfg = await configDb
        .knex('github_config')
        .select('github_token', 'owner')
        .where({ company_code: company_code })
        .first()

      const headers = {
        Accept: 'application/vnd.github+json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${cfg.github_token}`,
        'User-Agent': 'bolt-app'
      }

      const body = JSON.stringify({
        owner: cfg.owner,
        name: repo_name,
        description: `This is a new repo created from a template - ${template_repo}`,
        private: true
      })
      const url = `https://api.github.com/repos/${cfg.owner}/${template_repo}/generate`

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body
      })

      if (response.ok) {
        return {
          success: true,
          message: `${repo_name} created successfully in ${cfg.owner}`
        }
      } else {
        const error = await response.json()
        return {
          success: false,
          message: `Error creating repo:, ${error.response?.data} || ${error.message}`
        }
      }
      // return response
    } catch (error) {
      console.error('Error creating repo:', error)
      throw error
    }
  }

  async function addSecretToGithubRepo(_event, input) {
    const { company_code, repo_name, secrets } = input
    try {
      const cfg = await configDb
        .knex('github_config')
        .select('github_token', 'owner')
        .where({ company_code: company_code })
        .first()

      const { key, key_id } = await getPublicKey({
        repo: repo_name,
        owner: cfg.owner,
        github_token: cfg.github_token
      })

      await Promise.all(
        secrets.map((secret) => {
          const { secret_name, secret_value } = secret
          return addSecret({
            publicKey: key,
            keyId: key_id,
            repo: repo_name,
            owner: cfg.owner,
            github_token: cfg.github_token,
            secret_name,
            secret_value
          })
        })
      )

      return { success: true, message: 'Secrets added successfully' }
    } catch (error) {
      console.error('Error Adding Secrets:', error)
      return { success: false, message: error.message || 'Failed to add secrets' }
    }
  }

  ipcMain.handle('githubRepo:getAll', getGithubRepo)
  ipcMain.handle('githubRepo:upsert', upsertGithubRepo)
  ipcMain.handle('githubRepo:delete', deleteGithubRepo)
  ipcMain.handle('githubRepo:sync', syncGithubRepo)
  ipcMain.handle('githubRepo:access', githubRepoAccess)
  ipcMain.handle('githubRepo:create', createGithubRepo)
  ipcMain.handle('githubRepo:secret', addSecretToGithubRepo)
}
