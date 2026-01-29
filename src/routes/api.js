import express from 'express';
import AuthController from '../controllers/AuthController.js';
import ArticlesController from '../controllers/ArticlesController.js';
import RecipeController from '../controllers/recipeController.js';
import StatisticsController from '../controllers/statisticsController.js';
import ReceiptService from '../services/receiptService.js';
import Article from '../models/Article.js';

const router = express.Router();

// ==================== AUTH ROUTES ====================
router.post('/auth/register', AuthController.register);
router.post('/auth/login', AuthController.login);
router.get('/auth/profile/:userId', AuthController.getProfile);

// ==================== ARTICLES ROUTES ====================
router.get('/articles', ArticlesController.index);
router.get('/articles/critical', ArticlesController.getCritical);
router.get('/articles/:id', ArticlesController.show);
router.post('/articles', ArticlesController.store);
router.put('/articles/:id', ArticlesController.update);
router.delete('/articles/:id', ArticlesController.destroy);

// ==================== STATISTICS ROUTES ====================
router.get('/statistics', StatisticsController.getStats);
router.post('/statistics/consumption', StatisticsController.recordConsumption);

// ==================== LEGACY ROUTES (Compatibilidad) ====================
// Rutas /api/inventory - Mantener compatibilidad con frontend actual
router.get('/inventory', ArticlesController.index);
router.post('/inventory', ArticlesController.store);
router.put('/inventory/:id', ArticlesController.update);
router.delete('/inventory/:id', ArticlesController.destroy);

// POST /api/process-receipt - Procesar boleta con OCR
router.post('/process-receipt', async (req, res) => {
  try {
    const { rawText, userId } = req.body;
    
    if (!rawText || !userId) {
      return res.status(400).json({ 
        success: false,
        error: "rawText y userId son requeridos" 
      });
    }

    console.log("📝 Procesando texto de boleta con Groq...");

    // 1. Procesar boleta con el servicio
    const itemsToInsert = await ReceiptService.processReceipt(rawText, userId);

    // 2. Insertar en base de datos
    const data = await Article.createMany(itemsToInsert);

    console.log(`✅ ${itemsToInsert.length} productos guardados correctamente.`);
    
    res.json({
      success: true,
      data: data,
      count: data.length
    });

  } catch (error) {
    console.error("Error procesando boleta:", error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// ==================== RECIPE ROUTES ====================
router.post('/generate-recipe', RecipeController.generate);
router.post('/recipe', RecipeController.generate); // Alias

export default router;