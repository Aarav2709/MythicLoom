import { randomUUID } from 'crypto';
import {
  BranchSubmission,
  Chapter,
  FinalizeResponse,
  MAX_BRANCH_LENGTH,
  MIN_BRANCH_LENGTH,
  StoryState,
  SubmitBranchRequest,
  SubmitBranchResponse,
  VoteRequest,
  VoteResponse
} from '@shared/story';

export type StoryServiceOptions = {
  initialPrompt?: string;
  initialDeadlineMinutes?: number;
};

type ActiveDayState = {
  dayKey: string;
  prompt: string;
  deadline: Date;
  submissions: Map<string, BranchSubmission>;
  userVotes: Map<string, Map<string, 1 | -1>>;
};

const DEFAULT_PROMPT = 'Begin the adventure with an intriguing opening line.';
const DEFAULT_DEADLINE_MINUTES = 24 * 60;

export class StoryService {
  private canonicalChapters: Chapter[] = [];
  private activeDay: ActiveDayState;

  constructor(private readonly options: StoryServiceOptions = {}) {
    this.activeDay = this.createNewDay(
      options.initialPrompt ?? DEFAULT_PROMPT,
      options.initialDeadlineMinutes ?? DEFAULT_DEADLINE_MINUTES
    );
  }

  public getStoryState(): StoryState {
    return {
      activeDayKey: this.activeDay.dayKey,
      prompt: this.activeDay.prompt,
      deadline: this.activeDay.deadline.toISOString(),
      canonicalChapters: [...this.canonicalChapters],
      submissions: [...this.activeDay.submissions.values()].sort(this.sortSubmissions)
    };
  }

  public submitBranch({ authorId, branchText, sourceCommentUrl }: SubmitBranchRequest): SubmitBranchResponse {
    const trimmed = branchText.trim();
    if (!authorId) {
      throw new Error('authorId is required.');
    }
    if (trimmed.length < MIN_BRANCH_LENGTH) {
      throw new Error(`branchText must be at least ${MIN_BRANCH_LENGTH} characters.`);
    }
    if (trimmed.length > MAX_BRANCH_LENGTH) {
      throw new Error(`branchText must be at most ${MAX_BRANCH_LENGTH} characters.`);
    }

    const now = new Date();
    if (now > this.activeDay.deadline) {
      throw new Error('Submissions are closed for the current day.');
    }

    const id = randomUUID();
    const submission: BranchSubmission = {
      id,
      dayKey: this.activeDay.dayKey,
      prompt: this.activeDay.prompt,
      authorId,
      branchText: trimmed,
      sourceCommentUrl: sourceCommentUrl?.trim() || undefined,
      submittedAt: now.toISOString(),
      votes: 0
    };

    this.activeDay.submissions.set(id, submission);

    return {
      submission,
      storyState: this.getStoryState()
    };
  }

  public vote({ submissionId, delta, voterId }: VoteRequest): VoteResponse {
    if (!voterId) {
      throw new Error('voterId is required.');
    }

    const submission = this.activeDay.submissions.get(submissionId);
    if (!submission) {
      throw new Error('Submission not found.');
    }

    const now = new Date();
    if (now > this.activeDay.deadline) {
      throw new Error('Voting is closed for the current day.');
    }

    if (delta !== 1 && delta !== -1) {
      throw new Error('delta must be 1 or -1.');
    }

    const voterMap = this.ensureVoterMap(voterId);
    const previousDelta = voterMap.get(submissionId) ?? 0;
    if (previousDelta === delta) {
      // toggling same vote removes it
      voterMap.delete(submissionId);
      submission.votes -= delta;
    } else {
      voterMap.set(submissionId, delta);
      submission.votes = submission.votes - previousDelta + delta;
    }

    this.activeDay.submissions.set(submissionId, submission);

    return {
      submission,
      storyState: this.getStoryState()
    };
  }

  public finalizeDay(nextPrompt: string, nextDeadline: Date): FinalizeResponse {
    const sorted = [...this.activeDay.submissions.values()].sort(this.sortSubmissions);
    const winningSubmission = sorted[0];

    let chapter: Chapter | undefined;

    if (winningSubmission && winningSubmission.votes > 0) {
      chapter = {
        id: winningSubmission.id,
        dayKey: winningSubmission.dayKey,
        prompt: winningSubmission.prompt,
        authorId: winningSubmission.authorId,
        branchText: winningSubmission.branchText,
        sourceCommentUrl: winningSubmission.sourceCommentUrl,
        submittedAt: winningSubmission.submittedAt,
        votes: winningSubmission.votes
      };
      this.canonicalChapters.push(chapter);
    }

    const sanitizedPrompt = nextPrompt.trim();
    this.activeDay = this.createNewDay(sanitizedPrompt, this.minutesUntil(nextDeadline));

    return {
      winningSubmission: chapter,
      storyState: this.getStoryState()
    };
  }

  public seedCanonical(chapters: Chapter[]): void {
    this.canonicalChapters = chapters
      .map((chapter) => ({ ...chapter }))
      .sort((a, b) => a.dayKey.localeCompare(b.dayKey));
  }

  public seedActiveDay(options: { prompt: string; deadline: Date; submissions?: BranchSubmission[] }): void {
    this.activeDay = {
      dayKey: this.toDayKey(options.deadline),
      prompt: options.prompt,
      deadline: options.deadline,
      submissions: new Map(
        (options.submissions ?? []).map((submission) => [submission.id, { ...submission }])
      ),
      userVotes: new Map()
    };
  }

  private ensureVoterMap(voterId: string): Map<string, 1 | -1> {
    let voterMap = this.activeDay.userVotes.get(voterId);
    if (!voterMap) {
      voterMap = new Map();
      this.activeDay.userVotes.set(voterId, voterMap);
    }
    return voterMap;
  }

  private createNewDay(prompt: string, deadlineMinutes: number): ActiveDayState {
    const now = new Date();
    const deadline = new Date(now.getTime() + deadlineMinutes * 60 * 1000);
    return {
      dayKey: this.toDayKey(now),
      prompt: prompt.trim(),
      deadline,
      submissions: new Map(),
      userVotes: new Map()
    };
  }

  private minutesUntil(deadline: Date): number {
    const now = new Date();
    const diffMs = deadline.getTime() - now.getTime();
    return Math.max(Math.ceil(diffMs / (60 * 1000)), 60);
  }

  private toDayKey(date: Date): string {
    return date.toISOString().slice(0, 10);
  }

  private sortSubmissions(a: BranchSubmission, b: BranchSubmission): number {
    if (a.votes === b.votes) {
      return new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime();
    }
    return b.votes - a.votes;
  }
}
