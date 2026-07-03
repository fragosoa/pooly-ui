import React from "react";
import { Icon } from "../icon/Icon.jsx";

/**
 * Modal — centered dialog with overlay, header, body, optional footer.
 * Rounded 12px, subtle slide-up. Pass `open` to control visibility.
 */
export function Modal({
  open = true,
  title,
  onClose,
  children,
  footer,
  width = 480,
  tone,
  icon,
}) {
  if (!open) return null;

  const toneColor = {
    danger: { bg: "var(--danger-soft)", fg: "var(--danger)" },
    brand:  { bg: "var(--brand-soft)",  fg: "var(--brand)" },
    success:{ bg: "var(--success-soft)",fg: "var(--success)" },
  }[tone];

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        zIndex: 1000,
        animation: "pooly-fade-in 0.2s var(--ease-out)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        style={{
          width: "100%",
          maxWidth: width,
          maxHeight: "90vh",
          overflow: "auto",
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg)",
          boxShadow: "var(--shadow-xl)",
          animation: "pooly-fade-in 0.2s var(--ease-out)",
        }}
      >
        {(title || onClose) && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "18px 20px", borderBottom: "1px solid var(--border)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {icon && toneColor && (
                <span style={{ width: 32, height: 32, borderRadius: "var(--radius-md)", background: toneColor.bg, color: toneColor.fg, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon name={icon} size={18} />
                </span>
              )}
              <span style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)" }}>{title}</span>
            </div>
            {onClose && (
              <button onClick={onClose} aria-label="Cerrar" style={{ width: 32, height: 32, display: "inline-flex", alignItems: "center", justifyContent: "center", background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", borderRadius: "var(--radius-md)" }}>
                <Icon name="x" size={20} />
              </button>
            )}
          </div>
        )}
        <div style={{ padding: 20 }}>{children}</div>
        {footer && (
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, padding: "14px 20px", borderTop: "1px solid var(--border)", background: "var(--surface-alt)", borderBottomLeftRadius: "var(--radius-lg)", borderBottomRightRadius: "var(--radius-lg)" }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
