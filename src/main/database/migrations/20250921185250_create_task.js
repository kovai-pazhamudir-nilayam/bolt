// migrations/xxxx_create_task.js
export async function up(knex) {
  await knex.schema.createTable('task', (t) => {
    t.increments('task_id').primary()
    t.string('title').notNullable()
    t.text('description')
    t.string('company_code').notNullable()
    t.datetime('reminder_at')
    t.enum('status', ['PENDING', 'IN_PROGRESS', 'COMPLETED']).defaultTo('PENDING')
    t.datetime('created_at').defaultTo(knex.fn.now())
    t.datetime('updated_at').defaultTo(knex.fn.now())
  })
}

export async function down(knex) {
  await knex.schema.dropTableIfExists('task')
}
