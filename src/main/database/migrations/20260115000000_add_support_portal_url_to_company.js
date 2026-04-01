exports.up = async function (knex) {
  await knex.schema.alterTable('company', (t) => {
    t.string('support_portal_url').nullable()
  })
}

exports.down = async function (knex) {
  await knex.schema.alterTable('company', (t) => {
    t.dropColumn('support_portal_url')
  })
}
