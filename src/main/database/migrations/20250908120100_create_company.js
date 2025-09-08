export async function up(knex) {
  await knex.schema.createTable('company', (t) => {
    t.uuid('company_id').primary().defaultTo(knex.raw('(lower(hex(randomblob(16))))'))
    t.string('code').notNullable().unique()
    t.string('name').notNullable()
    t.text('logo')
    t.datetime('created_at').defaultTo(knex.fn.now())
    t.datetime('updated_at').defaultTo(knex.fn.now())
  })
}

export async function down(knex) {
  await knex.schema.dropTableIfExists('company')
}
