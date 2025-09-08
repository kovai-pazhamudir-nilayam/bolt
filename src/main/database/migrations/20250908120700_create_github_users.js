export async function up(knex) {
  await knex.schema.createTable('github_users', (t) => {
    t.increments('id').primary()
    t.string('name').notNullable()
    t.string('github_handle').notNullable().unique()
    t.datetime('created_at').defaultTo(knex.fn.now())
    t.datetime('updated_at').defaultTo(knex.fn.now())
  })
}

export async function down(knex) {
  await knex.schema.dropTableIfExists('github_users')
}
