/* global React */
(() => {
const { Icon, Button, Card, Tabs, ShareLink, ReportCard, StatusBadge, Alert, Spinner } = window.PoolyDesignSystem_3787fa;

function ResponsesTab() {
  const { responses } = window.PoolyData;
  return (
    <div>
      <div style={{ font: "var(--font-small)", color: "var(--text-muted)", marginBottom: 12 }}>
        Pregunta: <strong style={{ color: "var(--text-primary)" }}>¿Qué te hizo dudar antes de comprar?</strong>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {responses.map((r, i) => (
          <div key={i} style={{ padding: "12px 16px", background: "var(--surface-alt)", borderRadius: "var(--radius-md)", fontSize: 14.5, color: "var(--text-primary)", lineHeight: 1.5 }}>
            {r}
          </div>
        ))}
        <div style={{ textAlign: "center", padding: "10px", fontSize: 13, color: "var(--text-muted)" }}>+ 1,277 respuestas más</div>
      </div>
    </div>
  );
}

function ReportTab({ analyzed, analyzing, onAnalyze }) {
  const { report } = window.PoolyData;
  if (analyzing) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "64px 24px", gap: 16 }}>
        <Spinner size={40} />
        <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>Analizando 1,284 respuestas…</div>
        <div style={{ fontSize: 13.5, color: "var(--text-secondary)" }}>Detectando temas, sentimiento y urgencia. Toma menos de un minuto.</div>
      </div>
    );
  }
  if (!analyzed) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "56px 24px", textAlign: "center", background: "var(--surface-alt)", borderRadius: "var(--radius-lg)" }}>
        <span style={{ width: 72, height: 72, borderRadius: "var(--radius-round)", background: "var(--brand-soft)", color: "var(--brand)", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
          <Icon name="sparkles" size={32} />
        </span>
        <h4 style={{ margin: "0 0 6px", fontSize: 18, fontWeight: 700, color: "var(--text-primary)" }}>Convierte las respuestas en decisiones</h4>
        <p style={{ margin: "0 0 20px", fontSize: 14.5, color: "var(--text-secondary)", maxWidth: 360, lineHeight: 1.6 }}>
          Pooly agrupa todo en temas con sentimiento, urgencia y una acción recomendada. Sin leer cada respuesta.
        </p>
        <Button variant="action" leftIcon="zap" onClick={onAnalyze}>Analizar con IA</Button>
      </div>
    );
  }
  return (
    <div>
      <Alert variant="success" title="Análisis completado" style={{ marginBottom: 16 }}>
        6 temas detectados en 1,284 respuestas · hace un momento
      </Alert>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 16 }}>
        {report.map((r, i) => <ReportCard key={i} {...r} />)}
      </div>
    </div>
  );
}

function StatusTab() {
  const { jobs } = window.PoolyData;
  return (
    <Card padding={0} style={{ overflow: "hidden" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
        <thead>
          <tr>
            {["Job", "Estado", "Mensaje", "Fecha"].map((h) => (
              <th key={h} style={{ textAlign: "left", padding: "12px 18px", background: "var(--surface-alt)", fontSize: 11.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)", borderBottom: "1px solid var(--border)" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {jobs.map((j, i) => (
            <tr key={j.id} style={{ borderBottom: i < jobs.length - 1 ? "1px solid var(--border)" : "none" }}>
              <td style={{ padding: "14px 18px", fontFamily: "var(--font-mono)", fontSize: 12.5, color: "var(--text-muted)" }}>{j.id}</td>
              <td style={{ padding: "14px 18px" }}><StatusBadge kind="job" value={j.status} /></td>
              <td style={{ padding: "14px 18px", color: "var(--text-secondary)" }}>{j.message}</td>
              <td style={{ padding: "14px 18px", color: "var(--text-muted)", whiteSpace: "nowrap" }}>{j.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

function EventDetails({ ev, onBack, defaultAnalyzed }) {
  const [tab, setTab] = React.useState("report");
  const [analyzed, setAnalyzed] = React.useState(!!defaultAnalyzed);
  const [analyzing, setAnalyzing] = React.useState(false);

  const analyze = () => {
    setAnalyzing(true);
    setTimeout(() => { setAnalyzing(false); setAnalyzed(true); }, 1600);
  };

  return (
    <window.PoolyAppCanvas>
      <window.PoolyPageHeader
        title={ev.title}
        back={{ label: "Volver al panel", onClick: onBack }}
        actions={<>
          <Button variant="secondary" leftIcon="external-link">Vista previa</Button>
          {tab === "report" && !analyzing && (
            <Button variant="action" leftIcon="zap" onClick={analyze}>{analyzed ? "Re-analizar" : "Analizar con IA"}</Button>
          )}
        </>}
      />
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
        <StatusBadge kind="order" value={ev.status} />
        <span style={{ fontSize: 13.5, color: "var(--text-secondary)", display: "inline-flex", alignItems: "center", gap: 5 }}><Icon name="message-square" size={15} /> {ev.responses.toLocaleString()} respuestas</span>
        <span style={{ fontSize: 13.5, color: "var(--text-secondary)", display: "inline-flex", alignItems: "center", gap: 5 }}><Icon name="git-branch" size={15} /> {ev.moment}</span>
      </div>

      <ShareLink url={`https://pooly.mx/r/${ev.id}`} style={{ marginBottom: 24 }} />

      <Tabs value={tab} onChange={setTab} style={{ marginBottom: 20 }} tabs={[
        { id: "responses", label: "Respuestas", icon: "message-square", count: ev.responses },
        { id: "report", label: "Reporte IA", icon: "sparkles" },
        { id: "status", label: "Estado", icon: "activity" },
      ]} />

      {tab === "responses" && <ResponsesTab />}
      {tab === "report" && <ReportTab analyzed={analyzed} analyzing={analyzing} onAnalyze={analyze} />}
      {tab === "status" && <StatusTab />}
    </window.PoolyAppCanvas>
  );
}

window.PoolyEventDetails = EventDetails;
})();
