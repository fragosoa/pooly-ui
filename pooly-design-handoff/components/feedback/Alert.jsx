import React from "react";
import { Icon } from "../icon/Icon.jsx";

const VARIANTS = {
  success: { bg: "var(--success-soft)", fg: "var(--success)", icon: "check-circle" },
  error:   { bg: "var(--danger-soft)",  fg: "var(--danger)",  icon: "alert-circle" },
  warning: { bg: "var(--warning-soft)", fg: "var(--warning)", icon: "alert-triangle" },
  info:    { bg: "var(--brand-soft)",   fg: "var(--brand-hover)", icon: "info" },
};

/**
 * Alert — inline status message. Soft tinted background, leading icon.
 */
export function Alert({ variant = "info", title, children, onClose, style = {}, ...rest }) {
  const v = VARIANTS[variant] || VARIANTS.info;
  return (
    <div
      role="status"
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 10,
        padding: "12px 14px",
        background: v.bg,
        color: v.fg,
        borderRadius: "var(--radius-md)",
        fontSize: 14,
        lineHeight: 1.5,
        ...style,
      }}
      {...rest}
    >
      <span style={{ flexShrink: 0, marginTop: 1, display: "inline-flex" }}>
        <Icon name={v.icon} size={18} />
      </span>
      <div style={{ flex: 1 }}>
        {title && <div style={{ fontWeight: 700, marginBottom: children ? 2 : 0 }}>{title}</div>}
        {children && <div style={{ color: "var(--text-secondary)" }}>{children}</div>}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          aria-label="Cerrar"
          style={{ background: "none", border: "none", color: "currentColor", cursor: "pointer", padding: 0, display: "inline-flex", opacity: 0.7 }}
        >
          <Icon name="x" size={16} />
        </button>
      )}
    </div>
  );
}
