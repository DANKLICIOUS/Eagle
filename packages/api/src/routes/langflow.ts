import { Router, type Router as ExpressRouter, Request, Response, NextFunction } from 'express';
import { LangflowClient, skillFlowMap } from '../services/langflow-client';
import { config } from '../config';
import { APIError } from '../middleware/errorHandler';
import { listSkills } from '@plate/skill-packs';

const router: ExpressRouter = Router();

/**
 * GET /api/langflow/health
 */
router.get('/health', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const health = await LangflowClient.health();
    res.json({
      ...health,
      preferOverAnthropic: config.langflow.preferOverAnthropic,
      uiUrl: config.langflow.uiUrl,
      mappedFlows: LangflowClient.listMappedFlows(),
      skillCatalog: listSkills().map((s) => s.id),
    });
  } catch (e) {
    next(e);
  }
});

/**
 * GET /api/langflow/flows
 * Mapped Eagle skill → Langflow flow IDs (not full Langflow inventory).
 */
router.get('/flows', (_req: Request, res: Response) => {
  res.json({
    map: skillFlowMap(),
    flows: LangflowClient.listMappedFlows(),
    note: 'Assign flow UUIDs via LANGFLOW_FLOW_* env vars or LANGFLOW_SKILL_FLOW_MAP JSON.',
  });
});

/**
 * POST /api/langflow/run
 * Body: { skillId?: string, flowId?: string, message: string, sessionId?: string }
 */
router.post('/run', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { skillId, flowId, message, sessionId } = req.body || {};
    if (!message || typeof message !== 'string') {
      throw new APIError(400, 'message (string) is required');
    }
    if (!LangflowClient.isConfigured()) {
      throw new APIError(503, 'Langflow is not enabled. Set LANGFLOW_ENABLED=true and LANGFLOW_BASE_URL.');
    }

    let result;
    if (flowId) {
      result = await LangflowClient.runFlow(String(flowId), message, { sessionId });
    } else if (skillId) {
      result = await LangflowClient.runSkillFlow(String(skillId), message, sessionId);
    } else {
      throw new APIError(400, 'Provide skillId or flowId');
    }

    if (!result.ok) {
      res.status(502).json(result);
      return;
    }
    res.json(result);
  } catch (e) {
    next(e);
  }
});

export default router;
