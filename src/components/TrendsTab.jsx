import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

export default function TrendsTab({ reports, locale }) {
  const isES = locale === 'es-MX';

  const openReports = reports.filter(r => !r.question_type || r.question_type === 'open');
  const typedReports = reports.filter(r => r.question_type && r.question_type !== 'open');

  const timestamps = [...new Set(openReports.map(r => r.timestamp))].sort((a, b) => new Date(a) - new Date(b));

  // Group typed reports by question_id, sorted by timestamp
  const typedByQuestion = typedReports.reduce((acc, r) => {
    const key = r.question_id ?? r.question_text;
    if (!acc[key]) acc[key] = { question_text: r.question_text, question_type: r.question_type, runs: [] };
    acc[key].runs.push(r);
    return acc;
  }, {});
  Object.values(typedByQuestion).forEach(q => {
    q.runs.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  });
  const typedQuestions = Object.values(typedByQuestion);

  const hasOpenTrends = timestamps.length >= 2;
  const hasTypedData = typedQuestions.length > 0;

  if (!hasOpenTrends && !hasTypedData) {
    return (
      <div className="reports-empty">
        <div style={{
          width: '4rem', height: '4rem', background: 'var(--primary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 1.25rem',
        }}>
          <span style={{ fontSize: '1.75rem' }}>📈</span>
        </div>
        <h4>{isES ? 'Sin datos históricos aún' : 'No historical data yet'}</h4>
        <p style={{ maxWidth: '28rem' }}>
          {isES
            ? 'Ejecuta al menos 2 análisis para ver comparaciones de tendencias históricas.'
            : 'Run at least 2 analyses to see historical trend comparisons.'}
        </p>
      </div>
    );
  }

  // ── Open questions: sentiment evolution ───────────────────────────────────
  const sentimentByTs = timestamps.map(ts => {
    const tsReports = openReports.filter(r => r.timestamp === ts);
    const totalVol = tsReports.reduce((s, r) => s + (r.volume || 0), 0);
    const weighted = totalVol > 0
      ? tsReports.reduce((s, r) => s + r.sentiment * (r.volume || 0), 0) / totalVol
      : 0;
    return {
      date: new Date(ts).toLocaleString(locale, { dateStyle: 'short' }),
      sentiment: parseFloat(weighted.toFixed(2)),
    };
  });

  // ── Open questions: category comparison (last 2 runs) ────────────────────
  const latestTs = timestamps[timestamps.length - 1];
  const prevTs = timestamps[timestamps.length - 2];
  const latestReports = openReports.filter(r => r.timestamp === latestTs);
  const prevReports = openReports.filter(r => r.timestamp === prevTs);

  const allCategories = [...new Set([
    ...latestReports.map(r => r.category),
    ...prevReports.map(r => r.category),
  ])];

  const comparison = allCategories.map(cat => {
    const current = latestReports.find(r => r.category === cat);
    const previous = prevReports.find(r => r.category === cat);
    const sentDelta = current && previous
      ? parseFloat((current.sentiment - previous.sentiment).toFixed(2))
      : null;
    return { cat, current, previous, sentDelta };
  }).sort((a, b) => {
    if (a.sentDelta !== null && b.sentDelta !== null) return a.sentDelta - b.sentDelta;
    if (a.sentDelta === null) return 1;
    if (b.sentDelta === null) return -1;
    return 0;
  });

  const trendIcon = (delta) => {
    if (delta === null) return '—';
    if (delta > 0.05) return '↑';
    if (delta < -0.05) return '↓';
    return '→';
  };

  const trendColor = (delta) => {
    if (delta === null) return 'var(--text-muted)';
    if (delta > 0.05) return '#10B981';
    if (delta < -0.05) return '#EF4444';
    return 'var(--text-secondary)';
  };

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

      {/* ── Open questions section ── */}
      {hasOpenTrends && (
        <>
          {/* Summary bar */}
          <div style={{
            padding: '0.75rem 1rem',
            background: 'var(--bg-secondary)', border: '1px solid var(--border)',
            fontSize: '0.85rem', color: 'var(--text-secondary)',
          }}>
            {isES
              ? `Comparando: ${new Date(prevTs).toLocaleString(locale, { dateStyle: 'medium', timeStyle: 'short' })} → ${new Date(latestTs).toLocaleString(locale, { dateStyle: 'medium', timeStyle: 'short' })}`
              : `Comparing: ${new Date(prevTs).toLocaleString(locale, { dateStyle: 'medium', timeStyle: 'short' })} → ${new Date(latestTs).toLocaleString(locale, { dateStyle: 'medium', timeStyle: 'short' })}`}
            <span style={{ marginLeft: '1rem', color: 'var(--text-muted)' }}>
              ({timestamps.length} {isES ? 'análisis en total' : 'total analyses'})
            </span>
          </div>

          {/* Sentiment evolution chart */}
          <div className="card" style={{ padding: '1.5rem', overflow: 'visible' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
              {isES ? 'Evolución del sentimiento (preguntas abiertas)' : 'Sentiment evolution (open questions)'}
            </h4>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={sentimentByTs} margin={{ top: 4, right: 16, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: 'var(--text-secondary)' }}
                  axisLine={false} tickLine={false}
                />
                <YAxis
                  domain={[-1, 1]}
                  tick={{ fontSize: 11, fill: 'var(--text-secondary)' }}
                  axisLine={false} tickLine={false}
                />
                <Tooltip
                  formatter={v => [v.toFixed(2), isES ? 'Sentimiento' : 'Sentiment']}
                  labelFormatter={label => label}
                  contentStyle={{ fontSize: '0.8rem', borderRadius: '0.375rem', border: '1px solid var(--border)', background: 'white' }}
                  wrapperStyle={{ zIndex: 10 }}
                />
                <Line
                  type="monotone" dataKey="sentiment"
                  stroke="#6366F1" strokeWidth={2}
                  dot={{ fill: '#6366F1', r: 4 }}
                  activeDot={{ r: 7, stroke: '#6366F1', strokeWidth: 2, fill: 'white' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Category comparison table */}
          {comparison.length > 0 && (
            <div>
              <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem', color: 'var(--text-primary)' }}>
                {isES ? 'Comparación de categorías (últimos 2 análisis)' : 'Category comparison (last 2 analyses)'}
              </h4>
              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: '600', color: 'var(--text-secondary)' }}>
                        {isES ? 'Categoría' : 'Category'}
                      </th>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'center', fontWeight: '600', color: 'var(--text-secondary)' }}>
                        {isES ? 'Sent. anterior' : 'Prev. sentiment'}
                      </th>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'center', fontWeight: '600', color: 'var(--text-secondary)' }}>
                        {isES ? 'Sent. actual' : 'Current sentiment'}
                      </th>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'center', fontWeight: '600', color: 'var(--text-secondary)' }}>
                        {isES ? 'Cambio' : 'Change'}
                      </th>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'center', fontWeight: '600', color: 'var(--text-secondary)' }}>
                        {isES ? 'Tendencia' : 'Trend'}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparison.map(({ cat, current, previous, sentDelta }) => (
                      <tr key={cat} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '0.75rem 1rem', fontWeight: '500', color: 'var(--text-primary)' }}>{cat}</td>
                        <td style={{ padding: '0.75rem 1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                          {previous
                            ? previous.sentiment.toFixed(2)
                            : <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{isES ? 'Nuevo' : 'New'}</span>}
                        </td>
                        <td style={{ padding: '0.75rem 1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                          {current
                            ? current.sentiment.toFixed(2)
                            : <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{isES ? 'Desapareció' : 'Gone'}</span>}
                        </td>
                        <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                          {sentDelta !== null
                            ? (
                              <span style={{ color: trendColor(sentDelta), fontWeight: '600' }}>
                                {sentDelta > 0 ? '+' : ''}{sentDelta}
                              </span>
                            )
                            : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                        </td>
                        <td style={{ padding: '0.75rem 1rem', textAlign: 'center', fontSize: '1.1rem', color: trendColor(sentDelta) }}>
                          {trendIcon(sentDelta)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* ── Typed questions section ── */}
      {hasTypedData && (
        <div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.75rem',
            marginBottom: '1.25rem',
          }}>
            <h4 style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--text-primary)', margin: 0 }}>
              {isES ? 'Evolución de preguntas cerradas' : 'Closed questions evolution'}
            </h4>
            <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {typedQuestions.map((q, qi) => {
              const runs = q.runs;
              const hasMultipleRuns = runs.length >= 2;
              const latestRun = runs[runs.length - 1];
              const prevRun = hasMultipleRuns ? runs[runs.length - 2] : null;

              if (q.question_type === 'multiple') {
                return (
                  <MultipleChoiceTrend
                    key={qi}
                    question={q}
                    runs={runs}
                    latestRun={latestRun}
                    prevRun={prevRun}
                    hasMultipleRuns={hasMultipleRuns}
                    isES={isES}
                    locale={locale}
                  />
                );
              }

              if (q.question_type === 'numeric') {
                return (
                  <NumericTrend
                    key={qi}
                    question={q}
                    runs={runs}
                    hasMultipleRuns={hasMultipleRuns}
                    isES={isES}
                    locale={locale}
                  />
                );
              }

              if (q.question_type === 'date') {
                return (
                  <DateTrend
                    key={qi}
                    question={q}
                    runs={runs}
                    hasMultipleRuns={hasMultipleRuns}
                    isES={isES}
                    locale={locale}
                  />
                );
              }

              return null;
            })}
          </div>
        </div>
      )}
    </section>
  );
}

