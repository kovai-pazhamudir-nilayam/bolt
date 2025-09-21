export async function up(knex) {
  // add a new column, e.g. `description` (adjust name/type as needed)
  await knex.schema.alterTable('github_config', (t) => {
    t.string('fastify_template')
    t.string('nestjs_template')
  })
}

export async function down(knex) {
  // rollback: remove the column
  await knex.schema.alterTable('github_config', (t) => {
    t.string('fastify_template')
    t.string('nestjs_template')
  })
}
