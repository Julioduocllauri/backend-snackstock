/**
 * Seed para usuarios de prueba
 * 
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
export async function seed(knex) {
  // Limpiar tabla primero
  await knex('users').del();
  
  // Insertar usuarios de prueba
  const users = await knex('users').insert([
    {
      email: 'test@snackstock.com',
      password: 'password123', // En producción: hashear con bcrypt
      name: 'Usuario Test'
    },
    {
      email: 'admin@snackstock.com',
      password: 'admin123',
      name: 'Admin SnackStock'
    }
  ]).returning('*');

  // Obtener el ID del primer usuario para los artículos
  const testUserId = users[0].id;

  // Limpiar artículos
  await knex('articles').del();

  // Calcular fechas de vencimiento
  const today = new Date();
  const addDays = (days) => {
    const date = new Date(today);
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
  };

  // Insertar artículos de prueba
  await knex('articles').insert([
    {
      user_id: testUserId,
      name: 'Leche',
      quantity: 2,
      category: 'Lácteos',
      expiry_date: addDays(2)
    },
    {
      user_id: testUserId,
      name: 'Pan Integral',
      quantity: 1,
      category: 'Panadería',
      expiry_date: addDays(1)
    },
    {
      user_id: testUserId,
      name: 'Queso Gouda',
      quantity: 1,
      category: 'Lácteos',
      expiry_date: addDays(5)
    },
    {
      user_id: testUserId,
      name: 'Yogurt Natural',
      quantity: 4,
      category: 'Lácteos',
      expiry_date: addDays(8)
    },
    {
      user_id: testUserId,
      name: 'Manzanas',
      quantity: 6,
      category: 'Frutas',
      expiry_date: addDays(10)
    },
    {
      user_id: testUserId,
      name: 'Pollo',
      quantity: 1,
      category: 'Proteínas',
      expiry_date: addDays(3)
    },
    {
      user_id: testUserId,
      name: 'Huevos',
      quantity: 12,
      category: 'Proteínas',
      expiry_date: addDays(15)
    },
    {
      user_id: testUserId,
      name: 'Arroz',
      quantity: 1,
      category: 'Granos',
      expiry_date: addDays(180)
    },
    {
      user_id: testUserId,
      name: 'Tomates',
      quantity: 5,
      category: 'Verduras',
      expiry_date: addDays(6)
    },
    {
      user_id: testUserId,
      name: 'Lechuga',
      quantity: 1,
      category: 'Verduras',
      expiry_date: addDays(4)
    }
  ]);

  console.log('✅ Seeds ejecutados correctamente');
}
