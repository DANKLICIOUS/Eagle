import express from 'express';
import cors from 'cors';
import { config, validateConfig } from './config';
import { initializeSupabase } from '@plate/database';
import { errorHandler } from './middleware/errorHandler';
import officerRoutes from './routes/officers';
import foilRoutes from './routes/foil';

// Validate required environment variables
validateConfig();

// Initialize Supabase client
initializeSupabase(config.supabase.url, config.supabase.anonKey);

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: config.environment,
  });
});

// API Routes
app.use('/api/officers', officerRoutes);
app.use('/api/foil', foilRoutes);

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`PLATE API running on port ${PORT}`);
  console.log(`Environment: ${config.environment}`);
});

export default app;

// Also export for use as a library
export * from "./services";
export * from "./utils";
