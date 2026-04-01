exports.up = async function (knex) {
  await knex.schema.createTable('user_profile', (t) => {
    t.string('phone_number').primary().notNullable()
    t.string('name').notNullable()
    t.string('email').notNullable()
    t.string('password').notNullable()
    t.json('user_ids').defaultTo('{}')
    t.datetime('created_at').defaultTo(knex.fn.now())
    t.datetime('updated_at').defaultTo(knex.fn.now())
  })
}

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('user_profile')
}
