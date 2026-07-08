/* global React */
(() => {
const { Icon, Button, StatCard, StatusBadge, Card } = window.PoolyDesignSystem_3787fa;

function EventRow({ ev, onOpen }) {
  const [hover, setHover] = React.useState(false);
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={() => onOpen(ev)}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 20,
        padding: "16px 20px",
        background: "var(--surface)",
        border: `1px solid ${hover ? "var(--brand)" : "var(--border)"}`,
        borderRadius: "var(--radius-lg)",
        boxShadow: hover ? "var(--shadow-sm)" : "none",
        cursor: "pointer",
        transition: "var(--transition-control)",
      }}
    >
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
          <h3 style={{ margin: 0, fontSize: 15.5, fontWeight: 700, color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{ev.title}</h3>
          <StatusBadge kind="order" value={ev.status} />
        </div>
        <div style={{ display: "flex", gap: 18, fontSize: 13, color: "var(--text-secondary)" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><Icon name="git-branch" size={14} /> {ev.moment}</span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><Icon name="message-square" size={14} /> {ev.responses.toLocaleString()} respuestas</span>
          {ev.days > 0 && <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><Icon name="clock" size={14} /> {ev.days} días restantes</span>}
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
        <Button variant="ghost" size="sm" rightIcon="arrow-right">Ver insights</Button>
      </div>
    </div>
  );
}

function Dashboard({ onOpen, onCreate }) {
  const { stats, events, user } = window.PoolyData;
  return (
    <window.PoolyAppCanvas>
      <window.PoolyPageHeader
        title={`Hola, ${user.name.split(" ")[0]}`}
        subtitle="Esto es lo que tus clientes están diciendo hoy."
        actions={<Button variant="action" leftIcon="plus" onClick={onCreate}>Nueva encuesta</Button>}
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 28 }}>
        {stats.map((s, i) => <StatCard key={i} {...s} />)}
      </div>

      {/* Highlight band: a top insight surfaced from the latest analysis */}
      <Card style={{ marginBottom: 28, padding: 0, overflow: "hidden", border: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "18px 22px", background: "linear-gradient(135deg, var(--blue-50) 0%, var(--surface) 70%)" }}>
          <span style={{ width: 44, height: 44, borderRadius: "var(--radius-md)", background: "var(--action-soft)", color: "var(--action-hover)", display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Icon name="zap" size={22} />
          </span>
          <div style={{ flex: 1 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
              <span style={{ font: "var(--font-eyebrow)", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--action-hover)" }}>Acción sugerida</span>
            </div>
            <div style={{ fontSize: 15.5, fontWeight: 700, color: "var(--text-primary)" }}>El tiempo de entrega es la queja #1 esta semana (31% de las menciones).</div>
            <div style={{ fontSize: 13.5, color: "var(--text-secondary)" }}>Revisa el SLA de tu paquetería y comunica tiempos reales en el checkout.</div>
          </div>
          <Button variant="primary" size="sm" rightIcon="arrow-right" onClick={() => onOpen(events[0])}>Ver tema</Button>
        </div>
      </Card>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "var(--text-primary)" }}>Tus encuestas</h2>
        <span style={{ fontSize: 13, color: "var(--text-secondary)", background: "var(--surface-alt)", padding: "3px 12px", borderRadius: "var(--radius-pill)" }}>{events.length} encuestas</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {events.map((ev) => <EventRow key={ev.id} ev={ev} onOpen={onOpen} />)}
      </div>
    </window.PoolyAppCanvas>
  );
}

window.PoolyDashboard = Dashboard;
})();
