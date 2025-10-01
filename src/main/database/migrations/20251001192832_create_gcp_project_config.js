export async function up(knex) {
  await knex.schema.createTable('gcp_project_config', (t) => {
    t.string('company_code').notNullable()
    t.string('env_code').notNullable()
    t.string('gcp_project').notNullable()
    t.string('gcp_cluster').notNullable()
    t.string('gcp_region').notNullable()
    t.datetime('created_at').defaultTo(knex.fn.now())
    t.datetime('updated_at').defaultTo(knex.fn.now())
    t.primary(['company_code', 'env_code'])
  })
}

export async function down(knex) {
  await knex.schema.dropTableIfExists('gcp_project_config')
}
