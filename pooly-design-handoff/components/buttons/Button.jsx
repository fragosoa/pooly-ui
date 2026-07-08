import React from "react";
import { Icon } from "../icon/Icon.jsx";

const SIZES = {
  sm: { padding: "7px 14px", fontSize: "13px", radius: "var(--radius-sm)", icon: 15, gap: 6 },
  md: { padding: "10px 20px", fontSize: "14px", radius: "var(--radius-md)", icon: 17, gap: 8 },
  lg: { padding: "14px 28px", fontSize: "15px", radius: "var(--radius-md)", icon: 18, gap: 8 },
};

function variantStyle(variant) {
  switch (variant) {
    case "action":
      return { background: "var(--action)", color: "var(--text-on-action)", border: "1px solid transparent", "--hover-bg": "var(--action-hover)" };
    case "secondary":
      return { background: "var(--surface)", color: "var(--text-primary)", border: "1px solid var(--border)", "--hover-bg": "var(--surface-alt)" };
    case "ghost":
      return { background: "transparent", color: "var(--text-primary)", border: "1px solid var(--border)", "--hover-bg": "var(--surface-alt)" };
    case "danger":
      return { background: "var(--danger)", color: "#fff", border: "1px solid transparent", "--hover-bg": "#B91C1C" };
    case "ink":
      return { background: "var(--surface-dark)", color: "#fff", border: "1px solid transparent", "--hover-bg": "var(--brand)" };
    case "primary":
    default:
      return { background: "var(--brand)", color: "#fff", border: "1px solid transparent", "--hover-bg": "var(--brand-hover)" };
  }
}

/**
 * Button — the system's core action. Primary = brand blue; Action =
 * deep action-blue (conversion only); secondary/ghost/danger/ink as needed.
 */
export function Button({
  children,
  variant = "primary",
  size = "md",
  leftIcon,
  rightIcon,
  loading = false,
  fullWidth = false,
  disabled = false,
  as = "button",
  href,
  style = {},
  ...rest
}) {
  const s = SIZES[size] || SIZES.md;
  const v = variantStyle(variant);
  const isDisabled = disabled || loading;
  const [hover, setHover] = React.useState(false);

  const base = {
    display: fullWidth ? "flex" : "inline-flex",
    width: fullWidth ? "100%" : undefined,
    alignItems: "center",
    justifyContent: "center",
    gap: s.gap,
    padding: s.padding,
    fontFamily: "var(--font-sans)",
    fontSize: s.fontSize,
    fontWeight: 600,
    lineHeight: 1,
    letterSpacing: "0.01em",
    borderRadius: s.radius,
    cursor: isDisabled ? "not-allowed" : "pointer",
    textDecoration: "none",
    whiteSpace: "nowrap",
    transition: "var(--transition-control)",
    opacity: isDisabled ? 0.55 : 1,
    background: hover && !isDisabled ? v["--hover-bg"] : v.background,
    color: v.color,
    border: v.border,
    transform: hover && !isDisabled && (variant === "action") ? "translateY(-1px)" : "none",
    ...style,
  };

  const content = (
    <>
      {loading && (
        <span
          aria-hidden
          style={{
            width: s.icon - 3,
            height: s.icon - 3,
            border: "2px solid currentColor",
            borderTopColor: "transparent",
            borderRadius: "50%",
            opacity: 0.85,
            animation: "pooly-spin 0.7s linear infinite",
          }}
        />
      )}
      {!loading && leftIcon && <Icon name={leftIcon} size={s.icon} />}
      {children && <span>{children}</span>}
      {!loading && rightIcon && <Icon name={rightIcon} size={s.icon} />}
    </>
  );

  const handlers = {
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
  };

  if (as === "a") {
    return (
      <a href={href} style={base} {...handlers} {...rest}>
        {content}
      </a>
    );
  }
  return (
    <button type="button" disabled={isDisabled} style={base} {...handlers} {...rest}>
      {content}
    </button>
  );
}
