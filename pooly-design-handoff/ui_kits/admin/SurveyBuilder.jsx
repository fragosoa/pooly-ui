/* global React */
(() => {
const { Icon, Button, Input, Textarea, FormField, Card } = window.PoolyDesignSystem_3787fa;

function TemplatePick({ tpl, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        width: "100%",
        textAlign: "left",
        padding: "12px 14px",
        background: active ? "var(--brand-soft)" : "var(--surface)",
        border: `1.5px solid ${active ? "var(--brand)" : "var(--border)"}`,
        borderRadius: "var(--radius-md)",
        cursor: "pointer",
        transition: "var(--transition-control)",
      }}
    >
      <span style={{ width: 36, height: 36, flexShrink: 0, borderRadius: "var(--radius-sm)", background: active ? "var(--brand)" : "var(--surface-alt)", color: active ? "#fff" : "var(--text-secondary)", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
        <Icon name={tpl.icon} size={18} />
      </span>
      <span style={{ minWidth: 0 }}>
        <span style={{ display: "block", fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>{tpl.title}</span>
        <span style={{ display: "block", fontSize: 12.5, color: "var(--text-secondary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{tpl.desc}</span>
      </span>
    </button>
  );
}

function TipsPanel() {
  const tips = [
    { icon: "help-circle", title: "Haz una sola pregunta abierta", desc: "Una pregunta clara da respuestas más honestas que diez de opción múltiple." },
    { icon: "target", title: "Apunta al momento", desc: "Pregunta justo después de la compra, entrega o devolución." },
    { icon: "smile", title: "Habla como tu marca", desc: "Cercano y breve. El comprador responde desde el móvil en segundos." },
  ];
  return (
    <Card padding={20} style={{ position: "sticky", top: 92 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, paddingBottom: 14, marginBottom: 14, borderBottom: "1px solid var(--border)" }}>
        <span style={{ width: 34, height: 34, borderRadius: "var(--radius-md)", background: "var(--action-soft)", color: "var(--action-hover)", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
          <Icon name="lightbulb" size={18} />
        </span>
        <span style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>Para mejores insights</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {tips.map((t, i) => (
          <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <span style={{ color: "var(--brand)", flexShrink: 0, marginTop: 1 }}><Icon name={t.icon} size={17} /></span>
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--text-primary)" }}>{t.title}</div>
              <div style={{ fontSize: 12.5, color: "var(--text-secondary)", lineHeight: 1.5 }}>{t.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function SurveyBuilder({ onBack, onCreated }) {
  const { templates } = window.PoolyData;
  const [pick, setPick] = React.useState(0);
  const [q, setQ] = React.useState(templates[0].desc);

  return (
    <window.PoolyAppCanvas max={1000}>
      <window.PoolyPageHeader
        title="Nueva encuesta"
        subtitle="Elige un momento del journey y la pregunta que harás."
        back={{ label: "Volver al panel", onClick: onBack }}
      />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 28, alignItems: "start" }}>
        <div>
          <Card padding={24} style={{ marginBottom: 20 }}>
            <FormField label="Nombre de la encuesta" required hint="Solo tú lo ves, para organizar tus encuestas.">
              <Input leftIcon="tag" defaultValue="Feedback post-compra — Marzo" />
            </FormField>

            <div style={{ font: "var(--font-small)", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8 }}>Momento del journey</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
              {templates.map((t, i) => (
                <TemplatePick key={i} tpl={t} active={pick === i} onClick={() => { setPick(i); setQ(t.desc); }} />
              ))}
            </div>

            <FormField label="Tu pregunta" required hint="Una pregunta abierta — tus clientes responden con sus palabras.">
              <Textarea chat value={q} onChange={(e) => setQ(e.target.value)} rows={2} />
            </FormField>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <FormField label="Cierra el" htmlFor="d">
                <Input leftIcon="calendar" type="text" defaultValue="31 / 03 / 2026" />
              </FormField>
              <FormField label="Idioma">
                <Input leftIcon="globe" defaultValue="Español (México)" />
              </FormField>
            </div>
          </Card>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <Button variant="secondary" onClick={onBack}>Cancelar</Button>
            <Button variant="action" leftIcon="check" onClick={onCreated}>Crear y compartir</Button>
          </div>
        </div>
        <TipsPanel />
      </div>
    </window.PoolyAppCanvas>
  );
}

window.PoolySurveyBuilder = SurveyBuilder;
})();
