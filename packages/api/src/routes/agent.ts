import { Router, type Router as ExpressRouter, Request, Response, NextFunction } from 'express';
import { listSkills, CONSENT_VERSION } from '@plate/skill-packs';
import { AgentEngine } from '../services/agent-engine';
import { APIError } from '../middleware/errorHandler';

const router: ExpressRouter = Router();

/**
 * GET /api/agent/skills
 * List educational skill packs (claude-for-legal adapted).
 */
router.get('/skills', (_req: Request, res: Response) => {
  res.json({
    consentVersion: CONSENT_VERSION,
    skills: listSkills(),
    note: 'Skills are educational only — not legal advice. Adapted from anthropics/claude-for-legal patterns.',
  });
});

/**
 * POST /api/agent/chat
 * Body: { message, surface?, consentVersion?, history? }
 */
router.post('/chat', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { message, surface, consentVersion, history } = req.body || {};

    if (!message || typeof message !== 'string') {
      throw new APIError(400, 'message (string) is required');
    }

    const result = await AgentEngine.chat({
      message,
      surface,
      consentVersion: consentVersion || CONSENT_VERSION,
      history: Array.isArray(history) ? history : [],
    });

    res.json({
      ...result,
      llmAvailable: AgentEngine.hasApiKey(),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/agent/health
 */
router.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    llmConfigured: AgentEngine.hasApiKey(),
    consentVersion: CONSENT_VERSION,
    skillCount: listSkills().length,
  });
});

export default router;
