import { useMemo } from 'react';
import { Chapter } from '@shared/story';

type ConstellationNode = {
  chapter: Chapter;
  x: number;
  y: number;
  emphasis: boolean;
};

export type StoryConstellationProps = {
  chapters: Chapter[];
};

const StoryConstellation = ({ chapters }: StoryConstellationProps) => {
  const nodes = useMemo<ConstellationNode[]>(() => {
    if (chapters.length === 0) {
      return [];
    }

    const radius = Math.min(120, 60 + chapters.length * 10);
    return chapters.map((chapter, index) => {
      const angle = ((index + 1) / chapters.length) * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      const emphasis = index === chapters.length - 1;
      return { chapter, x, y, emphasis };
    });
  }, [chapters]);

  return (
    <section className="constellation" aria-labelledby="constellation-heading">
      <header className="constellation__header">
        <h2 id="constellation-heading">Canon orbit</h2>
        <p>Each completed chapter lights another point in the ring.</p>
      </header>

      <div className="constellation__canvas" role="presentation">
        <div className="constellation__core" aria-hidden="true" />

        {nodes.length === 0 ? (
          <p className="constellation__empty">Complete a chapter to populate the orbit.</p>
        ) : (
          nodes.map(({ chapter, x, y, emphasis }) => (
            <div
              key={chapter.id}
              className={['constellation__node', emphasis ? 'constellation__node--prime' : '']
                .filter(Boolean)
                .join(' ')}
              style={{
                transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`
              }}
            >
              <span className="constellation__node-day">Day {chapter.dayKey}</span>
              <span className="constellation__node-author">u/{chapter.authorId}</span>
            </div>
          ))
        )}
      </div>
    </section>
  );
};

export default StoryConstellation;
