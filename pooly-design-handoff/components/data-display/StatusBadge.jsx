import React from "react";
import { Badge } from "./Badge.jsx";

/**
 * StatusBadge — the product's semantic status vocabulary in one place.
 * Maps an e-commerce meaning (sentiment / urgency / order / job /
 * survey state) to the right tone, label, and icon. This is the
 * carried-over "colored label" pattern, re-mapped to commerce.
 */
const MAPS = {
  sentiment: {
    positive: { tone: "success", icon: "smile", label: "Positivo" },
    neutral:  { tone: "neutral", icon: "minus", label: "Neutral" },
    negative: { tone: "danger",  icon: "frown", label: "Negativo" },
  },
  urgency: {
    high:   { tone: "danger",  icon: "flame",       label: "Urgencia alta" },
    medium: { tone: "warning", icon: "alert-triangle", label: "Urgencia media" },
    low:    { tone: "neutral", icon: "arrow-down",  label: "Urgencia baja" },
  },
  order: {
    active:  { tone: "success", icon: "check-circle", label: "Activa" },
    closing: { tone: "warning", icon: "clock",        label: "Por cerrar" },
    urgent:  { tone: "danger",  icon: "alert-circle", label: "Urgente" },
    ended:   { tone: "neutral", icon: "circle-slash", label: "Finalizada" },
    paused:  { tone: "special", icon: "pause",        label: "Pausada" },
  },
  job: {
    completed: { tone: "success", icon: "check",     label: "Completado" },
    running:   { tone: "brand",   icon: "loader",    label: "En proceso" },
    error:     { tone: "danger",  icon: "x",         label: "Error" },
  },
  source: {
    online:   { tone: "info",    icon: "wifi",     label: "Online" },
    imported: { tone: "success", icon: "download", label: "Importado" },
  },
};

export function StatusBadge({ kind, value, label, ...rest }) {
  const map = MAPS[kind] || {};
  const cfg = map[value] || { tone: "neutral", icon: undefined, label: value };
  const running = kind === "job" && value === "running";
  return (
    <Badge
      tone={cfg.tone}
      icon={cfg.icon}
      uppercase={kind === "order"}
      pill={kind !== "order"}
      style={running ? { animation: "pooly-pulse 2s ease-in-out infinite" } : undefined}
      {...rest}
    >
      {label || cfg.label}
    </Badge>
  );
}
