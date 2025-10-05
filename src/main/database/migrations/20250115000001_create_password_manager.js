export async function up(knex) {
  await knex.schema.createTable('password_manager', (t) => {
    t.increments('id').primary()
    t.string('company_url').nullable()
    t.enum('type', ['Personal', 'Official']).notNullable()
    t.string('username').notNullable()
    t.text('password').notNullable()
    t.string('title').nullable()
    t.text('notes').nullable()
    t.datetime('created_at').defaultTo(knex.fn.now())
    t.datetime('updated_at').defaultTo(knex.fn.now())
  })
}

export async function down(knex) {
  await knex.schema.dropTableIfExists('password_manager')
}
