export async function up(knex) {
  await knex.schema.createTable('users', (t) => {
    t.uuid('user_id').primary().defaultTo(knex.raw('(lower(hex(randomblob(16))))'))
    t.string('email').unique().notNullable()
    t.string('name')
    t.datetime('created_at').defaultTo(knex.fn.now())
    t.datetime('updated_at').defaultTo(knex.fn.now())
  })
}

export async function down(knex) {
  await knex.schema.dropTableIfExists('users')
}
