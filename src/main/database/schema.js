/**
 * Database schema definitions using Knex
 */

export const createTables = async (knex) => {
  if (!(await knex.schema.hasTable('user_preferences'))) {
    await knex.schema.createTable('user_preferences', (t) => {
      t.increments('id').primary()
      t.string('key').notNullable().unique()
      t.text('value').notNullable()
      t.datetime('created_at').defaultTo(knex.fn.now())
      t.datetime('updated_at').defaultTo(knex.fn.now())
    })
  }

  if (!(await knex.schema.hasTable('companies'))) {
    await knex.schema.createTable('companies', (t) => {
      t.increments('id').primary()
      t.string('code').notNullable().unique()
      t.string('name').notNullable()
      t.text('logo')
      t.datetime('created_at').defaultTo(knex.fn.now())
      t.datetime('updated_at').defaultTo(knex.fn.now())
    })
  }

  if (!(await knex.schema.hasTable('environments'))) {
    await knex.schema.createTable('environments', (t) => {
      t.increments('id').primary()
      t.string('code').notNullable().unique()
      t.string('name').notNullable()
      t.datetime('created_at').defaultTo(knex.fn.now())
      t.datetime('updated_at').defaultTo(knex.fn.now())
    })
  }

  if (!(await knex.schema.hasTable('core_token_configs'))) {
    await knex.schema.createTable('core_token_configs', (t) => {
      t.increments('id').primary()
      t.integer('company_id').notNullable().references('companies.id')
      t.integer('environment_id').notNullable().references('environments.id')
      t.string('domain').notNullable()
      t.string('token_api').notNullable()
      t.string('auth_key').notNullable()
      t.datetime('created_at').defaultTo(knex.fn.now())
      t.datetime('updated_at').defaultTo(knex.fn.now())
      t.unique(['company_id', 'environment_id'])
    })
  }

  if (!(await knex.schema.hasTable('gcp_project_configs'))) {
    await knex.schema.createTable('gcp_project_configs', (t) => {
      t.increments('id').primary()
      t.integer('company_id').notNullable().references('companies.id')
      t.integer('environment_id').notNullable().references('environments.id')
      t.string('gcp_project').notNullable()
      t.string('gcp_cluster').notNullable()
      t.string('gcp_region').notNullable()
      t.datetime('created_at').defaultTo(knex.fn.now())
      t.datetime('updated_at').defaultTo(knex.fn.now())
      t.unique(['company_id', 'environment_id'])
    })
  }

  if (!(await knex.schema.hasTable('github_configs'))) {
    await knex.schema.createTable('github_configs', (t) => {
      t.increments('id').primary()
      t.integer('company_id').notNullable().references('companies.id')
      t.string('github_token').notNullable()
      t.string('owner').notNullable()
      t.datetime('created_at').defaultTo(knex.fn.now())
      t.datetime('updated_at').defaultTo(knex.fn.now())
      t.unique(['company_id'])
    })
  }

  if (!(await knex.schema.hasTable('github_repos'))) {
    await knex.schema.createTable('github_repos', (t) => {
      t.increments('id').primary()
      t.integer('company_id').notNullable().references('companies.id')
      t.string('name').notNullable()
      t.datetime('created_at').defaultTo(knex.fn.now())
      t.datetime('updated_at').defaultTo(knex.fn.now())
      t.unique(['company_id', 'name'])
    })
  }

  // github_repo_access - maps users to repos per company
  if (!(await knex.schema.hasTable('github_repo_access'))) {
    await knex.schema.createTable('github_repo_access', (t) => {
      t.increments('id').primary()
      t.integer('company_id').notNullable().references('companies.id')
      t.integer('repo_id').notNullable().references('github_repos.id')
      t.integer('user_id').notNullable().references('users.id')
      t.datetime('created_at').defaultTo(knex.fn.now())
      t.datetime('updated_at').defaultTo(knex.fn.now())
      t.unique(['company_id', 'repo_id', 'user_id'])
    })
  }

  if (!(await knex.schema.hasTable('users'))) {
    await knex.schema.createTable('users', (t) => {
      t.increments('id').primary()
      t.string('name').notNullable()
      t.string('github_handle').notNullable().unique()
      t.datetime('created_at').defaultTo(knex.fn.now())
      t.datetime('updated_at').defaultTo(knex.fn.now())
    })
  }

  if (!(await knex.schema.hasTable('brand_configs'))) {
    await knex.schema.createTable('brand_configs', (t) => {
      t.increments('id').primary()
      t.string('brand').notNullable()
      t.string('environment').notNullable()
      t.string('config_type').notNullable()
      t.text('config_data').notNullable()
      t.datetime('created_at').defaultTo(knex.fn.now())
      t.datetime('updated_at').defaultTo(knex.fn.now())
      t.unique(['brand', 'environment', 'config_type'])
    })
  }

  await knex.schema.raw(
    'CREATE INDEX IF NOT EXISTS idx_core_token_company_env ON core_token_configs(company_id, environment_id)'
  )
  await knex.schema.raw(
    'CREATE INDEX IF NOT EXISTS idx_gcp_company_env ON gcp_project_configs(company_id, environment_id)'
  )
  await knex.schema.raw('CREATE INDEX IF NOT EXISTS idx_github_company ON github_configs(company_id)')
  await knex.schema.raw('CREATE INDEX IF NOT EXISTS idx_github_repos_company ON github_repos(company_id)')
  await knex.schema.raw('CREATE INDEX IF NOT EXISTS idx_user_preferences_key ON user_preferences(key)')
  await knex.schema.raw(
    'CREATE INDEX IF NOT EXISTS idx_github_repo_access_company ON github_repo_access(company_id)'
  )
}
