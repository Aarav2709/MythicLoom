export type Chapter = {
  id: string;
  dayKey: string;
  prompt: string;
  branchText: string;
  authorId: string;
  sourceCommentUrl?: string;
  submittedAt: string;
  votes: number;
};

export type BranchSubmission = {
  id: string;
  dayKey: string;
  prompt: string;
  authorId: string;
  branchText: string;
  sourceCommentUrl?: string;
  submittedAt: string;
  votes: number;
};

export type StoryState = {
  activeDayKey: string;
  prompt: string;
  deadline: string;
  canonicalChapters: Chapter[];
  submissions: BranchSubmission[];
};

export type SubmitBranchRequest = {
  authorId: string;
  branchText: string;
  sourceCommentUrl?: string;
};

export type SubmitBranchResponse = {
  submission: BranchSubmission;
  storyState: StoryState;
};

export type VoteRequest = {
  submissionId: string;
  delta: 1 | -1;
  voterId: string;
};

export type VoteResponse = {
  submission: BranchSubmission;
  storyState: StoryState;
};

export type FinalizeRequest = {
  adminToken: string;
  nextPrompt: string;
  nextDeadline: string;
};

export type FinalizeResponse = {
  winningSubmission?: Chapter;
  storyState: StoryState;
};

export const MAX_BRANCH_LENGTH = 800;
export const MIN_BRANCH_LENGTH = 20;
