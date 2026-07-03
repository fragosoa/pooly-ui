import React from "react";
import { Icon } from "../icon/Icon.jsx";

const ICON_TONES = {
  brand:   { bg: "var(--brand-soft)",   fg: "var(--brand)" },
  success: { bg: "var(--success-soft)", fg: "var(--success)" },
  info:    { bg: "var(--info-soft)",    fg: "var(--info)" },
  warning: { bg: "var(--warning-soft)", fg: "var(--warning)" },
  action:  { bg: "var(--action-soft)",  fg: "var(--action-hover)" },
};

/**
 * StatCard — dashboard KPI tile: tinted icon bubble + big value + label,
 * optional trend chip. Hover lifts and tints the border to brand.
 */
export function StatCard({
  icon,
  tone = "brand",
  value,
  label,
  trend,
  trendDir = "up",
  style = {},
  ...rest
}) {
  const t = ICON_TONES[tone] || ICON_TONES.brand;
  const [hover, setHover] = React.useState(false);
  const trendColor = trendDir === "down" ? "var(--danger)" : "var(--success)";

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: 20,
        background: "var(--surface)",
        border: `1px solid ${hover ? "var(--brand)" : "var(--border)"}`,
        borderRadius: "var(--radius-lg)",
        boxShadow: hover ? "var(--shadow-md)" : "var(--shadow-sm)",
        transition: "var(--transition-control)",
        ...style,
      }}
      {...rest}
    >
      {icon && (
        <span
          style={{
            width: 48,
            height: 48,
            flexShrink: 0,
            borderRadius: "var(--radius-md)",
            background: t.bg,
            color: t.fg,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon name={icon} size={24} />
        </span>
      )}
      <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
          <span style={{ fontSize: 28, fontWeight: 800, color: "var(--text-primary)", lineHeight: 1.1, letterSpacing: "-0.02em" }}>
            {value}
          </span>
          {trend && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 2, fontSize: 12, fontWeight: 700, color: trendColor }}>
              <Icon name={trendDir === "down" ? "trending-down" : "trending-up"} size={13} />
              {trend}
            </span>
          )}
        </div>
        <span style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 2 }}>{label}</span>
      </div>
    </div>
  );
}
