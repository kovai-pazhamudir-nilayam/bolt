export async function up(knex) {
  await knex.schema.createTable('github_repos', (t) => {
    t.increments('id').primary()
    t.integer('company_id').notNullable().references('companies.id')
    t.string('name').notNullable()
    t.datetime('created_at').defaultTo(knex.fn.now())
    t.datetime('updated_at').defaultTo(knex.fn.now())
    t.unique(['company_id', 'name'])
  })
}

export async function down(knex) {
  await knex.schema.dropTableIfExists('github_repos')
}
