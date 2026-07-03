/* global React */
(() => {
const { Icon, Avatar, Button, IconButton } = window.PoolyDesignSystem_3787fa;

function Navbar({ onNav, active }) {
  const { user } = window.PoolyData;
  const links = [
    { id: "dashboard", label: "Panel" },
    { id: "responses", label: "Respuestas" },
    { id: "insights", label: "Insights" },
  ];
  return (
    <nav
      style={{
        display: "flex",
        alignItems: "center",
        gap: 24,
        padding: "0 28px",
        height: 64,
        background: "var(--surface)",
        borderBottom: "1px solid var(--border)",
        position: "sticky",
        top: 0,
        zIndex: 200,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontFamily: "var(--font-sans)", fontWeight: 800, fontSize: 22, letterSpacing: "-0.02em", color: "var(--text-primary)" }}>
          Pool<span style={{ color: "var(--brand)" }}>y</span>
        </span>
      </div>

      <ul style={{ display: "flex", gap: 2, listStyle: "none", margin: 0, padding: 0, marginLeft: 8 }}>
        {links.map((l) => {
          const on = active === l.id;
          return (
            <li key={l.id}>
              <button
                onClick={() => onNav && onNav(l.id === "dashboard" ? "dashboard" : "dashboard")}
                style={{
                  padding: "8px 14px",
                  fontSize: 14.5,
                  fontWeight: on ? 700 : 500,
                  color: on ? "var(--text-primary)" : "var(--text-secondary)",
                  background: on ? "var(--surface-alt)" : "transparent",
                  border: "none",
                  borderRadius: "var(--radius-md)",
                  cursor: "pointer",
                }}
              >
                {l.label}
              </button>
            </li>
          );
        })}
      </ul>

      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12 }}>
        <Button variant="action" size="sm" leftIcon="plus" onClick={() => onNav && onNav("create")}>
          Nueva encuesta
        </Button>
        <IconButton icon="bell" variant="ghost" label="Notificaciones" />
        <div style={{ display: "flex", alignItems: "center", gap: 8, paddingLeft: 8, borderLeft: "1px solid var(--border)" }}>
          <Avatar name={user.name} size="sm" />
          <div style={{ lineHeight: 1.2 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>{user.name}</div>
            <div style={{ fontSize: 11.5, color: "var(--text-muted)" }}>{user.store}</div>
          </div>
        </div>
      </div>
    </nav>
  );
}

function PageHeader({ title, subtitle, actions, back }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16, flexWrap: "wrap", marginBottom: 24 }}>
      <div>
        {back && (
          <button onClick={back.onClick} style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "none", border: "none", color: "var(--brand)", fontSize: 13.5, fontWeight: 600, cursor: "pointer", padding: 0, marginBottom: 10 }}>
            <Icon name="arrow-left" size={15} /> {back.label}
          </button>
        )}
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, letterSpacing: "-0.02em", color: "var(--text-primary)" }}>{title}</h1>
        {subtitle && <p style={{ margin: "4px 0 0", color: "var(--text-secondary)", fontSize: 15 }}>{subtitle}</p>}
      </div>
      {actions && <div style={{ display: "flex", gap: 10 }}>{actions}</div>}
    </div>
  );
}

function AppCanvas({ children, max = 1200 }) {
  return (
    <div style={{ minHeight: "100vh", background: "var(--surface-sunken)" }}>
      <div style={{ maxWidth: max, margin: "0 auto", padding: "28px 28px 64px" }}>{children}</div>
    </div>
  );
}

Object.assign(window, { PoolyNavbar: Navbar, PoolyPageHeader: PageHeader, PoolyAppCanvas: AppCanvas });
})();
