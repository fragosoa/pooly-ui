import React from "react";
import { Icon } from "../icon/Icon.jsx";

/**
 * Spinner — brand ring loader.
 */
export function Spinner({ size = 24, tone = "brand", style = {} }) {
  const color = { brand: "var(--brand)", action: "var(--action)", muted: "var(--text-muted)" }[tone] || "var(--brand)";
  return (
    <span
      role="status"
      aria-label="Cargando"
      style={{
        display: "inline-block",
        width: size,
        height: size,
        border: `${Math.max(2, Math.round(size / 12))}px solid var(--border)`,
        borderTopColor: color,
        borderRadius: "50%",
        animation: "pooly-spin 0.8s linear infinite",
        ...style,
      }}
    />
  );
}
