/**
 * Migración para agregar campos de onboarding a la tabla users
 * 
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  // Verificar qué columnas ya existen antes de agregarlas
  const hasIsFirstLogin = await knex.schema.hasColumn('users', 'is_first_login');
  const hasOnboardingCompleted = await knex.schema.hasColumn('users', 'onboarding_completed');
  const hasFirstLogin = await knex.schema.hasColumn('users', 'first_login');
  const hasLastLogin = await knex.schema.hasColumn('users', 'last_login');

  return knex.schema.table('users', (table) => {
    if (!hasIsFirstLogin) {
      table.boolean('is_first_login').defaultTo(true);
    }
    if (!hasOnboardingCompleted) {
      table.boolean('onboarding_completed').defaultTo(false);
    }
    if (!hasFirstLogin) {
      table.timestamp('first_login').nullable();
    }
    if (!hasLastLogin) {
      table.timestamp('last_login').nullable();
    }
  });
}

/**
 * Deshacer la migración
 * 
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  return knex.schema.table('users', (table) => {
    table.dropColumn('is_first_login');
    table.dropColumn('onboarding_completed');
    table.dropColumn('first_login');
    table.dropColumn('last_login');
  });
}
