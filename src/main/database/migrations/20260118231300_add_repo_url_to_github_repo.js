export async function up(knex) {
  await knex.schema.alterTable('github_repo', (t) => {
    t.string('repo_url').nullable()
  })
}

export async function down(knex) {
  await knex.schema.alterTable('github_repo', (t) => {
    t.dropColumn('repo_url')
  })
}
