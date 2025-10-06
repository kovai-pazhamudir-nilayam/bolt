export async function up(knex) {
  await knex.schema.createTable('media_config', (t) => {
    t.increments('id').primary()
    t.string('company_code').notNullable()
    t.string('environment_code').notNullable()
    t.enum('type', ['product', 'brand', 'category']).notNullable()
    t.string('bucket_path').notNullable()
    t.datetime('created_at').defaultTo(knex.fn.now())
    t.datetime('updated_at').defaultTo(knex.fn.now())
    
    // Unique constraint on company, environment, and type combination
    t.unique(['company_code', 'environment_code', 'type'], 'unique_company_env_type')
    
    // Foreign key constraints
    t.foreign('company_code').references('company_code').inTable('company').onDelete('CASCADE')
    t.foreign('environment_code').references('environment_code').inTable('environment').onDelete('CASCADE')
  })
}

export async function down(knex) {
  await knex.schema.dropTableIfExists('media_config')
}
