/**
 * Seed para datos de prueba de estadísticas
 */

export const seed = async function(knex) {
  // 1. Obtener el usuario test
  const testUser = await knex('users').where({ email: 'test@snackstock.com' }).first();
  
  if (!testUser) {
    console.log('⚠️ Usuario test no encontrado. Creándolo...');
    const [user] = await knex('users').insert({
      id: knex.raw('gen_random_uuid()'),
      name: 'Usuario Test',
      email: 'test@snackstock.com',
      password: '$2b$10$abcdefghijklmnopqrstuvwxyz123456', // password: test123
      first_login: knex.raw("CURRENT_TIMESTAMP - INTERVAL '45 days'"),
      total_products_added: 150,
      total_products_consumed: 89,
      total_products_wasted: 15
    }).returning('*');
    
    testUser.id = user.id;
  }

  // 2. Limpiar historial anterior
  await knex('consumption_history').where({ user_id: testUser.id }).del();

  // 3. Insertar historial de consumo realista
  const now = new Date();
  const consumptionData = [];

  // Productos más consumidos (últimos 30 días)
  const topProducts = [
    { name: 'Leche', category: 'Lácteos', calories: 60, times: 12 },
    { name: 'Pan', category: 'Panadería', calories: 265, times: 10 },
    { name: 'Huevos', category: 'Proteínas', calories: 155, times: 9 },
    { name: 'Yogurt', category: 'Lácteos', calories: 60, times: 8 },
    { name: 'Pollo', category: 'Carnes', calories: 165, times: 7 },
    { name: 'Arroz', category: 'Despensa', calories: 130, times: 6 }
  ];

  topProducts.forEach(product => {
    for (let i = 0; i < product.times; i++) {
      const daysAgo = Math.floor(Math.random() * 30);
      const consumedAt = new Date(now);
      consumedAt.setDate(consumedAt.getDate() - daysAgo);

      consumptionData.push({
        user_id: testUser.id,
        product_name: product.name,
        category: product.category,
        quantity: 1,
        calories: product.calories,
        action: 'consumed',
        consumed_at: consumedAt
      });
    }
  });

  // Productos desperdiciados
  const wastedProducts = [
    { name: 'Quinoa', category: 'Granos', times: 3 },
    { name: 'Tofu', category: 'Proteínas', times: 2 },
    { name: 'Kale', category: 'Verduras', times: 2 }
  ];

  wastedProducts.forEach(product => {
    for (let i = 0; i < product.times; i++) {
      const daysAgo = Math.floor(Math.random() * 30);
      const wastedAt = new Date(now);
      wastedAt.setDate(wastedAt.getDate() - daysAgo);

      consumptionData.push({
        user_id: testUser.id,
        product_name: product.name,
        category: product.category,
        quantity: 1,
        calories: 0,
        action: 'wasted',
        consumed_at: wastedAt
      });
    }
  });

  // Consumo de hoy (para calorías del día)
  const todayConsumption = [
    { name: 'Pan', category: 'Panadería', calories: 265 },
    { name: 'Leche', category: 'Lácteos', calories: 60 },
    { name: 'Huevos', category: 'Proteínas', calories: 155 },
    { name: 'Yogurt', category: 'Lácteos', calories: 60 }
  ];

  todayConsumption.forEach(product => {
    consumptionData.push({
      user_id: testUser.id,
      product_name: product.name,
      category: product.category,
      quantity: 1,
      calories: product.calories,
      action: 'consumed',
      consumed_at: now
    });
  });

  // 4. Insertar todo el historial
  await knex('consumption_history').insert(consumptionData);

  console.log(`✅ Seed completado: ${consumptionData.length} registros de consumo agregados`);
  console.log(`📊 Usuario: ${testUser.email}`);
  console.log(`🔥 Calorías hoy: ${todayConsumption.reduce((sum, p) => sum + p.calories, 0)} kcal`);
};
