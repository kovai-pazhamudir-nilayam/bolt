export async function up(knex) {
  await knex.schema.createTable('gcp_project_configs', (t) => {
    t.increments('id').primary()
    t.integer('company_id').notNullable().references('companies.id')
    t.integer('environment_id').notNullable().references('environments.id')
    t.string('gcp_project').notNullable()
    t.string('gcp_cluster').notNullable()
    t.string('gcp_region').notNullable()
    t.datetime('created_at').defaultTo(knex.fn.now())
    t.datetime('updated_at').defaultTo(knex.fn.now())
    t.unique(['company_id', 'environment_id'])
  })
}

export async function down(knex) {
  await knex.schema.dropTableIfExists('gcp_project_configs')
}
