import express from 'express';
import cors from 'cors';
import routes from './routes/index.js';
import { errorHandler } from './middlewares/errorHandler.js';

const app = express();

// Middlewares Globales
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas Base
app.use('/api', routes);

// Middleware de Manejo de Errores (Siempre al final)
app.use(errorHandler);

export default app;