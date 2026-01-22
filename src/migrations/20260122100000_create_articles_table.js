/**
 * Migración para la tabla 'articles' (inventario)
 * 
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  return knex.schema.createTable('articles', (table) => {
    table.increments('id').primary(); // ID auto-incremental
    table.uuid('user_id').notNullable(); // Referencia a users
    table.string('name', 255).notNullable(); // Nombre del producto
    table.integer('quantity').defaultTo(1); // Cantidad
    table.string('category', 100).defaultTo('General'); // Categoría
    table.date('expiry_date'); // Fecha de vencimiento
    table.timestamps(true, true); // created_at y updated_at
    
    // Índices para mejorar performance
    table.index('user_id');
    table.index('expiry_date');
    table.index('category');
  });
}

/**
 * Deshacer la migración
 * 
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  return knex.schema.dropTable('articles');
}
