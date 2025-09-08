export async function up(knex) {
  await knex.schema.createTable('github_repo', (t) => {
    t.uuid('github_repo_id').primary().defaultTo(knex.raw('(lower(hex(randomblob(16))))'))
    t.string('name').notNullable()
    t.datetime('created_at').defaultTo(knex.fn.now())
    t.datetime('updated_at').defaultTo(knex.fn.now())
  })
}

export async function down(knex) {
  await knex.schema.dropTableIfExists('github_repo')
}
