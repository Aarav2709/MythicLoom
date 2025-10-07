# MythicLoom

MythicLoom is a Reddit-first, comment-powered choose-your-own adventure game built for Devvit Web. Each day, the community submits and votes on new story branches. The top-voted branch is promoted into canon and a fresh prompt launches the next chapter.

## Features

- 🧠 **Daily prompts** drawn from mod-curated themes to keep quests lively.
- ✍️ **User submissions** via lightweight web client; optional links back to source comments.
- 🗳️ **Vote toggling** with simple anti-spam safeguards (per-player vote ledger).
- 🏆 **Daily finale** endpoint you can schedule via Devvit cron to advance the canonical story.
- 🧾 **Shared TypeScript models** maintained in `src/shared` for strong typing across client and server.

## Getting started

```bash
npm install
```

### Local development

Run the React client and the API side-by-side while iterating:

```bash
npm run dev        # Vite dev server for the client (http://localhost:5173)
npm run dev:server # Express server with in-memory state (http://localhost:4000)
```

### Building for Devvit upload

```bash
npm run build
```

This command produces:

- `dist/client` – static assets for the Devvit webview
- `dist/server` – compiled Express server bundle

### Tests

```bash
npm test
```

The Vitest suite covers the core `StoryService` logic, ensuring submissions, votes, and daily rollovers behave as expected.

### Playtesting on Reddit (Devvit)

1. Authenticate once with your Reddit developer account:

   ```bash
   npm run devvit:login
   ```

2. Build the client and server bundles so `dist/` is up to date:

   ```bash
   npm run build
   ```

3. Launch a live playtest post in your Devvit sandbox subreddit:

   ```bash
   npm run devvit:playtest
   ```

   The Devvit CLI will print a `reddit.com/r/<app>_dev?playtest=<slug>` URL. Open it, click **Launch App**, and verify the MythicLoom UI inside Reddit.

4. When you are ready to submit for review, trigger the launch workflow (after a final build):

   ```bash
   npm run devvit:launch
   ```

   Follow the on-screen prompts to package the app for Reddit’s review queue.

## Environment variables

| Variable                 | Purpose                                                                                                     |
| ------------------------ | ----------------------------------------------------------------------------------------------------------- |
| `MYTHICLOOM_ADMIN_TOKEN` | Shared secret that grants access to `/api/story/finalize`. Set this for cron jobs or manual admin triggers. |
| `PORT`                   | Optional override for the Express server port (default: `4000`).                                            |

Create a `.env` file during local development:

```
MYTHICLOOM_ADMIN_TOKEN=change-me
PORT=4000
```

## Devvit integration notes

- Update `devvit.json` with your subreddit, permissions, and cron preferences before playtesting or launching.
- Schedule `finalizeBranch` via `devvit playtest` to automatically promote the winning branch and seed the next prompt.
- Replace the in-memory store with Devvit Redis or another persistence layer before production. The `StoryService` class can be adapted to load/save state externally.
- For deeper Reddit integration, mirror the canonical chapter and prompt into the daily discussion thread using the Reddit API inside the `/api/story/finalize` handler.

## Roadmap ideas

- ✅ Add moderation queue endpoints to review flagged submissions.
- ✅ Display per-user streaks and badges on the client.
- ✅ Pull prompts from trending subreddit topics automatically.
- ✅ Export the canonical story as Markdown or audio narration for subreddit recaps.

Happy questing! 🎲
