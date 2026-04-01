exports.up = async function (knex) {
  await knex.schema.createTable('github_repo', (t) => {
    t.string('company_code').notNullable()
    t.string('repo_name').notNullable()
    t.datetime('created_at').defaultTo(knex.fn.now())
    t.datetime('updated_at').defaultTo(knex.fn.now())
    t.primary(['company_code', 'repo_name'])
  })
}

exports.down = async function (knex) {
  // table name fixed to match the one created above
  await knex.schema.dropTableIfExists('github_repo')
}
