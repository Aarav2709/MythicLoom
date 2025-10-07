import { Chapter } from '@shared/story';

export type StoryTimelineProps = {
  chapters: Chapter[];
};

const StoryTimeline = ({ chapters }: StoryTimelineProps) => {
  if (chapters.length === 0) {
    return (
      <section className="chronicle chronicle--empty">
        <header className="chronicle__header">
          <span className="chronicle__eyebrow">Canon Log</span>
          <h2>Chronicle queue</h2>
        </header>
        <p className="chronicle__placeholder">The chronicle is ready for its very first entry.</p>
      </section>
    );
  }

  return (
    <section className="chronicle" aria-labelledby="chronicle-heading">
      <header className="chronicle__header">
        <span className="chronicle__eyebrow">Canon Log</span>
        <h2 id="chronicle-heading">Chapter chronicle</h2>
        <p>Scroll through every victorious branch in order.</p>
      </header>
      <ol className="chronicle__list">
        {chapters.map((chapter, index) => (
          <li key={chapter.id} className="chronicle__item">
            <div className="chronicle__marker" aria-hidden="true">
              <span>{String(index + 1).padStart(2, '0')}</span>
            </div>
            <article className="chronicle__entry">
              <header>
                <span className="chronicle__day">Day {chapter.dayKey}</span>
                <span className="chronicle__author">u/{chapter.authorId}</span>
              </header>
              <p>{chapter.branchText}</p>
            </article>
          </li>
        ))}
      </ol>
    </section>
  );
};

export default StoryTimeline;
