export async function up(knex) {
  await knex.schema.createTable('environments', (t) => {
    t.increments('id').primary()
    t.string('code').notNullable().unique()
    t.string('name').notNullable()
    t.datetime('created_at').defaultTo(knex.fn.now())
    t.datetime('updated_at').defaultTo(knex.fn.now())
  })
}

export async function down(knex) {
  await knex.schema.dropTableIfExists('environments')
}
