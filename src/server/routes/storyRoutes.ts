import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { StoryService } from '../storyService';
import {
  FinalizeRequest,
  MAX_BRANCH_LENGTH,
  MIN_BRANCH_LENGTH,
  SubmitBranchRequest,
  VoteRequest
} from '@shared/story';

const submitSchema = z.object({
  authorId: z.string().min(2).max(100),
  branchText: z
    .string()
    .min(MIN_BRANCH_LENGTH, `Entry must be at least ${MIN_BRANCH_LENGTH} characters.`)
    .max(MAX_BRANCH_LENGTH, `Entry must be at most ${MAX_BRANCH_LENGTH} characters.`),
  sourceCommentUrl: z.string().url().optional()
});

const voteSchema = z.object({
  submissionId: z.string().uuid(),
  delta: z.union([z.literal(1), z.literal(-1)]),
  voterId: z.string().min(2).max(100)
});

const finalizeSchema = z.object({
  adminToken: z.string().min(10),
  nextPrompt: z.string().min(10).max(300),
  nextDeadline: z.string().refine((value: string) => !Number.isNaN(Date.parse(value)), {
    message: 'nextDeadline must be an ISO string.'
  })
});

const sendError = (response: Response, error: unknown, status = 400) => {
  if (error instanceof Error) {
    response.status(status).json({ error: error.message });
    return;
  }
  response.status(status).json({ error: 'Unknown error.' });
};

export const createStoryRouter = (service: StoryService): Router => {
  const router = Router();

  router.get('/state', (_request: Request, response: Response) => {
    response.json(service.getStoryState());
  });

  router.get('/timeline', (_request: Request, response: Response) => {
    response.json({ chapters: service.getStoryState().canonicalChapters });
  });

  router.post('/submit', (request: Request, response: Response) => {
    const parseResult = submitSchema.safeParse(request.body);
    if (!parseResult.success) {
      response.status(400).json({ error: parseResult.error.flatten() });
      return;
    }

    try {
      const payload = parseResult.data as SubmitBranchRequest;
      const result = service.submitBranch(payload);
      response.status(201).json(result);
    } catch (error) {
      sendError(response, error);
    }
  });

  router.post('/vote', (request: Request, response: Response) => {
    const parseResult = voteSchema.safeParse(request.body);
    if (!parseResult.success) {
      response.status(400).json({ error: parseResult.error.flatten() });
      return;
    }

    try {
      const payload = parseResult.data as VoteRequest;
      const result = service.vote(payload);
      response.json(result);
    } catch (error) {
      sendError(response, error);
    }
  });

  router.post('/finalize', (request: Request, response: Response) => {
    const parseResult = finalizeSchema.safeParse(request.body);
    if (!parseResult.success) {
      response.status(400).json({ error: parseResult.error.flatten() });
      return;
    }

    const payload = parseResult.data as FinalizeRequest;
  const adminToken = process.env.MYTHICLOOM_ADMIN_TOKEN;
    if (!adminToken || adminToken !== payload.adminToken) {
      response.status(403).json({ error: 'Forbidden' });
      return;
    }

    try {
      const nextDeadline = new Date(payload.nextDeadline);
      const result = service.finalizeDay(payload.nextPrompt, nextDeadline);
      response.json(result);
    } catch (error) {
      sendError(response, error);
    }
  });

  return router;
};
