exports.up = async function (knex) {
  await knex.schema.alterTable('github_repo', (t) => {
    t.string('repo_url').nullable()
  })
}

exports.down = async function (knex) {
  await knex.schema.alterTable('github_repo', (t) => {
    t.dropColumn('repo_url')
  })
}
