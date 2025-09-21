export async function up(knex) {
  await knex.schema.createTable('company', (t) => {
    t.string('company_code').notNullable().unique()
    t.string('company_name').notNullable()
    t.text('company_logo')
    t.datetime('created_at').defaultTo(knex.fn.now())
    t.datetime('updated_at').defaultTo(knex.fn.now())
  })
}

export async function down(knex) {
  await knex.schema.dropTableIfExists('company')
}
