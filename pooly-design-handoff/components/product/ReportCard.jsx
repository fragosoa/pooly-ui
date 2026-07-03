import React from "react";
import { Card } from "../surfaces/Card.jsx";
import { StatusBadge } from "../data-display/StatusBadge.jsx";

/**
 * ReportCard — the heart of the product: one AI-discovered theme.
 * Shows the category, sentiment + urgency badges, the key stats
 * (mentions / % of total / responses), a summary, example quotes,
 * and an optional recommended action.
 */
export function ReportCard({
  category,
  sentiment = "neutral",
  urgency = "medium",
  mentions,
  percent,
  responses,
  summary,
  quotes = [],
  recommendation,
  style = {},
}) {
  const stats = [
    mentions != null && { value: mentions, label: "Menciones" },
    percent != null && { value: `${percent}%`, label: "Del total" },
    responses != null && { value: responses, label: "Respuestas" },
  ].filter(Boolean);

  return (
    <Card interactive padding={24} style={style}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap", marginBottom: 14 }}>
        <h4 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "var(--text-primary)" }}>{category}</h4>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          <StatusBadge kind="sentiment" value={sentiment} />
          <StatusBadge kind="urgency" value={urgency} />
        </div>
      </div>

      {stats.length > 0 && (
        <div style={{ display: "flex", gap: 28, padding: "14px 16px", background: "var(--surface-sunken)", borderRadius: "var(--radius-md)", marginBottom: 14 }}>
          {stats.map((s, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: 22, fontWeight: 800, color: "var(--brand)", lineHeight: 1.1, letterSpacing: "-0.02em" }}>{s.value}</span>
              <span style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.04em", marginTop: 2 }}>{s.label}</span>
            </div>
          ))}
        </div>
      )}

      {summary && (
        <p style={{ margin: "0 0 14px", fontSize: 15, color: "var(--text-secondary)", lineHeight: 1.6 }}>{summary}</p>
      )}

      {quotes.length > 0 && (
        <div style={{ background: "var(--surface-sunken)", borderRadius: "var(--radius-md)", padding: "12px 14px", marginBottom: recommendation ? 14 : 0 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 8 }}>
            Lo que dicen tus clientes
          </div>
          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 6 }}>
            {quotes.map((q, i) => (
              <li key={i} style={{ fontSize: 14, color: "var(--text-secondary)", fontStyle: "italic", lineHeight: 1.5 }}>
                &ldquo;{q}&rdquo;
              </li>
            ))}
          </ul>
        </div>
      )}

      {recommendation && (
        <div style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "12px 14px", background: "var(--action-tint)", border: "1px solid var(--action-soft)", borderRadius: "var(--radius-md)" }}>
          <span style={{ fontSize: 11, fontWeight: 800, color: "var(--action-hover)", textTransform: "uppercase", letterSpacing: "0.05em", flexShrink: 0, marginTop: 2 }}>Acción</span>
          <span style={{ fontSize: 14, color: "var(--text-primary)", lineHeight: 1.5 }}>{recommendation}</span>
        </div>
      )}
    </Card>
  );
}
