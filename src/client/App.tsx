import { useCallback, useEffect, useMemo, useState } from 'react';
import BranchList from './components/BranchList';
import SubmissionForm from './components/SubmissionForm';
import StoryConstellation from './components/StoryConstellation';
import DailyStats, { DailyStat } from './components/DailyStats';
import {
  BranchSubmission,
  MAX_BRANCH_LENGTH,
  MIN_BRANCH_LENGTH,
  StoryState,
  SubmitBranchResponse,
  VoteResponse
} from '@shared/story';

const PLAYER_STORAGE_KEY = 'mythicloom:playerId';

const ensurePlayerId = (): string => {
  const existing = localStorage.getItem(PLAYER_STORAGE_KEY);
  if (existing) return existing;
  const newId = crypto.randomUUID();
  localStorage.setItem(PLAYER_STORAGE_KEY, newId);
  return newId;
};

const App = () => {
  const [storyState, setStoryState] = useState<StoryState | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [playerId, setPlayerId] = useState<string>('');

  useEffect(() => {
    setPlayerId(ensurePlayerId());
  }, []);

  const fetchState = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const response = await fetch('/api/story/state');
      if (!response.ok) {
        throw new Error('Failed to load story state');
      }
      const data: StoryState = await response.json();
      setStoryState(data);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unexpected error.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchState();
    const interval = window.setInterval(fetchState, 30000);
    return () => window.clearInterval(interval);
  }, [fetchState]);

  const handleSubmit = useCallback(
    async ({ branchText }: { branchText: string }) => {
      if (!storyState) {
        throw new Error('Story state not ready yet.');
      }

      const response = await fetch('/api/story/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ branchText, authorId: playerId })
      });

      if (!response.ok) {
        const errorPayload = await response.json().catch(() => ({}));
        throw new Error(errorPayload.error ?? 'Unable to submit branch.');
      }

      const data: SubmitBranchResponse = await response.json();
      setStoryState(data.storyState);
    },
    [playerId, storyState]
  );

  const handleVote = useCallback(
    async (submissionId: string, delta: 1 | -1) => {
      const response = await fetch('/api/story/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submissionId, delta, voterId: playerId })
      });

      if (!response.ok) {
        const errorPayload = await response.json().catch(() => ({}));
        throw new Error(errorPayload.error ?? 'Unable to register vote.');
      }

      const data: VoteResponse = await response.json();
      setStoryState(data.storyState);
    },
    [playerId]
  );

  const activeBranches = useMemo(() => storyState?.submissions ?? [], [storyState]);

  const dailyStats = useMemo<DailyStat[]>(() => {
    if (!storyState) {
      return [];
    }

    const topBranch = storyState.submissions.reduce<BranchSubmission | null>((current, submission) => {
      if (!current || submission.votes > current.votes) {
        return submission;
      }
      return current;
    }, null);

    const topVotes = topBranch?.votes ?? 0;
    const positiveCount = storyState.submissions.filter((submission) => submission.votes > 0).length;
    const latestChapter =
      storyState.canonicalChapters[storyState.canonicalChapters.length - 1] ?? null;

    return [
      {
        label: 'Branches in play',
        value: String(storyState.submissions.length),
        caption:
          positiveCount > 0
            ? `${positiveCount} tracking positive votes.`
            : 'Cast the first vote to spark momentum.'
      },
      {
        label: 'Top vote',
        value: topVotes > 0 ? `+${topVotes}` : '—',
        caption:
          topVotes > 0 && topBranch
            ? `u/${topBranch.authorId} currently leads.`
            : 'No leader yet — your vote decides.'
      },
      {
        label: 'Canon size',
        value: String(storyState.canonicalChapters.length),
        caption: latestChapter
          ? `Latest: Day ${latestChapter.dayKey} · u/${latestChapter.authorId}`
          : 'Canon will appear once a branch wins.'
      }
    ];
  }, [storyState]);

  return (
    <div className="app-root">
      <div className="app-shell">
        <header className="top-bar">
          <div className="top-bar__title">
            <h1>MythicLoom</h1>
            {storyState && <span>Today&apos;s prompt · {storyState.prompt}</span>}
          </div>
          <button type="button" className="top-bar__refresh" onClick={fetchState}>
            Refresh
          </button>
        </header>

        <main className="content">
          {errorMessage && <p className="system-message system-message--error">{errorMessage}</p>}
          {isLoading && <p className="system-message">Loading story state…</p>}

          {storyState ? (
            <>
              <div className="overview">
                <StoryConstellation chapters={storyState.canonicalChapters} />
                <DailyStats stats={dailyStats} />
              </div>

              <section className="board">
                <div className="board__column board__column--vote">
                  <header className="board__header">
                    <h2>Vote on a branch</h2>
                  </header>
                  <BranchList submissions={activeBranches} onVote={handleVote} />
                </div>

                <div className="board__column board__column--submit">
                  <header className="board__header">
                    <h2>Submit a branch</h2>
                    <p>Write your continuation and send it for voting.</p>
                  </header>
                  <SubmissionForm
                    prompt={storyState.prompt}
                    minLength={MIN_BRANCH_LENGTH}
                    maxLength={MAX_BRANCH_LENGTH}
                    onSubmit={handleSubmit}
                  />
                </div>
              </section>
            </>
          ) : (
            <section className="content__placeholder">
              <p>Summoning the latest telemetry…</p>
            </section>
          )}
        </main>

      </div>
    </div>
  );
};

export default App;
