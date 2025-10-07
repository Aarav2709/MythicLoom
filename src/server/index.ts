import express, { Request, Response } from 'express';
import cors from 'cors';
import { config as loadEnv } from 'dotenv';
import { createStoryRouter } from './routes/storyRoutes';
import { StoryService } from './storyService';

loadEnv();

const app = express();
const storyService = new StoryService();

app.use(cors({ origin: true }));
app.use(express.json());
app.use('/api/story', createStoryRouter(storyService));
app.get('/healthz', (_request: Request, response: Response) => response.json({ ok: true }));

const port = Number(process.env.PORT ?? 4000);

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
  console.log(`[mythicloom] server listening on port ${port}`);
  });
}

export { app, storyService };
