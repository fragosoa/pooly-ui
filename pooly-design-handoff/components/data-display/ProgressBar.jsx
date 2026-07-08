import React from "react";

/**
 * ProgressBar — thin track + brand fill. Used for survey progress,
 * theme distribution bars, and step indicators. `tone` recolors the fill.
 */
export function ProgressBar({
  value = 0,
  max = 100,
  tone = "brand",
  height = 8,
  showLabel = false,
  style = {},
  ...rest
}) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const fill = {
    brand: "var(--brand)",
    action: "var(--action)",
    success: "var(--success)",
    warning: "var(--warning)",
    danger: "var(--danger)",
  }[tone] || "var(--brand)";

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, ...style }} {...rest}>
      <div
        style={{
          flex: 1,
          height,
          background: "var(--surface-alt)",
          borderRadius: "var(--radius-pill)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: "100%",
            background: fill,
            borderRadius: "var(--radius-pill)",
            transition: "width 0.4s var(--ease-out)",
          }}
        />
      </div>
      {showLabel && (
        <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-secondary)", minWidth: 36, textAlign: "right" }}>
          {Math.round(pct)}%
        </span>
      )}
    </div>
  );
}
