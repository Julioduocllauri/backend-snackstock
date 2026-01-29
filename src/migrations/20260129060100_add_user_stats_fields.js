/**
 * Agregar campos de estadísticas a la tabla users
 */

export const up = async function(knex) {
  return knex.schema.table('users', (table) => {
    table.timestamp('first_login').defaultTo(knex.fn.now());
    table.integer('total_products_added').defaultTo(0);
    table.integer('total_products_consumed').defaultTo(0);
    table.integer('total_products_wasted').defaultTo(0);
  });
};

export const down = async function(knex) {
  return knex.schema.table('users', (table) => {
    table.dropColumn('first_login');
    table.dropColumn('total_products_added');
    table.dropColumn('total_products_consumed');
    table.dropColumn('total_products_wasted');
  });
};
