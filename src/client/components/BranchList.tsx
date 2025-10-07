import { BranchSubmission } from '@shared/story';

export type BranchListProps = {
  submissions: BranchSubmission[];
  onVote: (submissionId: string, delta: 1 | -1) => void;
};

const BranchList = ({ submissions, onVote }: BranchListProps) => {
  if (submissions.length === 0) {
    return <p className="branch-list__empty">No branches yet. Be the first to add to the story!</p>;
  }

  return (
    <ul className="branch-list" aria-label="Branch submissions awaiting votes">
      {submissions.map((submission: BranchSubmission) => (
        <li key={submission.id} className="branch-card" data-votes={submission.votes}>
          <div className="branch-card__glow" aria-hidden="true" />

          <div className="branch-card__votes" aria-live="polite">
            <button
              type="button"
              className="branch-card__vote branch-card__vote--up"
              onClick={() => onVote(submission.id, 1)}
              aria-label={`Upvote branch by u/${submission.authorId}`}
            >
              boost
            </button>
            <span className="branch-card__tally">{submission.votes}</span>
            <button
              type="button"
              className="branch-card__vote branch-card__vote--down"
              onClick={() => onVote(submission.id, -1)}
              aria-label={`Downvote branch by u/${submission.authorId}`}
            >
              mute
            </button>
          </div>

          <article className="branch-card__body">
            <header className="branch-card__meta">
              <span className="branch-card__author">u/{submission.authorId}</span>
            </header>
            <p className="branch-card__text">{submission.branchText}</p>
            {submission.sourceCommentUrl && (
              <a
                className="branch-card__source"
                href={submission.sourceCommentUrl}
                target="_blank"
                rel="noreferrer"
              >
                View source comment ↗
              </a>
            )}
          </article>
        </li>
      ))}
    </ul>
  );
};

export default BranchList;
