import React from "react";
import { Icon } from "../icon/Icon.jsx";

/**
 * Input — single-line text field. 1px border that turns brand-blue
 * with a 3px soft focus ring. Optional leading icon and error state.
 */
export function Input({
  leftIcon,
  error = false,
  size = "md",
  style = {},
  ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  const pad = size === "lg" ? "12px 14px" : "10px 14px";
  const fontSize = size === "lg" ? 16 : 14;
  const borderColor = error ? "var(--danger)" : focus ? "var(--brand)" : "var(--border)";

  return (
    <div style={{ position: "relative", display: "flex", alignItems: "center", ...style }}>
      {leftIcon && (
        <span style={{ position: "absolute", left: 12, color: "var(--text-muted)", pointerEvents: "none", display: "inline-flex" }}>
          <Icon name={leftIcon} size={17} />
        </span>
      )}
      <input
        onFocus={(e) => { setFocus(true); rest.onFocus && rest.onFocus(e); }}
        onBlur={(e) => { setFocus(false); rest.onBlur && rest.onBlur(e); }}
        {...rest}
        style={{
          width: "100%",
          padding: leftIcon ? `${pad.split(" ")[0]} 14px ${pad.split(" ")[0]} 38px` : pad,
          fontFamily: "var(--font-sans)",
          fontSize,
          color: "var(--text-primary)",
          background: "var(--surface)",
          border: `1px solid ${borderColor}`,
          borderRadius: "var(--radius-sm)",
          outline: "none",
          boxShadow: focus ? (error ? "0 0 0 3px var(--danger-soft)" : "var(--ring)") : "none",
          transition: "border-color var(--dur-base), box-shadow var(--dur-base)",
        }}
      />
    </div>
  );
}
