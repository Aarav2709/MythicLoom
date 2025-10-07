import { beforeEach, describe, expect, it } from 'vitest';
import { StoryService } from '../storyService';

const futureDate = () => new Date(Date.now() + 60 * 60 * 1000);

describe('StoryService', () => {
  let service: StoryService;

  beforeEach(() => {
    service = new StoryService({ initialPrompt: 'Test prompt', initialDeadlineMinutes: 120 });
  });

  it('creates a submission and returns updated story state', () => {
    const { submission, storyState } = service.submitBranch({
      authorId: 'test_user',
      branchText: 'This is a brave new branch of the story that thrills everyone.',
      sourceCommentUrl: 'https://reddit.com/r/test/comments/1'
    });

    expect(submission.authorId).toBe('test_user');
    expect(storyState.submissions).toHaveLength(1);
    expect(storyState.submissions[0].branchText).toContain('brave new branch');
  });

  it('tracks votes with toggle support', () => {
    const { submission } = service.submitBranch({
      authorId: 'storyteller',
      branchText: 'Adventure awaits beyond the crimson canyon.',
      sourceCommentUrl: undefined
    });

    const voted = service.vote({ submissionId: submission.id, delta: 1, voterId: 'reader1' });
    expect(voted.submission.votes).toBe(1);

    const toggled = service.vote({ submissionId: submission.id, delta: 1, voterId: 'reader1' });
    expect(toggled.submission.votes).toBe(0);

    const downvoted = service.vote({ submissionId: submission.id, delta: -1, voterId: 'reader1' });
    expect(downvoted.submission.votes).toBe(-1);
  });

  it('finalizes the day and promotes winning submission to canonical story', () => {
    const first = service.submitBranch({
      authorId: 'heroic',
      branchText: 'Heroes gather at dawn ready to defend their cause.',
      sourceCommentUrl: undefined
    }).submission;

    service.vote({ submissionId: first.id, delta: 1, voterId: 'reader1' });
    service.vote({ submissionId: first.id, delta: 1, voterId: 'reader2' });

    const finalizeResult = service.finalizeDay('Next adventure prompt', futureDate());

    expect(finalizeResult.winningSubmission?.branchText).toContain('Heroes gather');
    expect(finalizeResult.storyState.canonicalChapters).toHaveLength(1);
    expect(finalizeResult.storyState.canonicalChapters[0].authorId).toBe('heroic');
    expect(finalizeResult.storyState.prompt).toBe('Next adventure prompt');
  });
});
