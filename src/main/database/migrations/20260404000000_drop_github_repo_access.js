exports.up = async function (knex) {
  await knex.schema.dropTableIfExists('github_repo_access')
}

exports.down = async function (knex) {
  await knex.schema.createTable('github_repo_access', (table) => {
    table.increments('id').primary()
    table.integer('github_repo_id').notNullable()
    table.string('username').notNullable()
    table.string('access_level').notNullable()
    table.timestamps(true, true)
  })
}
