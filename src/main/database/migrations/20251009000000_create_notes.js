export async function up(knex) {
  // Create notes table
  await knex.schema.createTable('notes', (t) => {
    t.increments('id').primary()
    t.string('title').notNullable()
    t.text('content').nullable() // Rich text HTML content
    t.string('category').nullable()
    t.string('company_code').nullable()
    t.datetime('created_at').defaultTo(knex.fn.now())
    t.datetime('updated_at').defaultTo(knex.fn.now())

    // Indexes for better performance
    t.index(['category'])
    t.index(['company_code'])
  })

  // Create note_attachments table
  await knex.schema.createTable('note_attachments', (t) => {
    t.increments('id').primary()
    t.integer('note_id').unsigned().notNullable()
    t.string('file_name').notNullable()
    t.string('file_path').notNullable()
    t.integer('file_size').nullable()
    t.string('mime_type').nullable()
    t.datetime('created_at').defaultTo(knex.fn.now())

    // Foreign key constraint
    t.foreign('note_id').references('id').inTable('notes').onDelete('CASCADE')

    // Index for better performance
    t.index(['note_id'])
  })
}

export async function down(knex) {
  await knex.schema.dropTableIfExists('note_attachments')
  await knex.schema.dropTableIfExists('notes')
}
