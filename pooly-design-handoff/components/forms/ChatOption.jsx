import React from "react";

/**
 * ChatOption — a selectable choice in the public response screen.
 * `multi` switches the marker from radio dot to checkbox. Selected
 * state tints to brand. This is the shopper-facing answer control.
 */
export function ChatOption({
  children,
  selected = false,
  multi = false,
  onSelect,
  style = {},
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const active = selected || hover;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "12px 16px",
        border: `2px solid ${active ? "var(--brand)" : "var(--border)"}`,
        background: selected ? "var(--brand-soft)" : hover ? "var(--brand-tint)" : "var(--surface)",
        borderRadius: "var(--radius-md)",
        cursor: "pointer",
        userSelect: "none",
        transition: "border-color var(--dur-fast), background var(--dur-fast)",
        ...style,
      }}
      {...rest}
    >
      <span
        style={{
          width: 18,
          height: 18,
          flexShrink: 0,
          borderRadius: multi ? "var(--radius-xs)" : "var(--radius-round)",
          border: `2px solid ${selected ? "var(--brand)" : "var(--border)"}`,
          background: selected ? "var(--brand)" : "transparent",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "border-color var(--dur-fast), background var(--dur-fast)",
        }}
      >
        {selected && !multi && <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#fff" }} />}
        {selected && multi && (
          <span style={{ width: 5, height: 9, border: "2px solid #fff", borderTop: "none", borderLeft: "none", transform: "rotate(45deg) translateY(-1px)" }} />
        )}
      </span>
      <span style={{ fontSize: 15, color: "var(--text-primary)", lineHeight: 1.4 }}>{children}</span>
    </div>
  );
}
