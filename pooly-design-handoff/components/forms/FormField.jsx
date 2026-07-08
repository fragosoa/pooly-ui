import React from "react";

/**
 * FormField — label + control wrapper with optional hint and error
 * message. Wrap an Input/Textarea/Select as the child.
 */
export function FormField({ label, hint, error, required = false, htmlFor, children, style = {} }) {
  return (
    <div style={{ marginBottom: 16, ...style }}>
      {label && (
        <label
          htmlFor={htmlFor}
          style={{
            display: "block",
            fontSize: 14,
            fontWeight: 600,
            color: "var(--text-secondary)",
            marginBottom: 6,
          }}
        >
          {label}
          {required && <span style={{ color: "var(--danger)", marginLeft: 3 }}>*</span>}
        </label>
      )}
      {children}
      {error ? (
        <div style={{ fontSize: 12.5, color: "var(--danger)", marginTop: 6 }}>{error}</div>
      ) : hint ? (
        <div style={{ fontSize: 12.5, color: "var(--text-muted)", marginTop: 6 }}>{hint}</div>
      ) : null}
    </div>
  );
}
