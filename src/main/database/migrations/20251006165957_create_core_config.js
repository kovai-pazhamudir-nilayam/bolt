exports.up = async function (knex) {
  await knex.schema.createTable('core_config', (t) => {
    t.string('company_code').notNullable()
    t.string('env_code').notNullable()
    t.string('base_url').notNullable()
    t.string('auth_api').notNullable()
    t.string('auth_api_key').notNullable()
    t.datetime('created_at').defaultTo(knex.fn.now())
    t.datetime('updated_at').defaultTo(knex.fn.now())
    t.primary(['company_code', 'env_code'])
  })
}

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('core_config')
}
