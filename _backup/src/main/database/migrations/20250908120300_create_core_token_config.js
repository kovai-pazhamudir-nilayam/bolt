export async function up(knex) {
  await knex.schema.createTable('core_token_config', (t) => {
    t.uuid('core_token_config_id').primary().defaultTo(knex.raw('(lower(hex(randomblob(16))))'))
    t.string('token_api').notNullable()
    t.string('auth_key').notNullable()
    t.datetime('created_at').defaultTo(knex.fn.now())
    t.datetime('updated_at').defaultTo(knex.fn.now())
  })
}

export async function down(knex) {
  await knex.schema.dropTableIfExists('core_token_config')
}
