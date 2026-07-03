import React from "react";

/**
 * Textarea — multi-line input. Matches Input's focus treatment.
 * The public chat answer box uses a thicker 2px border (chat prop).
 */
export function Textarea({
  error = false,
  chat = false,
  rows = 4,
  style = {},
  ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  const borderW = chat ? 2 : 1;
  const borderColor = error ? "var(--danger)" : focus ? "var(--brand)" : "var(--border)";

  return (
    <textarea
      rows={rows}
      onFocus={(e) => { setFocus(true); rest.onFocus && rest.onFocus(e); }}
      onBlur={(e) => { setFocus(false); rest.onBlur && rest.onBlur(e); }}
      {...rest}
      style={{
        width: "100%",
        padding: chat ? "14px 16px" : "10px 14px",
        fontFamily: "var(--font-sans)",
        fontSize: chat ? 16 : 14,
        lineHeight: 1.5,
        color: "var(--text-primary)",
        background: "var(--surface)",
        border: `${borderW}px solid ${borderColor}`,
        borderRadius: chat ? "var(--radius-lg)" : "var(--radius-sm)",
        outline: "none",
        resize: "vertical",
        minHeight: chat ? 96 : 80,
        boxShadow: focus ? (chat ? "0 0 0 4px var(--brand-soft)" : "var(--ring)") : "none",
        transition: "border-color var(--dur-base), box-shadow var(--dur-base)",
        ...style,
      }}
    />
  );
}
