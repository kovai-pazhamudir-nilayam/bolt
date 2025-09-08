export async function up(knex) {
  await knex.schema.createTable('user_preferences', (t) => {
    t.increments('id').primary()
    t.string('key').notNullable().unique()
    t.text('value').notNullable()
    t.datetime('created_at').defaultTo(knex.fn.now())
    t.datetime('updated_at').defaultTo(knex.fn.now())
  })
}

export async function down(knex) {
  await knex.schema.dropTableIfExists('user_preferences')
}
