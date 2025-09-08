export async function up(knex) {
  await knex.schema.raw(
    'CREATE INDEX IF NOT EXISTS idx_core_token_company_env ON core_token_configs(company_id, environment_id)'
  )
  await knex.schema.raw(
    'CREATE INDEX IF NOT EXISTS idx_gcp_company_env ON gcp_project_configs(company_id, environment_id)'
  )
  await knex.schema.raw(
    'CREATE INDEX IF NOT EXISTS idx_github_company ON github_configs(company_id)'
  )
  await knex.schema.raw(
    'CREATE INDEX IF NOT EXISTS idx_github_repos_company ON github_repos(company_id)'
  )
  await knex.schema.raw(
    'CREATE INDEX IF NOT EXISTS idx_user_preferences_key ON user_preferences(key)'
  )
  await knex.schema.raw(
    'CREATE INDEX IF NOT EXISTS idx_github_repo_access_company ON github_repo_access(company_id)'
  )
}

export async function down(knex) {
  await knex.schema.raw('DROP INDEX IF EXISTS idx_core_token_company_env')
  await knex.schema.raw('DROP INDEX IF EXISTS idx_gcp_company_env')
  await knex.schema.raw('DROP INDEX IF EXISTS idx_github_company')
  await knex.schema.raw('DROP INDEX IF EXISTS idx_github_repos_company')
  await knex.schema.raw('DROP INDEX IF EXISTS idx_user_preferences_key')
  await knex.schema.raw('DROP INDEX IF EXISTS idx_github_repo_access_company')
}
