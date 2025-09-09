export async function up(knex) {
  await knex.schema.createTable('github_config', (t) => {
    t.uuid('github_config_id').primary().defaultTo(knex.raw('(lower(hex(randomblob(16))))'))
    t.string('company_code').notNullable()
    t.string('github_token').notNullable()
    t.string('owner').notNullable()
    t.datetime('created_at').defaultTo(knex.fn.now())
    t.datetime('updated_at').defaultTo(knex.fn.now())
  })
}

export async function down(knex) {
  await knex.schema.dropTableIfExists('github_config')
}
