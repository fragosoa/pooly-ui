import React from "react";

/**
 * Icon — thin wrapper over the Lucide line-icon set (the system's
 * official iconography). Requires the Lucide UMD script on the page:
 *   <script src="https://unpkg.com/lucide@latest"></script>
 * Renders a placeholder that Lucide swaps for an inline <svg> inheriting
 * currentColor. Stroke 2, round caps — matches the brand icon style.
 */
export function Icon({
  name,
  size = 20,
  strokeWidth = 2,
  color,
  className = "",
  style = {},
  ...rest
}) {
  const id = React.useId();

  React.useEffect(() => {
    if (typeof window !== "undefined" && window.lucide && window.lucide.createIcons) {
      try {
        window.lucide.createIcons();
      } catch (e) {
        /* no-op */
      }
    }
    const el = document.querySelector(`[data-pds-icon="${id}"]`);
    if (el && el.tagName.toLowerCase() === "svg") {
      el.setAttribute("width", size);
      el.setAttribute("height", size);
      el.setAttribute("stroke-width", strokeWidth);
    }
  });

  return React.createElement("i", {
    "data-lucide": name,
    "data-pds-icon": id,
    className,
    style: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: size,
      height: size,
      color,
      ...style,
    },
    ...rest,
  });
}
