/**
 * Migración para la tabla 'consumption_history' (historial de consumo)
 * Registra cuando un usuario consume/desecha productos
 */

export const up = async function(knex) {
  return knex.schema.createTable('consumption_history', (table) => {
    table.increments('id').primary();
    table.uuid('user_id').notNullable();
    table.string('product_name', 255).notNullable();
    table.string('category', 100);
    table.integer('quantity').defaultTo(1);
    table.integer('calories').defaultTo(0); // Calorías estimadas
    table.enum('action', ['consumed', 'wasted']).notNullable(); // Consumido o desperdiciado
    table.timestamp('consumed_at').defaultTo(knex.fn.now());
    
    table.index(['user_id', 'consumed_at']);
  });
};

export const down = async function(knex) {
  return knex.schema.dropTable('consumption_history');
};
