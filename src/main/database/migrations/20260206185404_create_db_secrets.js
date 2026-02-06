/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('db_secrets', (table) => {
    table.increments('id').primary()
    table.string('company_code').notNullable()
    table.string('environment').notNullable() // e.g., 'production', 'staging', 'development'
    table.string('db_host').notNullable()
    table.string('db_name').notNullable()
    table.string('db_user').notNullable()
    table.string('db_password').notNullable()
    table.text('notes')
    table.timestamps(true, true)
  })
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable('db_secrets')
}
