export async function up(knex) {
  await knex.schema.createTable('github_repo_access', (t) => {
    t.string('github_handle').notNullable()
    t.string('access_level').notNullable()
    t.string('company_code').notNullable()
    t.integer('repo_name').notNullable()
    t.datetime('created_at').defaultTo(knex.fn.now())
    t.datetime('updated_at').defaultTo(knex.fn.now())
    t.unique(['github_handle', 'company_code', 'repo_name'])
  })
}

export async function down(knex) {
  await knex.schema.dropTableIfExists('github_repo_access')
}
