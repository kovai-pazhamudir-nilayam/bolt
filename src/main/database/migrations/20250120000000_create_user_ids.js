export async function up(knex) {
  // Create user_ids table
  await knex.schema.createTable('user_ids', (t) => {
    t.increments('id').primary()
    t.string('phone_number').notNullable()
    t.string('user_id').notNullable()
    t.string('company_code').notNullable()
    t.string('env_code').notNullable()
    t.datetime('created_at').defaultTo(knex.fn.now())
    t.datetime('updated_at').defaultTo(knex.fn.now())

    // Ensure one phone_number can have multiple company/environment combinations
    // But no duplicate phone_number+company_code+env_code combinations
    t.unique(['phone_number', 'company_code', 'env_code'])

    // Add unique constraint for user_id
    t.unique('user_id')

    // Foreign key relationship (optional, for data integrity)
    t.foreign('phone_number').references('phone_number').inTable('user_profile').onDelete('CASCADE')
  })

  // Drop the unique constraint on company_code, env_code
  try {
    await knex.raw(
      'ALTER TABLE user_profile DROP CONSTRAINT user_profile_company_code_env_code_unique'
    )
  } catch (e) {
    // Constraint might not exist or have a different name
    console.log('Could not drop unique constraint:', e.message)
  }

  // Remove company_code and env_code columns from user_profile table
  await knex.schema.alterTable('user_profile', (t) => {
    t.dropColumn('company_code')
    t.dropColumn('env_code')
  })

  // Keep features column for future use
}

export async function down(knex) {
  // Add back company_code and env_code columns to user_profile
  await knex.schema.alterTable('user_profile', (t) => {
    t.string('company_code')
    t.string('env_code')
  })

  // Migrate data back from user_ids to user_profile
  // This assumes one user_id per phone_number for simplicity
  const userIds = await knex('user_ids')
    .select('phone_number', 'user_id', 'company_code', 'env_code')
    .groupBy('phone_number')
    .having(knex.raw('COUNT(*)'), '=', 1)

  for (const userId of userIds) {
    await knex('user_profile').where({ phone_number: userId.phone_number }).update({
      company_code: userId.company_code,
      env_code: userId.env_code
    })
  }

  // Add unique constraint
  await knex.schema.alterTable('user_profile', (t) => {
    t.unique(['company_code', 'env_code'])
  })

  // Drop user_ids table
  await knex.schema.dropTableIfExists('user_ids')
}
