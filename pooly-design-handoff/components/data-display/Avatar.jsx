import React from "react";

const PALETTE = [
  "var(--brand)", "var(--action)", "var(--success)",
  "var(--special)", "var(--info)", "var(--amber-600)",
];

function colorFor(seed = "") {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return PALETTE[h % PALETTE.length];
}

function initials(name = "") {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const SIZES = { xs: 26, sm: 32, md: 40, lg: 48 };

/**
 * Avatar — initials (color derived from name) or image. Round by
 * default (people / chat); `shape="rounded"` for the squared
 * testimonial-author style.
 */
export function Avatar({
  name = "",
  src,
  size = "md",
  shape = "round",
  color,
  style = {},
  ...rest
}) {
  const px = SIZES[size] || (typeof size === "number" ? size : 40);
  const radius = shape === "rounded" ? "var(--radius-md)" : "var(--radius-round)";
  const bg = color || colorFor(name);

  return (
    <span
      title={name}
      style={{
        width: px,
        height: px,
        flexShrink: 0,
        borderRadius: radius,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        background: src ? "var(--surface-alt)" : bg,
        color: "#fff",
        fontFamily: "var(--font-sans)",
        fontWeight: 700,
        fontSize: Math.round(px * 0.38),
        lineHeight: 1,
        userSelect: "none",
        ...style,
      }}
      {...rest}
    >
      {src ? (
        <img src={src} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      ) : (
        initials(name)
      )}
    </span>
  );
}
