import knex from '../config/database.js';
import { estimateCalories } from '../utils/caloriesDatabase.js';

class StatisticsController {
  /**
   * Obtener estadísticas del usuario
   */
  static async getStats(req, res) {
    try {
      const { userId } = req.query;

      if (!userId) {
        return res.status(400).json({ success: false, error: 'userId requerido' });
      }

      // 1. Información del usuario
      const user = await knex('users').where({ id: userId }).first();
      
      if (!user) {
        return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
      }

      // Calcular días en la app
      const daysInApp = Math.floor((new Date() - new Date(user.first_login || user.created_at)) / (1000 * 60 * 60 * 24));

      // 2. Productos actuales en inventario
      const totalProducts = await knex('articles').where({ user_id: userId }).count('* as count').first();
      const criticalProducts = await knex('articles')
        .where({ user_id: userId })
        .whereRaw('expiry_date <= CURRENT_DATE + INTERVAL \'7 days\'')
        .count('* as count')
        .first();

      // 3. Historial de consumo (último mes)
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

      const consumptionHistory = await knex('consumption_history')
        .where({ user_id: userId })
        .where('consumed_at', '>=', oneMonthAgo)
        .select('*');

      // Calcular calorías
      const today = new Date().toISOString().split('T')[0];
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const caloriesToday = await knex('consumption_history')
        .where({ user_id: userId, action: 'consumed' })
        .whereRaw('DATE(consumed_at) = ?', [today])
        .sum('calories as total')
        .first();

      const caloriesWeek = await knex('consumption_history')
        .where({ user_id: userId, action: 'consumed' })
        .whereRaw('DATE(consumed_at) >= ?', [weekAgo])
        .sum('calories as total')
        .first();

      const caloriesMonth = await knex('consumption_history')
        .where({ user_id: userId, action: 'consumed' })
        .where('consumed_at', '>=', oneMonthAgo)
        .sum('calories as total')
        .first();

      // 4. Productos más consumidos
      const topConsumed = await knex('consumption_history')
        .where({ user_id: userId, action: 'consumed' })
        .select('product_name', 'category')
        .count('* as times_consumed')
        .sum('calories as total_calories')
        .groupBy('product_name', 'category')
        .orderBy('times_consumed', 'desc')
        .limit(5);

      // 5. Productos menos consumidos (que estén en inventario)
      const allProducts = await knex('articles')
        .where({ user_id: userId })
        .select('name as product_name', 'category');

      const consumedProductNames = topConsumed.map(p => p.product_name);
      const leastConsumed = allProducts
        .filter(p => !consumedProductNames.includes(p.product_name))
        .slice(0, 5)
        .map(p => ({
          product_name: p.product_name,
          category: p.category,
          times_consumed: 0,
          consumption_rate: 0,
          trend: 'down'
        }));

      // 6. Productos desperdiciados
      const wastedProducts = await knex('consumption_history')
        .where({ user_id: userId, action: 'wasted' })
        .select('product_name', 'category')
        .count('* as times_wasted')
        .groupBy('product_name', 'category')
        .orderBy('times_wasted', 'desc')
        .limit(5);

      // 7. Calcular tasa de desperdicio
      const totalConsumed = user.total_products_consumed || 0;
      const totalWasted = user.total_products_wasted || 0;
      const wasteRate = totalConsumed + totalWasted > 0 
        ? Math.round((totalWasted / (totalConsumed + totalWasted)) * 100) 
        : 0;

      const stats = {
        user: {
          name: user.name,
          email: user.email,
          days_in_app: daysInApp,
          total_added: user.total_products_added || 0,
          total_consumed: totalConsumed,
          total_wasted: totalWasted
        },
        inventory: {
          total_products: parseInt(totalProducts.count),
          critical_products: parseInt(criticalProducts.count),
          waste_rate: wasteRate
        },
        calories: {
          today: parseInt(caloriesToday?.total || 0),
          week: parseInt(caloriesWeek?.total || 0),
          month: parseInt(caloriesMonth?.total || 0),
          daily_average: Math.round((parseInt(caloriesMonth?.total || 0)) / 30)
        },
        top_consumed: topConsumed.map(p => ({
          name: p.product_name,
          category: p.category,
          times_consumed: parseInt(p.times_consumed),
          total_calories: parseInt(p.total_calories || 0),
          consumption_rate: Math.min(100, parseInt(p.times_consumed) * 10),
          trend: 'up'
        })),
        least_consumed: leastConsumed,
        wasted_products: wastedProducts.map(p => ({
          name: p.product_name,
          category: p.category,
          times_wasted: parseInt(p.times_wasted)
        })),
        recommendations: this.generateRecommendations(topConsumed, wastedProducts, wasteRate)
      };

      res.json({ success: true, data: stats });

    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      res.status(500).json({ success: false, error: 'Error al obtener estadísticas' });
    }
  }

  /**
   * Registrar consumo de un producto
   */
  static async recordConsumption(req, res) {
    try {
      const { userId, productName, category, quantity, calories, action } = req.body;

      if (!userId || !productName || !action) {
        return res.status(400).json({ 
          success: false, 
          error: 'userId, productName y action son requeridos' 
        });
      }

      // Insertar en historial
      const caloriesEstimated = calories || estimateCalories(productName, quantity || 1);
      
      await knex('consumption_history').insert({
        user_id: userId,
        product_name: productName,
        category: category || 'General',
        quantity: quantity || 1,
        calories: caloriesEstimated,
        action: action // 'consumed' o 'wasted'
      });

      // Actualizar contadores en usuario
      if (action === 'consumed') {
        await knex('users').where({ id: userId }).increment('total_products_consumed', 1);
      } else if (action === 'wasted') {
        await knex('users').where({ id: userId }).increment('total_products_wasted', 1);
      }

      res.json({ success: true, message: 'Consumo registrado' });

    } catch (error) {
      console.error('Error registrando consumo:', error);
      res.status(500).json({ success: false, error: 'Error al registrar consumo' });
    }
  }

  /**
   * Generar recomendaciones basadas en patrones
   */
  static generateRecommendations(topConsumed, wastedProducts, wasteRate) {
    const recommendations = [];

    if (wasteRate > 20) {
      recommendations.push({
        type: 'warning',
        message: `Tu tasa de desperdicio es del ${wasteRate}%. Intenta comprar menos cantidad de productos que no consumes.`
      });
    }

    if (topConsumed.length > 0) {
      recommendations.push({
        type: 'success',
        message: `${topConsumed[0].product_name} es tu producto favorito. Asegúrate de tenerlo siempre en stock.`
      });
    }

    if (wastedProducts.length > 0) {
      recommendations.push({
        type: 'info',
        message: `Evita comprar ${wastedProducts[0].product_name}, has desperdiciado este producto ${wastedProducts[0].times_wasted} veces.`
      });
    }

    return recommendations;
  }
}

export default StatisticsController;
