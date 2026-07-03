import React from "react";
import { Icon } from "../icon/Icon.jsx";

/**
 * ShareLink — the shareable survey URL block: an icon, a read-only
 * field, and a copy button that confirms with a green "Copiado" state.
 */
export function ShareLink({
  url = "",
  title = "Comparte tu encuesta",
  subtitle = "Envía este enlace por WhatsApp, email o SMS — tus clientes responden sin crear cuenta.",
  style = {},
}) {
  const [copied, setCopied] = React.useState(false);
  const copy = () => {
    try { navigator.clipboard && navigator.clipboard.writeText(url); } catch (e) {}
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-lg)",
        padding: 20,
        ...style,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
        <span style={{ width: 40, height: 40, flexShrink: 0, borderRadius: "var(--radius-md)", background: "var(--brand-soft)", color: "var(--brand)", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
          <Icon name="share-2" size={20} />
        </span>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>{title}</div>
          <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.45 }}>{subtitle}</div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <input
          readOnly
          value={url}
          onFocus={(e) => e.target.select()}
          style={{
            flex: 1,
            minWidth: 0,
            padding: "11px 14px",
            fontSize: 14,
            fontFamily: "var(--font-mono)",
            color: "var(--text-secondary)",
            background: "var(--surface-sunken)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-sm)",
            outline: "none",
          }}
        />
        <button
          onClick={copy}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 7,
            padding: "11px 18px",
            fontFamily: "var(--font-sans)",
            fontSize: 14,
            fontWeight: 600,
            color: "#fff",
            background: copied ? "var(--success)" : "var(--brand)",
            border: "none",
            borderRadius: "var(--radius-sm)",
            cursor: "pointer",
            whiteSpace: "nowrap",
            transition: "background var(--dur-base)",
          }}
        >
          <Icon name={copied ? "check" : "copy"} size={16} />
          {copied ? "Copiado" : "Copiar"}
        </button>
      </div>
    </div>
  );
}
