import React from "react";
import { Icon } from "../icon/Icon.jsx";

const TONES = {
  brand:   { bg: "var(--brand-soft)",   fg: "var(--brand-hover)" },
  action:  { bg: "var(--action-soft)",  fg: "var(--action-hover)" },
  success: { bg: "var(--success-soft)", fg: "var(--success)" },
  danger:  { bg: "var(--danger-soft)",  fg: "var(--danger)" },
  warning: { bg: "var(--warning-soft)", fg: "var(--warning)" },
  info:    { bg: "var(--info-soft)",    fg: "var(--info)" },
  special: { bg: "var(--special-soft)", fg: "var(--special)" },
  neutral: { bg: "var(--surface-alt)",  fg: "var(--text-secondary)" },
};

/**
 * Badge — small colored label. The carried-over functional color
 * pattern: tone communicates meaning (status, sentiment, count).
 */
export function Badge({
  children,
  tone = "neutral",
  icon,
  dot = false,
  pill = true,
  uppercase = false,
  style = {},
  ...rest
}) {
  const t = TONES[tone] || TONES.neutral;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: uppercase ? "3px 9px" : "4px 10px",
        background: t.bg,
        color: t.fg,
        fontFamily: "var(--font-sans)",
        fontSize: uppercase ? "11px" : "12px",
        fontWeight: 600,
        lineHeight: 1.35,
        letterSpacing: uppercase ? "0.06em" : "0.01em",
        textTransform: uppercase ? "uppercase" : "none",
        borderRadius: pill ? "var(--radius-pill)" : "var(--radius-sm)",
        whiteSpace: "nowrap",
        ...style,
      }}
      {...rest}
    >
      {dot && (
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "currentColor", flexShrink: 0 }} />
      )}
      {icon && <Icon name={icon} size={13} />}
      {children}
    </span>
  );
}
