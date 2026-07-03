import React from "react";
import { Icon } from "../icon/Icon.jsx";

const SIZES = { sm: { box: 32, icon: 16 }, md: { box: 38, icon: 18 }, lg: { box: 44, icon: 20 } };

/**
 * IconButton — square/round icon-only action (toolbar, close, copy, FAB).
 */
export function IconButton({
  icon,
  size = "md",
  variant = "ghost",
  round = false,
  label,
  disabled = false,
  style = {},
  ...rest
}) {
  const s = SIZES[size] || SIZES.md;
  const [hover, setHover] = React.useState(false);

  const variants = {
    ghost: { bg: "transparent", color: "var(--text-secondary)", hoverBg: "var(--surface-alt)", border: "none" },
    outline: { bg: "var(--surface)", color: "var(--text-primary)", hoverBg: "var(--surface-alt)", border: "1px solid var(--border)" },
    brand: { bg: "var(--brand)", color: "#fff", hoverBg: "var(--brand-hover)", border: "none" },
    action: { bg: "var(--action)", color: "#fff", hoverBg: "var(--action-hover)", border: "none" },
  };
  const v = variants[variant] || variants.ghost;

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: s.box,
        height: s.box,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: round ? "var(--radius-round)" : "var(--radius-md)",
        background: hover && !disabled ? v.hoverBg : v.bg,
        color: v.color,
        border: v.border,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        transition: "var(--transition-control)",
        ...style,
      }}
      {...rest}
    >
      <Icon name={icon} size={s.icon} />
    </button>
  );
}
