exports.up = async function (knex) {
  await knex.schema.createTable('kanban_task', (t) => {
    t.string('id').primary()
    t.text('data').notNullable()
    t.datetime('created_at').defaultTo(knex.fn.now())
    t.datetime('updated_at').defaultTo(knex.fn.now())
  })
}

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('kanban_task')
}
