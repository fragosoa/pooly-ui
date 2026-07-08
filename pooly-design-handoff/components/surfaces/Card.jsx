import React from "react";

/**
 * Card — the base surface. White, 1px border, 12px radius, subtle
 * shadow. `interactive` adds the brand-border + lift hover used across
 * event/feature/report cards. `padding` accepts a token number (px).
 */
export function Card({
  children,
  interactive = false,
  elevated = false,
  padding = 24,
  style = {},
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const lifted = interactive && hover;

  return (
    <div
      onMouseEnter={() => interactive && setHover(true)}
      onMouseLeave={() => interactive && setHover(false)}
      style={{
        background: "var(--surface)",
        border: `1px solid ${lifted ? "var(--brand)" : "var(--border)"}`,
        borderRadius: "var(--radius-lg)",
        boxShadow: lifted ? "var(--shadow-md)" : elevated ? "var(--shadow-md)" : "var(--shadow-sm)",
        padding,
        transition: "var(--transition-control)",
        transform: lifted ? "translateY(-1px)" : "none",
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}
