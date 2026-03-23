exports.up = async function (knex) {
  await knex.schema.renameTable('saved_db_query', 'saved_db_query_old')

  await knex.schema.createTable('saved_db_query', (table) => {
    table.increments('id').primary()
    table.string('title').notNullable()
    table.text('description')
    table.text('query').notNullable()
    table.string('company_code')
    table.string('db_name')
    table.timestamps(true, true)
  })

  const rows = await knex('saved_db_query_old')
    .leftJoin('db_secrets', 'saved_db_query_old.db_id', 'db_secrets.id')
    .select(
      'saved_db_query_old.id',
      'saved_db_query_old.title',
      'saved_db_query_old.description',
      'saved_db_query_old.query',
      'saved_db_query_old.created_at',
      'saved_db_query_old.updated_at',
      'db_secrets.company_code',
      'db_secrets.db_name'
    )

  if (rows.length > 0) {
    await knex('saved_db_query').insert(
      rows.map((r) => ({
        id: r.id,
        title: r.title,
        description: r.description,
        query: r.query,
        company_code: r.company_code,
        db_name: r.db_name,
        created_at: r.created_at,
        updated_at: r.updated_at
      }))
    )
  }

  await knex.schema.dropTable('saved_db_query_old')
}

exports.down = async function (knex) {
  await knex.schema.dropTable('saved_db_query')

  await knex.schema.createTable('saved_db_query', (table) => {
    table.increments('id').primary()
    table.string('title').notNullable()
    table.text('description')
    table.text('query').notNullable()
    table.integer('db_id').unsigned().references('id').inTable('db_secrets').onDelete('CASCADE')
    table.timestamps(true, true)
  })
}
