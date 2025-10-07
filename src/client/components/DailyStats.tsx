export type DailyStat = {
  label: string;
  value: string;
  caption?: string;
};

export type DailyStatsProps = {
  stats: DailyStat[];
};

const DailyStats = ({ stats }: DailyStatsProps) => {
  if (stats.length === 0) {
    return null;
  }

  return (
    <section className="daily-stats" aria-label="Story momentum metrics">
      <header className="daily-stats__header">
        <span className="daily-stats__eyebrow">Momentum</span>
        <h2>Community telemetry</h2>
      </header>
      <div className="daily-stats__grid">
        {stats.map((stat) => (
          <article key={stat.label} className="daily-stats__card">
            <span className="daily-stats__label">{stat.label}</span>
            <strong className="daily-stats__value">{stat.value}</strong>
            {stat.caption && <p className="daily-stats__caption">{stat.caption}</p>}
          </article>
        ))}
      </div>
    </section>
  );
};

export default DailyStats;
