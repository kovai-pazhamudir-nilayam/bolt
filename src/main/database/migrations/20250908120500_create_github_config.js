export async function up(knex) {
  await knex.schema.createTable('github_config', (t) => {
    t.string('company_code').primary()
    t.string('github_token').notNullable()
    t.string('owner').notNullable()
    t.datetime('created_at').defaultTo(knex.fn.now())
    t.datetime('updated_at').defaultTo(knex.fn.now())
  })
}

export async function down(knex) {
  await knex.schema.dropTableIfExists('github_config')
}
