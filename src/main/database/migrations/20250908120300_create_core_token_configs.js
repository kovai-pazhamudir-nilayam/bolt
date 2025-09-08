export async function up(knex) {
  await knex.schema.createTable('core_token_configs', (t) => {
    t.increments('id').primary()
    t.integer('company_id').notNullable().references('companies.id')
    t.integer('environment_id').notNullable().references('environments.id')
    t.string('domain').notNullable()
    t.string('token_api').notNullable()
    t.string('auth_key').notNullable()
    t.datetime('created_at').defaultTo(knex.fn.now())
    t.datetime('updated_at').defaultTo(knex.fn.now())
    t.unique(['company_id', 'environment_id'])
  })
}

export async function down(knex) {
  await knex.schema.dropTableIfExists('core_token_configs')
}
