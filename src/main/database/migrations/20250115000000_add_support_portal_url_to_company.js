export async function up(knex) {
  await knex.schema.alterTable('company', (t) => {
    t.string('support_portal_url').nullable()
  })
}

export async function down(knex) {
  await knex.schema.alterTable('company', (t) => {
    t.dropColumn('support_portal_url')
  })
}
