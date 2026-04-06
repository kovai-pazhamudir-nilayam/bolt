exports.up = async function (knex) {
  await knex.schema.alterTable('feature_config', (t) => {
    t.string('editor_access').defaultTo('edit')
    t.string('viewer_access').defaultTo('view')
  })
  await knex('feature_config').update({ editor_access: 'edit', viewer_access: 'view' })
}

exports.down = async function (_knex) {
  // SQLite does not support dropColumn natively; no-op for rollback
}
