exports.up = function (knex) {
  return knex.schema.createTable('saved_db_query', (table) => {
    table.increments('id').primary()
    table.string('title').notNullable()
    table.text('description')
    table.text('query').notNullable()
    table.integer('db_id').unsigned().references('id').inTable('db_secrets').onDelete('CASCADE')
    table.timestamps(true, true)
  })
}

exports.down = function (knex) {
  return knex.schema.dropTable('saved_db_query')
}
