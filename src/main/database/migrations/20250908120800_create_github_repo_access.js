export async function up(knex) {
  await knex.schema.createTable('github_repo_access', (t) => {
    t.increments('id').primary()
    t.string('access_level').notNullable()
    t.integer('company_id').notNullable().references('companies.id')
    t.integer('repo_id').notNullable().references('github_repos.id')
    t.integer('user_id').notNullable().references('users.id')
    t.datetime('created_at').defaultTo(knex.fn.now())
    t.datetime('updated_at').defaultTo(knex.fn.now())
    t.unique(['company_id', 'repo_id', 'user_id'])
  })
}

export async function down(knex) {
  await knex.schema.dropTableIfExists('github_repo_access')
}
