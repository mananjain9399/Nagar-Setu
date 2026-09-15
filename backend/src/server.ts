import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import dashboardRoutes from './routes/dashboardRoutes';
import complaintRoutes from './routes/complaintRoutes';
import reviewRoutes from './routes/reviewRoutes';
import importRoutes from './routes/importRoutes';
import taxonomyRoutes from './routes/taxonomyRoutes';
import gazetteerRoutes from './routes/gazetteerRoutes';
import localityRoutes from './routes/localityRoutes';
import dataQualityRoutes from './routes/dataQualityRoutes';
import aiRoutes from './routes/aiRoutes';
import acknowledgementRoutes from './routes/acknowledgementRoutes';
import analyticsRoutes from './routes/analyticsRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logger
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (process.env.NODE_ENV !== 'test') {
      console.log(`[API] ${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
    }
  });
  next();
});

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'HEALTHY',
    service: 'Bhopal Civic Complaint Intelligence Engine (Operator Backend)',
    phase: '1-6 Complete',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    datasetMode: 'SYNTHETIC_DEVELOPMENT_ONLY',
  });
});

// API Routes
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/complaints', reviewRoutes);
app.use('/api/import', importRoutes);
app.use('/api', taxonomyRoutes);
app.use('/api/gazetteer', gazetteerRoutes);
app.use('/api/locality', localityRoutes);
app.use('/api/data-quality', dataQualityRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/acknowledgement', acknowledgementRoutes);
app.use('/api/analytics', analyticsRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `API endpoint '${req.method} ${req.originalUrl}' not found.`,
  });
});

// Global error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('[Server Error]', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

app.listen(PORT, () => {
  console.log(`================================================================`);
  console.log(`  BHOPAL CIVIC COMPLAINT INTELLIGENCE ENGINE - OPERATOR BACKEND `);
  console.log(`  Phase 2: Taxonomy, Gazetteer, Normalisation, Data Quality     `);
  console.log(`  Port: ${PORT} | Mode: ${process.env.NODE_ENV || 'development'}`);
  console.log(`================================================================`);
});

export default app;
