import express from 'express';
import mainRouter from './router.js';

const router = express.Router();

// Le decimos al Router: "Todo lo que venga, pásalo a mainRouter"
router.use('/', mainRouter);

export default router;