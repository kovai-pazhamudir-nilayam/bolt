exports.up = async function (knex) {
  await knex.schema.dropTableIfExists('task')
}

exports.down = async function (knex) {
  await knex.schema.createTable('task', (t) => {
    t.increments('id').primary()
    t.string('title').notNullable()
    t.string('company_code')
    t.text('description')
    t.string('status').defaultTo('pending')
    t.datetime('reminder_at')
    t.timestamps(true, true)
  })
}
