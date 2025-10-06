export async function up(knex) {
  await knex.schema.createTable('user_profile', (t) => {
    t.string('phone_number').primary().notNullable()
    t.string('name').notNullable()
    t.string('email').notNullable()
    t.string('password').notNullable()
    t.string('company_code').notNullable()
    t.string('env_code').notNullable()
    t.json('features').defaultTo('{}')
    t.datetime('created_at').defaultTo(knex.fn.now())
    t.datetime('updated_at').defaultTo(knex.fn.now())

    // Add unique constraint for company + environment combination
    t.unique(['company_code', 'env_code'])
  })
}

export async function down(knex) {
  await knex.schema.dropTableIfExists('user_profile')
}
