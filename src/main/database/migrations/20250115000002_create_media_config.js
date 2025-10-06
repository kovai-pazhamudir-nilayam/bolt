export async function up(knex) {
  await knex.schema.createTable('media_config', (t) => {
    t.increments('id').primary()
    t.string('company_code').notNullable()
    t.string('env_code').notNullable()
    t.enum('type', ['PRODUCT', 'BRAND', 'CATEGORY']).notNullable()
    t.string('bucket_path').notNullable()
    t.datetime('created_at').defaultTo(knex.fn.now())
    t.datetime('updated_at').defaultTo(knex.fn.now())

    // Unique constraint on company, environment, and type combination
    t.unique(['company_code', 'env_code', 'type'])
  })
}

export async function down(knex) {
  await knex.schema.dropTableIfExists('media_config')
}
