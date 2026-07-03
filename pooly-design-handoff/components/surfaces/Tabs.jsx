import React from "react";
import { Icon } from "../icon/Icon.jsx";
import { Badge } from "../data-display/Badge.jsx";

/**
 * Tabs — underline tab bar. Active tab is brand-colored with a 2px
 * brand underline. Each tab: { id, label, icon?, count? }.
 */
export function Tabs({ tabs = [], value, onChange, style = {} }) {
  const [hover, setHover] = React.useState(null);
  return (
    <div
      role="tablist"
      style={{ display: "flex", gap: 4, borderBottom: "2px solid var(--border)", ...style }}
    >
      {tabs.map((tab) => {
        const active = tab.id === value;
        const isHover = hover === tab.id;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={active}
            onClick={() => onChange && onChange(tab.id)}
            onMouseEnter={() => setHover(tab.id)}
            onMouseLeave={() => setHover(null)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "12px 18px",
              marginBottom: -2,
              fontFamily: "var(--font-sans)",
              fontSize: 14.5,
              fontWeight: active ? 700 : 500,
              color: active ? "var(--brand)" : "var(--text-secondary)",
              background: !active && isHover ? "var(--surface-alt)" : "transparent",
              border: "none",
              borderBottom: `2px solid ${active ? "var(--brand)" : "transparent"}`,
              cursor: "pointer",
              transition: "var(--transition-control)",
              borderTopLeftRadius: "var(--radius-sm)",
              borderTopRightRadius: "var(--radius-sm)",
            }}
          >
            {tab.icon && <Icon name={tab.icon} size={16} />}
            {tab.label}
            {tab.count != null && (
              <Badge tone={active ? "brand" : "neutral"} pill style={{ padding: "1px 8px", fontSize: 11 }}>
                {tab.count}
              </Badge>
            )}
          </button>
        );
      })}
    </div>
  );
}
