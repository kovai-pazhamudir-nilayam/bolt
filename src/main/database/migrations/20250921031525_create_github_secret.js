export async function up(knex) {
  await knex.schema.createTable('github_secret', (t) => {
    t.string('company_code').notNullable()
    t.string('secret_name').notNullable()
    t.integer('secret_value').notNullable()
    t.datetime('created_at').defaultTo(knex.fn.now())
    t.datetime('updated_at').defaultTo(knex.fn.now())
    t.unique(['company_code', 'secret_name'])
  })
}

export async function down(knex) {
  await knex.schema.dropTableIfExists('github_repo_access')
}
