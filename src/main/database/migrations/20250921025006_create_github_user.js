export async function up(knex) {
  await knex.schema.createTable('github_user', (t) => {
    t.string('name').notNullable()
    t.string('github_handle').primary()
    t.datetime('created_at').defaultTo(knex.fn.now())
    t.datetime('updated_at').defaultTo(knex.fn.now())
  })
}

export async function down(knex) {
  await knex.schema.dropTableIfExists('github_user')
}
