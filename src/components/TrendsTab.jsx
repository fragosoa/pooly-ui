import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

export default function TrendsTab({ reports, locale }) {
  const isES = locale === 'es-MX';

  const openReports = reports.filter(r => !r.question_type || r.question_type === 'open');
  const timestamps = [...new Set(openReports.map(r => r.timestamp))].sort((a, b) => new Date(a) - new Date(b));

  if (timestamps.length < 2) {
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
      <div className="card" style={{ padding: '1.5rem' }}>
        <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
          {isES ? 'Evolución del sentimiento' : 'Sentiment evolution'}
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
              formatter={v => [v, isES ? 'Sentimiento' : 'Sentiment']}
              contentStyle={{ fontSize: '0.8rem', borderRadius: '0.375rem' }}
            />
            <Line
              type="monotone" dataKey="sentiment"
              stroke="#6366F1" strokeWidth={2}
              dot={{ fill: '#6366F1', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Category comparison table */}
      {comparison.length > 0 && (
        <div>
          <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem', color: 'var(--text-primary)' }}>
            {isES ? 'Comparación de categorías' : 'Category comparison'}
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
    </section>
  );
}
