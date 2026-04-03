exports.up = async function (knex) {
  await knex.schema.createTable('environment', (t) => {
    t.string('env_code').primary()
    t.string('env_name').notNullable()
    t.datetime('created_at').defaultTo(knex.fn.now())
    t.datetime('updated_at').defaultTo(knex.fn.now())
  })
}

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('environment')
}
