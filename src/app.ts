import express from 'express';
import { requestLogger } from './shared/middleware/logger';
import { errorHandler } from './shared/middleware/error';
import healthRoutes from './modules/health/health.routes';

const app = express();

app.use(express.json());
app.use(requestLogger);

app.use('/api/health', healthRoutes);

app.use(errorHandler);

export default app;
