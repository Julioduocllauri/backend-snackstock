import express from 'express';
import apiRoutes from './api.js';

const router = express.Router();

// Documentación de la API
router.get('/', (req, res) => {
  res.json({
    message: 'SnackStock API',
    version: '2.0.0',
    endpoints: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        profile: 'GET /api/auth/profile/:userId'
      },
      articles: {
        list: 'GET /api/articles?userId=xxx',
        show: 'GET /api/articles/:id',
        create: 'POST /api/articles',
        update: 'PUT /api/articles/:id',
        delete: 'DELETE /api/articles/:id',
        critical: 'GET /api/articles/critical?userId=xxx'
      },
      recipes: {
        generate: 'POST /api/generate-recipe'
      },
      receipt: {
        process: 'POST /api/process-receipt'
      }
    }
  });
});

// Usar las rutas de la API
router.use('/', apiRoutes);

export default router;
