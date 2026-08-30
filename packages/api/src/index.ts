import express, { Express } from 'express';
import cors from 'cors';
import { config, validateConfig } from './config';
import { initializeSupabase } from '@plate/database';
import { errorHandler } from './middleware/errorHandler';
import officerRoutes from './routes/officers';
import foilRoutes from './routes/foil';
import agentRoutes from './routes/agent';
import langflowRoutes from './routes/langflow';
import { listSkills } from '@plate/skill-packs';

// Validate required environment variables
validateConfig();

// Initialize Supabase when configured (agent chat works without it)
if (config.supabase.url && config.supabase.anonKey) {
  initializeSupabase(config.supabase.url, config.supabase.anonKey);
} else {
  console.warn(
    'Supabase not configured — officer/FOIL DB routes unavailable. Educational agent skills still work.'
  );
}

const app: Express = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: config.environment,
    skillPacks: listSkills().length,
    agent: '/api/agent',
    langflow: {
      enabled: config.langflow.enabled,
      baseUrl: config.langflow.baseUrl,
      path: '/api/langflow',
    },
  });
});

// API Routes
app.use('/api/officers', officerRoutes);
app.use('/api/foil', foilRoutes);
app.use('/api/agent', agentRoutes);
app.use('/api/langflow', langflowRoutes);

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