// ── Multiple choice trend ────────────────────────────────────────────────────

function MultipleChoiceTrend({ question, runs, latestRun, prevRun, hasMultipleRuns, isES, locale }) {
  const allOptions = [...new Set([
    ...(latestRun?.distribution || []).map(d => d.option),
    ...(prevRun?.distribution || []).map(d => d.option),
  ])];

  const getPct = (run, option) => {
    if (!run?.distribution) return null;
    const entry = run.distribution.find(d => d.option === option);
    return entry ? entry.percentage : null;
  };

  return (
    <div className="card" style={{ padding: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
        <span style={{ fontSize: '0.75rem', padding: '0.15rem 0.5rem', background: 'var(--primary-light)', color: 'var(--primary)', borderRadius: '999px', fontWeight: '600' }}>
          ☑️ {isES ? 'Opción múltiple' : 'Multiple choice'}
        </span>
        <h5 style={{ margin: 0, fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-primary)' }}>
          {question.question_text}
        </h5>
      </div>

      {hasMultipleRuns ? (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
          <thead>
            <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '0.5rem 0.75rem', textAlign: 'left', fontWeight: '600', color: 'var(--text-secondary)' }}>
                {isES ? 'Opción' : 'Option'}
              </th>
              <th style={{ padding: '0.5rem 0.75rem', textAlign: 'center', fontWeight: '600', color: 'var(--text-secondary)' }}>
                {isES ? 'Anterior' : 'Previous'}
              </th>
              <th style={{ padding: '0.5rem 0.75rem', textAlign: 'center', fontWeight: '600', color: 'var(--text-secondary)' }}>
                {isES ? 'Actual' : 'Current'}
              </th>
              <th style={{ padding: '0.5rem 0.75rem', textAlign: 'center', fontWeight: '600', color: 'var(--text-secondary)' }}>
                {isES ? 'Cambio' : 'Change'}
              </th>
            </tr>
          </thead>
          <tbody>
            {allOptions.map(option => {
              const prevPct = getPct(prevRun, option);
              const currPct = getPct(latestRun, option);
              const delta = currPct !== null && prevPct !== null ? parseFloat((currPct - prevPct).toFixed(1)) : null;
              const deltaColor = delta === null ? 'var(--text-muted)' : delta > 1 ? '#10B981' : delta < -1 ? '#EF4444' : 'var(--text-secondary)';
              return (
                <tr key={option} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '0.5rem 0.75rem', color: 'var(--text-primary)', fontWeight: '500' }}>{option}</td>
                  <td style={{ padding: '0.5rem 0.75rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    {prevPct !== null ? `${prevPct.toFixed(1)}%` : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                  </td>
                  <td style={{ padding: '0.5rem 0.75rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    {currPct !== null ? `${currPct.toFixed(1)}%` : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                  </td>
                  <td style={{ padding: '0.5rem 0.75rem', textAlign: 'center', fontWeight: '600', color: deltaColor }}>
                    {delta !== null ? `${delta > 0 ? '+' : ''}${delta}pp` : '—'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : (
        // Single run: show current distribution only
        <div>
          {(latestRun?.distribution || []).map((d, i) => (
            <div key={i} className="report-dist-row" style={{ marginBottom: '0.4rem' }}>
              <span className="report-dist-label">{d.option}</span>
              <div className="report-dist-bar-track">
                <div className="report-dist-bar-fill" style={{ width: `${Math.max(0, d.percentage)}%` }} />
              </div>
              <span className="report-dist-value">
                {d.count} <small style={{ color: 'var(--text-secondary)' }}>({d.percentage.toFixed(1)}%)</small>
              </span>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: '0.75rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
        {runs.length} {isES ? 'análisis' : 'analyses'} · {isES ? 'Último:' : 'Latest:'} {latestRun?.total_responses} {isES ? 'respuestas' : 'responses'}
        {latestRun?.most_common && ` · ${isES ? 'Más elegida:' : 'Top choice:'} ${latestRun.most_common}`}
      </div>
    </div>
  );
}

// ── Numeric trend ────────────────────────────────────────────────────────────

function NumericTrend({ question, runs, hasMultipleRuns, isES, locale }) {
  const chartData = runs.map(r => ({
    date: new Date(r.timestamp).toLocaleString(locale, { dateStyle: 'short' }),
    mean: r.stats?.mean ?? null,
    median: r.stats?.median ?? null,
  }));

  const latestRun = runs[runs.length - 1];
  const prevRun = hasMultipleRuns ? runs[runs.length - 2] : null;
  const meanDelta = latestRun?.stats?.mean != null && prevRun?.stats?.mean != null
    ? parseFloat((latestRun.stats.mean - prevRun.stats.mean).toFixed(2))
    : null;
  const deltaColor = meanDelta === null ? 'var(--text-muted)' : meanDelta > 0 ? '#10B981' : meanDelta < 0 ? '#EF4444' : 'var(--text-secondary)';

  const allMeans = runs.map(r => r.stats?.mean).filter(v => v != null);
  const minY = allMeans.length > 0 ? Math.floor(Math.min(...allMeans) - 0.5) : 0;
  const maxY = allMeans.length > 0 ? Math.ceil(Math.max(...allMeans) + 0.5) : 10;

  return (
    <div className="card" style={{ padding: '1.25rem', overflow: 'visible' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.75rem', padding: '0.15rem 0.5rem', background: 'var(--bg-secondary)', color: 'var(--text-secondary)', borderRadius: '999px', fontWeight: '600', border: '1px solid var(--border)' }}>
          🔢 {isES ? 'Numérica' : 'Numeric'}
        </span>
        <h5 style={{ margin: 0, fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-primary)' }}>
          {question.question_text}
        </h5>
        {meanDelta !== null && (
          <span style={{ marginLeft: 'auto', fontSize: '0.85rem', fontWeight: '700', color: deltaColor }}>
            {meanDelta > 0 ? '↑ +' : meanDelta < 0 ? '↓ ' : '→ '}{meanDelta} {isES ? 'en promedio' : 'avg change'}
          </span>
        )}
      </div>

      {hasMultipleRuns ? (
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={chartData} margin={{ top: 4, right: 16, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} />
            <YAxis domain={[minY, maxY]} tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} />
            <Tooltip
              formatter={(v, name) => [v?.toFixed(2), name === 'mean' ? (isES ? 'Promedio' : 'Mean') : (isES ? 'Mediana' : 'Median')]}
              labelFormatter={label => label}
              contentStyle={{ fontSize: '0.8rem', borderRadius: '0.375rem', border: '1px solid var(--border)', background: 'white' }}
              wrapperStyle={{ zIndex: 10 }}
            />
            <Line type="monotone" dataKey="mean" stroke="#6366F1" strokeWidth={2} dot={{ fill: '#6366F1', r: 4 }} activeDot={{ r: 6 }} />
            <Line type="monotone" dataKey="median" stroke="#A5B4FC" strokeWidth={1.5} strokeDasharray="4 2" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '0.75rem', padding: '0.5rem 0' }}>
          {[
            [isES ? 'Promedio' : 'Mean', latestRun?.stats?.mean?.toFixed(2)],
            [isES ? 'Mediana' : 'Median', latestRun?.stats?.median?.toFixed(2)],
            ['Min', latestRun?.stats?.min],
            ['Max', latestRun?.stats?.max],
            ['N', latestRun?.stats?.count],
          ].map(([label, value]) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-primary)' }}>{value ?? '—'}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{label}</div>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: '0.5rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
        {runs.length} {isES ? 'análisis' : 'analyses'}
        {latestRun?.stats && ` · ${isES ? 'Actual:' : 'Current:'} μ=${latestRun.stats.mean?.toFixed(2)}, σ=${latestRun.stats.std?.toFixed(2)}`}
      </div>
    </div>
  );
}

// ── Date trend ───────────────────────────────────────────────────────────────

function DateTrend({ question, runs, hasMultipleRuns, isES, locale }) {
  const latestRun = runs[runs.length - 1];

  return (
    <div className="card" style={{ padding: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
        <span style={{ fontSize: '0.75rem', padding: '0.15rem 0.5rem', background: 'var(--bg-secondary)', color: 'var(--text-secondary)', borderRadius: '999px', fontWeight: '600', border: '1px solid var(--border)' }}>
          📅 {isES ? 'Fecha' : 'Date'}
        </span>
        <h5 style={{ margin: 0, fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-primary)' }}>
          {question.question_text}
        </h5>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
        <thead>
          <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
            <th style={{ padding: '0.5rem 0.75rem', textAlign: 'left', fontWeight: '600', color: 'var(--text-secondary)' }}>
              {isES ? 'Análisis' : 'Analysis'}
            </th>
            <th style={{ padding: '0.5rem 0.75rem', textAlign: 'center', fontWeight: '600', color: 'var(--text-secondary)' }}>
              {isES ? 'Período pico' : 'Peak period'}
            </th>
            <th style={{ padding: '0.5rem 0.75rem', textAlign: 'center', fontWeight: '600', color: 'var(--text-secondary)' }}>
              {isES ? 'Rango' : 'Range'}
            </th>
            <th style={{ padding: '0.5rem 0.75rem', textAlign: 'center', fontWeight: '600', color: 'var(--text-secondary)' }}>N</th>
          </tr>
        </thead>
        <tbody>
          {runs.map((r, i) => {
            const isLatest = i === runs.length - 1;
            return (
              <tr key={i} style={{
                borderBottom: '1px solid var(--border)',
                background: isLatest ? 'var(--primary-light)' : 'transparent',
              }}>
                <td style={{ padding: '0.5rem 0.75rem', color: 'var(--text-secondary)', fontSize: '0.78rem' }}>
                  {new Date(r.timestamp).toLocaleString(locale, { dateStyle: 'medium', timeStyle: 'short' })}
                  {isLatest && <span style={{ marginLeft: '0.4rem', color: 'var(--primary)', fontWeight: '600', fontSize: '0.72rem' }}>▶</span>}
                </td>
                <td style={{ padding: '0.5rem 0.75rem', textAlign: 'center', fontWeight: '600', color: 'var(--text-primary)' }}>
                  {r.stats?.peak_period || '—'}
                </td>
                <td style={{ padding: '0.5rem 0.75rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  {r.stats?.earliest && r.stats?.latest ? `${r.stats.earliest} → ${r.stats.latest}` : '—'}
                </td>
                <td style={{ padding: '0.5rem 0.75rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  {r.stats?.count ?? '—'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
