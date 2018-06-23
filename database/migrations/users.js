
exports.up = (knex, Promise) => {
  return Promise.all([
    knex.schema.createTable('companies', (table) => {
      table.increments('id').primary();
      table.string('name').notNullable().unique();
    }),
    knex.schema.createTable('roles', (table) => {
      table.increments('id').primary();
      table.string('name', 100).notNullable().unique();
      table.integer('salary');
      table.integer('company_id').unsigned().references('id').inTable('companies');
    }),
    knex.schema.createTable('users', (table) => {
      table.increments('id').primary();
      table.string('first_name', 100);
      table.string('last_name', 100);
      table.string('email', 200).unique('email').notNullable();
      table.string('username', 100).unique('username').notNullable();
      table.string('hash', 200).notNullable();
      table.integer('current_salary');
      table.integer('active_role')
      table.timestamps(true, true);
    }),
    knex.schema.createTable('applications', (table) => {
      table.increments('id').primary();
      table.integer('user_id').unsigned().references('id').inTable('users');
      table.integer('role_id').unsigned().references('id').inTable('roles');
      table.string('location', 100);
      table.timestamps(true, true);
    }),
    knex.schema.createTable('offers', (table) => {
      table.increments('id').primary();
      table.integer('application_id').unsigned().references('id').inTable('applications');
      table.integer('base_salary');
      table.boolean('hasHealthBeneits');
      table.boolean('hasPTO');
      table.boolean('hasRetirement');
      table.boolean('coversRelocation');
    }),
    knex.schema.createTable('milestones', (table) => {
      table.increments('id').primary();
      table.integer('user_id').unsigned().references('id').inTable('users');
      table.string('name', 100);
      table.string('description', 500);
      table.string('repo_link', 300);
      table.string('tech_used',300);
      table.timestamps(true, true);
    })
  ]);
};

exports.down = (knex, Promise) => {
  return Promise.all([
    knex.schema.dropTable('milestones'),
    knex.schema.dropTable('offers'),
    knex.schema.dropTable('applications'),
    knex.schema.dropTable('users'),
    knex.schema.dropTable('roles'),
    knex.schema.dropTable('companies')
  ])
};