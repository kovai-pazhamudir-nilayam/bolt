exports.up = async function (knex) {
  await knex.schema.createTable('api_collection', (t) => {
    t.increments('id').primary()
    t.string('title').notNullable()
    t.string('method').notNullable().defaultTo('GET')
    t.text('url').notNullable()
    t.text('headers').defaultTo('[]')
    t.text('body').defaultTo('')
    t.datetime('created_at').defaultTo(knex.fn.now())
    t.datetime('updated_at').defaultTo(knex.fn.now())
  })
}

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('api_collection')
}
