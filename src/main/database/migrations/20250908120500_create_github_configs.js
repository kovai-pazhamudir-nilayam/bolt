export async function up(knex) {
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

export async function down(knex) {
  await knex.schema.dropTableIfExists('github_configs')
}
