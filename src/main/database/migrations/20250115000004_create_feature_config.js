exports.up = async function (knex) {
  await knex.schema.createTable('feature_config', (t) => {
    t.increments('id').primary()
    t.string('feature_key').notNullable().unique()
    t.string('feature_name').notNullable()
    t.string('feature_type').notNullable()
    t.string('access_level').notNullable()
    t.text('description')
    t.boolean('is_superadmin_only').defaultTo(false)
    t.datetime('created_at').defaultTo(knex.fn.now())
    t.datetime('updated_at').defaultTo(knex.fn.now())
  })

  const defaultFeatures = [
    { feature_key: 'tools', feature_name: 'Tools', feature_type: 'page', access_level: 'write', description: 'Main tools page' },
    { feature_key: 'github-settings', feature_name: 'GitHub Settings', feature_type: 'page', access_level: 'write', description: 'GitHub configuration and settings' },
    { feature_key: 'db-query', feature_name: 'DB Query', feature_type: 'page', access_level: 'write', description: 'Database query interface' },
    { feature_key: 'media-process', feature_name: 'Media Process', feature_type: 'page', access_level: 'write', description: 'Media processing tools' },
    { feature_key: 'connect-redis', feature_name: 'Redis', feature_type: 'page', access_level: 'write', description: 'Redis connection and management' },
    { feature_key: 'notes', feature_name: 'Notes', feature_type: 'page', access_level: 'write', description: 'Notes and documentation' },
    { feature_key: 'task-list', feature_name: 'Tasks', feature_type: 'page', access_level: 'write', description: 'Task management' },
    { feature_key: 'settings', feature_name: 'Settings', feature_type: 'page', access_level: 'write', description: 'Application settings' },
    { feature_key: 'db-backup', feature_name: 'DB Backup', feature_type: 'page', access_level: 'write', description: 'Database backup tools' },
    { feature_key: 'password-manager', feature_name: 'Password Manager', feature_type: 'page', access_level: 'write', description: 'Password management' },
    { feature_key: 'user-profile', feature_name: 'User Profile', feature_type: 'page', access_level: 'write', description: 'User profile management' },
    { feature_key: 'os-ticket', feature_name: 'osTicket', feature_type: 'page', access_level: 'write', description: 'osTicket integration' },
    { feature_key: 'settings-companies', feature_name: 'Companies Settings', feature_type: 'tab', access_level: 'write', description: 'Company management in settings' },
    { feature_key: 'settings-environments', feature_name: 'Environments Settings', feature_type: 'tab', access_level: 'write', description: 'Environment management in settings' },
    { feature_key: 'settings-core-configs', feature_name: 'Core Configs Settings', feature_type: 'tab', access_level: 'write', description: 'Core configuration management' },
    { feature_key: 'settings-gcp-project-configs', feature_name: 'GCP Project Configs Settings', feature_type: 'tab', access_level: 'write', description: 'GCP project configuration' },
    { feature_key: 'settings-media-configs', feature_name: 'Media Config Settings', feature_type: 'tab', access_level: 'write', description: 'Media configuration settings' },
    { feature_key: 'feature-config', feature_name: 'Feature Configuration', feature_type: 'page', access_level: 'write', description: 'Manage feature access levels', is_superadmin_only: true }
  ]

  await knex('feature_config').insert(defaultFeatures)
}

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('feature_config')
}
