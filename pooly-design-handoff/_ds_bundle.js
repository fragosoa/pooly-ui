/* @ds-bundle: {"format":4,"namespace":"PoolyDesignSystem_3787fa","components":[{"name":"Button","sourcePath":"components/buttons/Button.jsx"},{"name":"IconButton","sourcePath":"components/buttons/IconButton.jsx"},{"name":"Avatar","sourcePath":"components/data-display/Avatar.jsx"},{"name":"Badge","sourcePath":"components/data-display/Badge.jsx"},{"name":"ProgressBar","sourcePath":"components/data-display/ProgressBar.jsx"},{"name":"StatCard","sourcePath":"components/data-display/StatCard.jsx"},{"name":"StatusBadge","sourcePath":"components/data-display/StatusBadge.jsx"},{"name":"Alert","sourcePath":"components/feedback/Alert.jsx"},{"name":"Modal","sourcePath":"components/feedback/Modal.jsx"},{"name":"Spinner","sourcePath":"components/feedback/Spinner.jsx"},{"name":"ChatOption","sourcePath":"components/forms/ChatOption.jsx"},{"name":"FormField","sourcePath":"components/forms/FormField.jsx"},{"name":"Input","sourcePath":"components/forms/Input.jsx"},{"name":"Textarea","sourcePath":"components/forms/Textarea.jsx"},{"name":"Icon","sourcePath":"components/icon/Icon.jsx"},{"name":"ReportCard","sourcePath":"components/product/ReportCard.jsx"},{"name":"ShareLink","sourcePath":"components/product/ShareLink.jsx"},{"name":"Card","sourcePath":"components/surfaces/Card.jsx"},{"name":"Tabs","sourcePath":"components/surfaces/Tabs.jsx"}],"sourceHashes":{"components/buttons/Button.jsx":"d88da3dd6704","components/buttons/IconButton.jsx":"6a407971870c","components/data-display/Avatar.jsx":"9fcdc246ead5","components/data-display/Badge.jsx":"42bb341aed48","components/data-display/ProgressBar.jsx":"dc8142d51606","components/data-display/StatCard.jsx":"1d0d48d83c8a","components/data-display/StatusBadge.jsx":"133c2b157c22","components/feedback/Alert.jsx":"775813914f01","components/feedback/Modal.jsx":"819035192bf4","components/feedback/Spinner.jsx":"b56d74911b90","components/forms/ChatOption.jsx":"351e75ade99b","components/forms/FormField.jsx":"e5da26bd7ced","components/forms/Input.jsx":"b75e26673082","components/forms/Textarea.jsx":"dd175f79c34d","components/icon/Icon.jsx":"89b02ed87ec2","components/product/ReportCard.jsx":"eaacb51c9ab9","components/product/ShareLink.jsx":"f6b2748cdd2a","components/surfaces/Card.jsx":"9efd1f0233be","components/surfaces/Tabs.jsx":"4d00d9c30ec6","ui_kits/admin/AppShell.jsx":"83740a9855d5","ui_kits/admin/Dashboard.jsx":"91391d90db30","ui_kits/admin/EventDetails.jsx":"6e8ebf7f4af0","ui_kits/admin/SurveyBuilder.jsx":"07b372c919ac","ui_kits/admin/data.js":"61bcfe6b74f1"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.PoolyDesignSystem_3787fa = window.PoolyDesignSystem_3787fa || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/data-display/Avatar.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const PALETTE = ["var(--brand)", "var(--action)", "var(--success)", "var(--special)", "var(--info)", "var(--amber-600)"];
function colorFor(seed = "") {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = h * 31 + seed.charCodeAt(i) >>> 0;
  return PALETTE[h % PALETTE.length];
}
function initials(name = "") {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
const SIZES = {
  xs: 26,
  sm: 32,
  md: 40,
  lg: 48
};

/**
 * Avatar — initials (color derived from name) or image. Round by
 * default (people / chat); `shape="rounded"` for the squared
 * testimonial-author style.
 */
function Avatar({
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
  return /*#__PURE__*/React.createElement("span", _extends({
    title: name,
    style: {
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
      ...style
    }
  }, rest), src ? /*#__PURE__*/React.createElement("img", {
    src: src,
    alt: name,
    style: {
      width: "100%",
      height: "100%",
      objectFit: "cover"
    }
  }) : initials(name));
}
Object.assign(__ds_scope, { Avatar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data-display/Avatar.jsx", error: String((e && e.message) || e) }); }

// components/data-display/ProgressBar.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * ProgressBar — thin track + brand fill. Used for survey progress,
 * theme distribution bars, and step indicators. `tone` recolors the fill.
 */
function ProgressBar({
  value = 0,
  max = 100,
  tone = "brand",
  height = 8,
  showLabel = false,
  style = {},
  ...rest
}) {
  const pct = Math.max(0, Math.min(100, value / max * 100));
  const fill = {
    brand: "var(--brand)",
    action: "var(--action)",
    success: "var(--success)",
    warning: "var(--warning)",
    danger: "var(--danger)"
  }[tone] || "var(--brand)";
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      display: "flex",
      alignItems: "center",
      gap: 12,
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      height,
      background: "var(--surface-alt)",
      borderRadius: "var(--radius-pill)",
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: `${pct}%`,
      height: "100%",
      background: fill,
      borderRadius: "var(--radius-pill)",
      transition: "width 0.4s var(--ease-out)"
    }
  })), showLabel && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      fontWeight: 700,
      color: "var(--text-secondary)",
      minWidth: 36,
      textAlign: "right"
    }
  }, Math.round(pct), "%"));
}
Object.assign(__ds_scope, { ProgressBar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data-display/ProgressBar.jsx", error: String((e && e.message) || e) }); }

// components/forms/ChatOption.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * ChatOption — a selectable choice in the public response screen.
 * `multi` switches the marker from radio dot to checkbox. Selected
 * state tints to brand. This is the shopper-facing answer control.
 */
function ChatOption({
  children,
  selected = false,
  multi = false,
  onSelect,
  style = {},
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const active = selected || hover;
  return /*#__PURE__*/React.createElement("div", _extends({
    role: "button",
    tabIndex: 0,
    onClick: onSelect,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
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
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("span", {
    style: {
      width: 18,
      height: 18,
      flexShrink: 0,
      borderRadius: multi ? "var(--radius-xs)" : "var(--radius-round)",
      border: `2px solid ${selected ? "var(--brand)" : "var(--border)"}`,
      background: selected ? "var(--brand)" : "transparent",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      transition: "border-color var(--dur-fast), background var(--dur-fast)"
    }
  }, selected && !multi && /*#__PURE__*/React.createElement("span", {
    style: {
      width: 6,
      height: 6,
      borderRadius: "50%",
      background: "#fff"
    }
  }), selected && multi && /*#__PURE__*/React.createElement("span", {
    style: {
      width: 5,
      height: 9,
      border: "2px solid #fff",
      borderTop: "none",
      borderLeft: "none",
      transform: "rotate(45deg) translateY(-1px)"
    }
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 15,
      color: "var(--text-primary)",
      lineHeight: 1.4
    }
  }, children));
}
Object.assign(__ds_scope, { ChatOption });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/ChatOption.jsx", error: String((e && e.message) || e) }); }

// components/forms/FormField.jsx
try { (() => {
/**
 * FormField — label + control wrapper with optional hint and error
 * message. Wrap an Input/Textarea/Select as the child.
 */
function FormField({
  label,
  hint,
  error,
  required = false,
  htmlFor,
  children,
  style = {}
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 16,
      ...style
    }
  }, label && /*#__PURE__*/React.createElement("label", {
    htmlFor: htmlFor,
    style: {
      display: "block",
      fontSize: 14,
      fontWeight: 600,
      color: "var(--text-secondary)",
      marginBottom: 6
    }
  }, label, required && /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--danger)",
      marginLeft: 3
    }
  }, "*")), children, error ? /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12.5,
      color: "var(--danger)",
      marginTop: 6
    }
  }, error) : hint ? /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12.5,
      color: "var(--text-muted)",
      marginTop: 6
    }
  }, hint) : null);
}
Object.assign(__ds_scope, { FormField });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/FormField.jsx", error: String((e && e.message) || e) }); }

// components/forms/Textarea.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Textarea — multi-line input. Matches Input's focus treatment.
 * The public chat answer box uses a thicker 2px border (chat prop).
 */
function Textarea({
  error = false,
  chat = false,
  rows = 4,
  style = {},
  ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  const borderW = chat ? 2 : 1;
  const borderColor = error ? "var(--danger)" : focus ? "var(--brand)" : "var(--border)";
  return /*#__PURE__*/React.createElement("textarea", _extends({
    rows: rows,
    onFocus: e => {
      setFocus(true);
      rest.onFocus && rest.onFocus(e);
    },
    onBlur: e => {
      setFocus(false);
      rest.onBlur && rest.onBlur(e);
    }
  }, rest, {
    style: {
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
      boxShadow: focus ? chat ? "0 0 0 4px var(--brand-soft)" : "var(--ring)" : "none",
      transition: "border-color var(--dur-base), box-shadow var(--dur-base)",
      ...style
    }
  }));
}
Object.assign(__ds_scope, { Textarea });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Textarea.jsx", error: String((e && e.message) || e) }); }

// components/icon/Icon.jsx
try { (() => {
/**
 * Icon — thin wrapper over the Lucide line-icon set (the system's
 * official iconography). Requires the Lucide UMD script on the page:
 *   <script src="https://unpkg.com/lucide@latest"></script>
 * Renders a placeholder that Lucide swaps for an inline <svg> inheriting
 * currentColor. Stroke 2, round caps — matches the brand icon style.
 */
function Icon({
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
      ...style
    },
    ...rest
  });
}
Object.assign(__ds_scope, { Icon });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/icon/Icon.jsx", error: String((e && e.message) || e) }); }

// components/buttons/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const SIZES = {
  sm: {
    padding: "7px 14px",
    fontSize: "13px",
    radius: "var(--radius-sm)",
    icon: 15,
    gap: 6
  },
  md: {
    padding: "10px 20px",
    fontSize: "14px",
    radius: "var(--radius-md)",
    icon: 17,
    gap: 8
  },
  lg: {
    padding: "14px 28px",
    fontSize: "15px",
    radius: "var(--radius-md)",
    icon: 18,
    gap: 8
  }
};
function variantStyle(variant) {
  switch (variant) {
    case "action":
      return {
        background: "var(--action)",
        color: "var(--text-on-action)",
        border: "1px solid transparent",
        "--hover-bg": "var(--action-hover)"
      };
    case "secondary":
      return {
        background: "var(--surface)",
        color: "var(--text-primary)",
        border: "1px solid var(--border)",
        "--hover-bg": "var(--surface-alt)"
      };
    case "ghost":
      return {
        background: "transparent",
        color: "var(--text-primary)",
        border: "1px solid var(--border)",
        "--hover-bg": "var(--surface-alt)"
      };
    case "danger":
      return {
        background: "var(--danger)",
        color: "#fff",
        border: "1px solid transparent",
        "--hover-bg": "#B91C1C"
      };
    case "ink":
      return {
        background: "var(--surface-dark)",
        color: "#fff",
        border: "1px solid transparent",
        "--hover-bg": "var(--brand)"
      };
    case "primary":
    default:
      return {
        background: "var(--brand)",
        color: "#fff",
        border: "1px solid transparent",
        "--hover-bg": "var(--brand-hover)"
      };
  }
}

/**
 * Button — the system's core action. Primary = brand blue; Action =
 * deep action-blue (conversion only); secondary/ghost/danger/ink as needed.
 */
function Button({
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
    transform: hover && !isDisabled && variant === "action" ? "translateY(-1px)" : "none",
    ...style
  };
  const content = /*#__PURE__*/React.createElement(React.Fragment, null, loading && /*#__PURE__*/React.createElement("span", {
    "aria-hidden": true,
    style: {
      width: s.icon - 3,
      height: s.icon - 3,
      border: "2px solid currentColor",
      borderTopColor: "transparent",
      borderRadius: "50%",
      opacity: 0.85,
      animation: "pooly-spin 0.7s linear infinite"
    }
  }), !loading && leftIcon && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: leftIcon,
    size: s.icon
  }), children && /*#__PURE__*/React.createElement("span", null, children), !loading && rightIcon && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: rightIcon,
    size: s.icon
  }));
  const handlers = {
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false)
  };
  if (as === "a") {
    return /*#__PURE__*/React.createElement("a", _extends({
      href: href,
      style: base
    }, handlers, rest), content);
  }
  return /*#__PURE__*/React.createElement("button", _extends({
    type: "button",
    disabled: isDisabled,
    style: base
  }, handlers, rest), content);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/buttons/Button.jsx", error: String((e && e.message) || e) }); }

// components/buttons/IconButton.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const SIZES = {
  sm: {
    box: 32,
    icon: 16
  },
  md: {
    box: 38,
    icon: 18
  },
  lg: {
    box: 44,
    icon: 20
  }
};

/**
 * IconButton — square/round icon-only action (toolbar, close, copy, FAB).
 */
function IconButton({
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
    ghost: {
      bg: "transparent",
      color: "var(--text-secondary)",
      hoverBg: "var(--surface-alt)",
      border: "none"
    },
    outline: {
      bg: "var(--surface)",
      color: "var(--text-primary)",
      hoverBg: "var(--surface-alt)",
      border: "1px solid var(--border)"
    },
    brand: {
      bg: "var(--brand)",
      color: "#fff",
      hoverBg: "var(--brand-hover)",
      border: "none"
    },
    action: {
      bg: "var(--action)",
      color: "#fff",
      hoverBg: "var(--action-hover)",
      border: "none"
    }
  };
  const v = variants[variant] || variants.ghost;
  return /*#__PURE__*/React.createElement("button", _extends({
    type: "button",
    "aria-label": label,
    title: label,
    disabled: disabled,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
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
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: s.icon
  }));
}
Object.assign(__ds_scope, { IconButton });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/buttons/IconButton.jsx", error: String((e && e.message) || e) }); }

// components/data-display/Badge.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const TONES = {
  brand: {
    bg: "var(--brand-soft)",
    fg: "var(--brand-hover)"
  },
  action: {
    bg: "var(--action-soft)",
    fg: "var(--action-hover)"
  },
  success: {
    bg: "var(--success-soft)",
    fg: "var(--success)"
  },
  danger: {
    bg: "var(--danger-soft)",
    fg: "var(--danger)"
  },
  warning: {
    bg: "var(--warning-soft)",
    fg: "var(--warning)"
  },
  info: {
    bg: "var(--info-soft)",
    fg: "var(--info)"
  },
  special: {
    bg: "var(--special-soft)",
    fg: "var(--special)"
  },
  neutral: {
    bg: "var(--surface-alt)",
    fg: "var(--text-secondary)"
  }
};

/**
 * Badge — small colored label. The carried-over functional color
 * pattern: tone communicates meaning (status, sentiment, count).
 */
function Badge({
  children,
  tone = "neutral",
  icon,
  dot = false,
  pill = true,
  uppercase = false,
  style = {},
  ...rest
}) {
  const t = TONES[tone] || TONES.neutral;
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      padding: uppercase ? "3px 9px" : "4px 10px",
      background: t.bg,
      color: t.fg,
      fontFamily: "var(--font-sans)",
      fontSize: uppercase ? "11px" : "12px",
      fontWeight: 600,
      lineHeight: 1.35,
      letterSpacing: uppercase ? "0.06em" : "0.01em",
      textTransform: uppercase ? "uppercase" : "none",
      borderRadius: pill ? "var(--radius-pill)" : "var(--radius-sm)",
      whiteSpace: "nowrap",
      ...style
    }
  }, rest), dot && /*#__PURE__*/React.createElement("span", {
    style: {
      width: 6,
      height: 6,
      borderRadius: "50%",
      background: "currentColor",
      flexShrink: 0
    }
  }), icon && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: 13
  }), children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data-display/Badge.jsx", error: String((e && e.message) || e) }); }

// components/data-display/StatCard.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const ICON_TONES = {
  brand: {
    bg: "var(--brand-soft)",
    fg: "var(--brand)"
  },
  success: {
    bg: "var(--success-soft)",
    fg: "var(--success)"
  },
  info: {
    bg: "var(--info-soft)",
    fg: "var(--info)"
  },
  warning: {
    bg: "var(--warning-soft)",
    fg: "var(--warning)"
  },
  action: {
    bg: "var(--action-soft)",
    fg: "var(--action-hover)"
  }
};

/**
 * StatCard — dashboard KPI tile: tinted icon bubble + big value + label,
 * optional trend chip. Hover lifts and tints the border to brand.
 */
function StatCard({
  icon,
  tone = "brand",
  value,
  label,
  trend,
  trendDir = "up",
  style = {},
  ...rest
}) {
  const t = ICON_TONES[tone] || ICON_TONES.brand;
  const [hover, setHover] = React.useState(false);
  const trendColor = trendDir === "down" ? "var(--danger)" : "var(--success)";
  return /*#__PURE__*/React.createElement("div", _extends({
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      display: "flex",
      alignItems: "center",
      gap: 16,
      padding: 20,
      background: "var(--surface)",
      border: `1px solid ${hover ? "var(--brand)" : "var(--border)"}`,
      borderRadius: "var(--radius-lg)",
      boxShadow: hover ? "var(--shadow-md)" : "var(--shadow-sm)",
      transition: "var(--transition-control)",
      ...style
    }
  }, rest), icon && /*#__PURE__*/React.createElement("span", {
    style: {
      width: 48,
      height: 48,
      flexShrink: 0,
      borderRadius: "var(--radius-md)",
      background: t.bg,
      color: t.fg,
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: 24
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "baseline",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 28,
      fontWeight: 800,
      color: "var(--text-primary)",
      lineHeight: 1.1,
      letterSpacing: "-0.02em"
    }
  }, value), trend && /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 2,
      fontSize: 12,
      fontWeight: 700,
      color: trendColor
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: trendDir === "down" ? "trending-down" : "trending-up",
    size: 13
  }), trend)), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      color: "var(--text-secondary)",
      marginTop: 2
    }
  }, label)));
}
Object.assign(__ds_scope, { StatCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data-display/StatCard.jsx", error: String((e && e.message) || e) }); }

// components/data-display/StatusBadge.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * StatusBadge — the product's semantic status vocabulary in one place.
 * Maps an e-commerce meaning (sentiment / urgency / order / job /
 * survey state) to the right tone, label, and icon. This is the
 * carried-over "colored label" pattern, re-mapped to commerce.
 */
const MAPS = {
  sentiment: {
    positive: {
      tone: "success",
      icon: "smile",
      label: "Positivo"
    },
    neutral: {
      tone: "neutral",
      icon: "minus",
      label: "Neutral"
    },
    negative: {
      tone: "danger",
      icon: "frown",
      label: "Negativo"
    }
  },
  urgency: {
    high: {
      tone: "danger",
      icon: "flame",
      label: "Urgencia alta"
    },
    medium: {
      tone: "warning",
      icon: "alert-triangle",
      label: "Urgencia media"
    },
    low: {
      tone: "neutral",
      icon: "arrow-down",
      label: "Urgencia baja"
    }
  },
  order: {
    active: {
      tone: "success",
      icon: "check-circle",
      label: "Activa"
    },
    closing: {
      tone: "warning",
      icon: "clock",
      label: "Por cerrar"
    },
    urgent: {
      tone: "danger",
      icon: "alert-circle",
      label: "Urgente"
    },
    ended: {
      tone: "neutral",
      icon: "circle-slash",
      label: "Finalizada"
    },
    paused: {
      tone: "special",
      icon: "pause",
      label: "Pausada"
    }
  },
  job: {
    completed: {
      tone: "success",
      icon: "check",
      label: "Completado"
    },
    running: {
      tone: "brand",
      icon: "loader",
      label: "En proceso"
    },
    error: {
      tone: "danger",
      icon: "x",
      label: "Error"
    }
  },
  source: {
    online: {
      tone: "info",
      icon: "wifi",
      label: "Online"
    },
    imported: {
      tone: "success",
      icon: "download",
      label: "Importado"
    }
  }
};
function StatusBadge({
  kind,
  value,
  label,
  ...rest
}) {
  const map = MAPS[kind] || {};
  const cfg = map[value] || {
    tone: "neutral",
    icon: undefined,
    label: value
  };
  const running = kind === "job" && value === "running";
  return /*#__PURE__*/React.createElement(__ds_scope.Badge, _extends({
    tone: cfg.tone,
    icon: cfg.icon,
    uppercase: kind === "order",
    pill: kind !== "order",
    style: running ? {
      animation: "pooly-pulse 2s ease-in-out infinite"
    } : undefined
  }, rest), label || cfg.label);
}
Object.assign(__ds_scope, { StatusBadge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data-display/StatusBadge.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Alert.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const VARIANTS = {
  success: {
    bg: "var(--success-soft)",
    fg: "var(--success)",
    icon: "check-circle"
  },
  error: {
    bg: "var(--danger-soft)",
    fg: "var(--danger)",
    icon: "alert-circle"
  },
  warning: {
    bg: "var(--warning-soft)",
    fg: "var(--warning)",
    icon: "alert-triangle"
  },
  info: {
    bg: "var(--brand-soft)",
    fg: "var(--brand-hover)",
    icon: "info"
  }
};

/**
 * Alert — inline status message. Soft tinted background, leading icon.
 */
function Alert({
  variant = "info",
  title,
  children,
  onClose,
  style = {},
  ...rest
}) {
  const v = VARIANTS[variant] || VARIANTS.info;
  return /*#__PURE__*/React.createElement("div", _extends({
    role: "status",
    style: {
      display: "flex",
      alignItems: "flex-start",
      gap: 10,
      padding: "12px 14px",
      background: v.bg,
      color: v.fg,
      borderRadius: "var(--radius-md)",
      fontSize: 14,
      lineHeight: 1.5,
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("span", {
    style: {
      flexShrink: 0,
      marginTop: 1,
      display: "inline-flex"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: v.icon,
    size: 18
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, title && /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 700,
      marginBottom: children ? 2 : 0
    }
  }, title), children && /*#__PURE__*/React.createElement("div", {
    style: {
      color: "var(--text-secondary)"
    }
  }, children)), onClose && /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    "aria-label": "Cerrar",
    style: {
      background: "none",
      border: "none",
      color: "currentColor",
      cursor: "pointer",
      padding: 0,
      display: "inline-flex",
      opacity: 0.7
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "x",
    size: 16
  })));
}
Object.assign(__ds_scope, { Alert });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Alert.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Modal.jsx
try { (() => {
/**
 * Modal — centered dialog with overlay, header, body, optional footer.
 * Rounded 12px, subtle slide-up. Pass `open` to control visibility.
 */
function Modal({
  open = true,
  title,
  onClose,
  children,
  footer,
  width = 480,
  tone,
  icon
}) {
  if (!open) return null;
  const toneColor = {
    danger: {
      bg: "var(--danger-soft)",
      fg: "var(--danger)"
    },
    brand: {
      bg: "var(--brand-soft)",
      fg: "var(--brand)"
    },
    success: {
      bg: "var(--success-soft)",
      fg: "var(--success)"
    }
  }[tone];
  return /*#__PURE__*/React.createElement("div", {
    onClick: onClose,
    style: {
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 16,
      zIndex: 1000,
      animation: "pooly-fade-in 0.2s var(--ease-out)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    onClick: e => e.stopPropagation(),
    role: "dialog",
    "aria-modal": "true",
    style: {
      width: "100%",
      maxWidth: width,
      maxHeight: "90vh",
      overflow: "auto",
      background: "var(--surface)",
      border: "1px solid var(--border)",
      borderRadius: "var(--radius-lg)",
      boxShadow: "var(--shadow-xl)",
      animation: "pooly-fade-in 0.2s var(--ease-out)"
    }
  }, (title || onClose) && /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
      padding: "18px 20px",
      borderBottom: "1px solid var(--border)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10
    }
  }, icon && toneColor && /*#__PURE__*/React.createElement("span", {
    style: {
      width: 32,
      height: 32,
      borderRadius: "var(--radius-md)",
      background: toneColor.bg,
      color: toneColor.fg,
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: 18
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 18,
      fontWeight: 700,
      color: "var(--text-primary)"
    }
  }, title)), onClose && /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    "aria-label": "Cerrar",
    style: {
      width: 32,
      height: 32,
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      background: "none",
      border: "none",
      color: "var(--text-muted)",
      cursor: "pointer",
      borderRadius: "var(--radius-md)"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "x",
    size: 20
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 20
    }
  }, children), footer && /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "flex-end",
      gap: 12,
      padding: "14px 20px",
      borderTop: "1px solid var(--border)",
      background: "var(--surface-alt)",
      borderBottomLeftRadius: "var(--radius-lg)",
      borderBottomRightRadius: "var(--radius-lg)"
    }
  }, footer)));
}
Object.assign(__ds_scope, { Modal });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Modal.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Spinner.jsx
try { (() => {
/**
 * Spinner — brand ring loader.
 */
function Spinner({
  size = 24,
  tone = "brand",
  style = {}
}) {
  const color = {
    brand: "var(--brand)",
    action: "var(--action)",
    muted: "var(--text-muted)"
  }[tone] || "var(--brand)";
  return /*#__PURE__*/React.createElement("span", {
    role: "status",
    "aria-label": "Cargando",
    style: {
      display: "inline-block",
      width: size,
      height: size,
      border: `${Math.max(2, Math.round(size / 12))}px solid var(--border)`,
      borderTopColor: color,
      borderRadius: "50%",
      animation: "pooly-spin 0.8s linear infinite",
      ...style
    }
  });
}
Object.assign(__ds_scope, { Spinner });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Spinner.jsx", error: String((e && e.message) || e) }); }

// components/forms/Input.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Input — single-line text field. 1px border that turns brand-blue
 * with a 3px soft focus ring. Optional leading icon and error state.
 */
function Input({
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
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      display: "flex",
      alignItems: "center",
      ...style
    }
  }, leftIcon && /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      left: 12,
      color: "var(--text-muted)",
      pointerEvents: "none",
      display: "inline-flex"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: leftIcon,
    size: 17
  })), /*#__PURE__*/React.createElement("input", _extends({
    onFocus: e => {
      setFocus(true);
      rest.onFocus && rest.onFocus(e);
    },
    onBlur: e => {
      setFocus(false);
      rest.onBlur && rest.onBlur(e);
    }
  }, rest, {
    style: {
      width: "100%",
      padding: leftIcon ? `${pad.split(" ")[0]} 14px ${pad.split(" ")[0]} 38px` : pad,
      fontFamily: "var(--font-sans)",
      fontSize,
      color: "var(--text-primary)",
      background: "var(--surface)",
      border: `1px solid ${borderColor}`,
      borderRadius: "var(--radius-sm)",
      outline: "none",
      boxShadow: focus ? error ? "0 0 0 3px var(--danger-soft)" : "var(--ring)" : "none",
      transition: "border-color var(--dur-base), box-shadow var(--dur-base)"
    }
  })));
}
Object.assign(__ds_scope, { Input });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Input.jsx", error: String((e && e.message) || e) }); }

// components/product/ShareLink.jsx
try { (() => {
/**
 * ShareLink — the shareable survey URL block: an icon, a read-only
 * field, and a copy button that confirms with a green "Copiado" state.
 */
function ShareLink({
  url = "",
  title = "Comparte tu encuesta",
  subtitle = "Envía este enlace por WhatsApp, email o SMS — tus clientes responden sin crear cuenta.",
  style = {}
}) {
  const [copied, setCopied] = React.useState(false);
  const copy = () => {
    try {
      navigator.clipboard && navigator.clipboard.writeText(url);
    } catch (e) {}
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: "var(--surface)",
      border: "1px solid var(--border)",
      borderRadius: "var(--radius-lg)",
      padding: 20,
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 12,
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 40,
      height: 40,
      flexShrink: 0,
      borderRadius: "var(--radius-md)",
      background: "var(--brand-soft)",
      color: "var(--brand)",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "share-2",
    size: 20
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 15,
      fontWeight: 700,
      color: "var(--text-primary)"
    }
  }, title), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: "var(--text-secondary)",
      lineHeight: 1.45
    }
  }, subtitle))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("input", {
    readOnly: true,
    value: url,
    onFocus: e => e.target.select(),
    style: {
      flex: 1,
      minWidth: 0,
      padding: "11px 14px",
      fontSize: 14,
      fontFamily: "var(--font-mono)",
      color: "var(--text-secondary)",
      background: "var(--surface-sunken)",
      border: "1px solid var(--border)",
      borderRadius: "var(--radius-sm)",
      outline: "none"
    }
  }), /*#__PURE__*/React.createElement("button", {
    onClick: copy,
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 7,
      padding: "11px 18px",
      fontFamily: "var(--font-sans)",
      fontSize: 14,
      fontWeight: 600,
      color: "#fff",
      background: copied ? "var(--success)" : "var(--brand)",
      border: "none",
      borderRadius: "var(--radius-sm)",
      cursor: "pointer",
      whiteSpace: "nowrap",
      transition: "background var(--dur-base)"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: copied ? "check" : "copy",
    size: 16
  }), copied ? "Copiado" : "Copiar")));
}
Object.assign(__ds_scope, { ShareLink });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/product/ShareLink.jsx", error: String((e && e.message) || e) }); }

// components/surfaces/Card.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Card — the base surface. White, 1px border, 12px radius, subtle
 * shadow. `interactive` adds the brand-border + lift hover used across
 * event/feature/report cards. `padding` accepts a token number (px).
 */
function Card({
  children,
  interactive = false,
  elevated = false,
  padding = 24,
  style = {},
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const lifted = interactive && hover;
  return /*#__PURE__*/React.createElement("div", _extends({
    onMouseEnter: () => interactive && setHover(true),
    onMouseLeave: () => interactive && setHover(false),
    style: {
      background: "var(--surface)",
      border: `1px solid ${lifted ? "var(--brand)" : "var(--border)"}`,
      borderRadius: "var(--radius-lg)",
      boxShadow: lifted ? "var(--shadow-md)" : elevated ? "var(--shadow-md)" : "var(--shadow-sm)",
      padding,
      transition: "var(--transition-control)",
      transform: lifted ? "translateY(-1px)" : "none",
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/surfaces/Card.jsx", error: String((e && e.message) || e) }); }

// components/product/ReportCard.jsx
try { (() => {
/**
 * ReportCard — the heart of the product: one AI-discovered theme.
 * Shows the category, sentiment + urgency badges, the key stats
 * (mentions / % of total / responses), a summary, example quotes,
 * and an optional recommended action.
 */
function ReportCard({
  category,
  sentiment = "neutral",
  urgency = "medium",
  mentions,
  percent,
  responses,
  summary,
  quotes = [],
  recommendation,
  style = {}
}) {
  const stats = [mentions != null && {
    value: mentions,
    label: "Menciones"
  }, percent != null && {
    value: `${percent}%`,
    label: "Del total"
  }, responses != null && {
    value: responses,
    label: "Respuestas"
  }].filter(Boolean);
  return /*#__PURE__*/React.createElement(__ds_scope.Card, {
    interactive: true,
    padding: 24,
    style: style
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: 12,
      flexWrap: "wrap",
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("h4", {
    style: {
      margin: 0,
      fontSize: 18,
      fontWeight: 700,
      color: "var(--text-primary)"
    }
  }, category), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 6,
      flexWrap: "wrap"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.StatusBadge, {
    kind: "sentiment",
    value: sentiment
  }), /*#__PURE__*/React.createElement(__ds_scope.StatusBadge, {
    kind: "urgency",
    value: urgency
  }))), stats.length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 28,
      padding: "14px 16px",
      background: "var(--surface-sunken)",
      borderRadius: "var(--radius-md)",
      marginBottom: 14
    }
  }, stats.map((s, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: "flex",
      flexDirection: "column"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 22,
      fontWeight: 800,
      color: "var(--brand)",
      lineHeight: 1.1,
      letterSpacing: "-0.02em"
    }
  }, s.value), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      color: "var(--text-muted)",
      textTransform: "uppercase",
      letterSpacing: "0.04em",
      marginTop: 2
    }
  }, s.label)))), summary && /*#__PURE__*/React.createElement("p", {
    style: {
      margin: "0 0 14px",
      fontSize: 15,
      color: "var(--text-secondary)",
      lineHeight: 1.6
    }
  }, summary), quotes.length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      background: "var(--surface-sunken)",
      borderRadius: "var(--radius-md)",
      padding: "12px 14px",
      marginBottom: recommendation ? 14 : 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      fontWeight: 700,
      color: "var(--text-muted)",
      textTransform: "uppercase",
      letterSpacing: "0.04em",
      marginBottom: 8
    }
  }, "Lo que dicen tus clientes"), /*#__PURE__*/React.createElement("ul", {
    style: {
      listStyle: "none",
      margin: 0,
      padding: 0,
      display: "flex",
      flexDirection: "column",
      gap: 6
    }
  }, quotes.map((q, i) => /*#__PURE__*/React.createElement("li", {
    key: i,
    style: {
      fontSize: 14,
      color: "var(--text-secondary)",
      fontStyle: "italic",
      lineHeight: 1.5
    }
  }, "\u201C", q, "\u201D")))), recommendation && /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 10,
      alignItems: "flex-start",
      padding: "12px 14px",
      background: "var(--action-tint)",
      border: "1px solid var(--action-soft)",
      borderRadius: "var(--radius-md)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      fontWeight: 800,
      color: "var(--action-hover)",
      textTransform: "uppercase",
      letterSpacing: "0.05em",
      flexShrink: 0,
      marginTop: 2
    }
  }, "Acci\xF3n"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14,
      color: "var(--text-primary)",
      lineHeight: 1.5
    }
  }, recommendation)));
}
Object.assign(__ds_scope, { ReportCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/product/ReportCard.jsx", error: String((e && e.message) || e) }); }

// components/surfaces/Tabs.jsx
try { (() => {
/**
 * Tabs — underline tab bar. Active tab is brand-colored with a 2px
 * brand underline. Each tab: { id, label, icon?, count? }.
 */
function Tabs({
  tabs = [],
  value,
  onChange,
  style = {}
}) {
  const [hover, setHover] = React.useState(null);
  return /*#__PURE__*/React.createElement("div", {
    role: "tablist",
    style: {
      display: "flex",
      gap: 4,
      borderBottom: "2px solid var(--border)",
      ...style
    }
  }, tabs.map(tab => {
    const active = tab.id === value;
    const isHover = hover === tab.id;
    return /*#__PURE__*/React.createElement("button", {
      key: tab.id,
      role: "tab",
      "aria-selected": active,
      onClick: () => onChange && onChange(tab.id),
      onMouseEnter: () => setHover(tab.id),
      onMouseLeave: () => setHover(null),
      style: {
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
        borderTopRightRadius: "var(--radius-sm)"
      }
    }, tab.icon && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
      name: tab.icon,
      size: 16
    }), tab.label, tab.count != null && /*#__PURE__*/React.createElement(__ds_scope.Badge, {
      tone: active ? "brand" : "neutral",
      pill: true,
      style: {
        padding: "1px 8px",
        fontSize: 11
      }
    }, tab.count));
  }));
}
Object.assign(__ds_scope, { Tabs });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/surfaces/Tabs.jsx", error: String((e && e.message) || e) }); }

// ui_kits/admin/AppShell.jsx
try { (() => {
/* global React */
(() => {
  const {
    Icon,
    Avatar,
    Button,
    IconButton
  } = window.PoolyDesignSystem_3787fa;
  function Navbar({
    onNav,
    active
  }) {
    const {
      user
    } = window.PoolyData;
    const links = [{
      id: "dashboard",
      label: "Panel"
    }, {
      id: "responses",
      label: "Respuestas"
    }, {
      id: "insights",
      label: "Insights"
    }];
    return /*#__PURE__*/React.createElement("nav", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 24,
        padding: "0 28px",
        height: 64,
        background: "var(--surface)",
        borderBottom: "1px solid var(--border)",
        position: "sticky",
        top: 0,
        zIndex: 200
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 10
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: "var(--font-sans)",
        fontWeight: 800,
        fontSize: 22,
        letterSpacing: "-0.02em",
        color: "var(--text-primary)"
      }
    }, "Pool", /*#__PURE__*/React.createElement("span", {
      style: {
        color: "var(--brand)"
      }
    }, "y"))), /*#__PURE__*/React.createElement("ul", {
      style: {
        display: "flex",
        gap: 2,
        listStyle: "none",
        margin: 0,
        padding: 0,
        marginLeft: 8
      }
    }, links.map(l => {
      const on = active === l.id;
      return /*#__PURE__*/React.createElement("li", {
        key: l.id
      }, /*#__PURE__*/React.createElement("button", {
        onClick: () => onNav && onNav(l.id === "dashboard" ? "dashboard" : "dashboard"),
        style: {
          padding: "8px 14px",
          fontSize: 14.5,
          fontWeight: on ? 700 : 500,
          color: on ? "var(--text-primary)" : "var(--text-secondary)",
          background: on ? "var(--surface-alt)" : "transparent",
          border: "none",
          borderRadius: "var(--radius-md)",
          cursor: "pointer"
        }
      }, l.label));
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        marginLeft: "auto",
        display: "flex",
        alignItems: "center",
        gap: 12
      }
    }, /*#__PURE__*/React.createElement(Button, {
      variant: "action",
      size: "sm",
      leftIcon: "plus",
      onClick: () => onNav && onNav("create")
    }, "Nueva encuesta"), /*#__PURE__*/React.createElement(IconButton, {
      icon: "bell",
      variant: "ghost",
      label: "Notificaciones"
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 8,
        paddingLeft: 8,
        borderLeft: "1px solid var(--border)"
      }
    }, /*#__PURE__*/React.createElement(Avatar, {
      name: user.name,
      size: "sm"
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        lineHeight: 1.2
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 13,
        fontWeight: 700,
        color: "var(--text-primary)"
      }
    }, user.name), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11.5,
        color: "var(--text-muted)"
      }
    }, user.store)))));
  }
  function PageHeader({
    title,
    subtitle,
    actions,
    back
  }) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-end",
        gap: 16,
        flexWrap: "wrap",
        marginBottom: 24
      }
    }, /*#__PURE__*/React.createElement("div", null, back && /*#__PURE__*/React.createElement("button", {
      onClick: back.onClick,
      style: {
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        background: "none",
        border: "none",
        color: "var(--brand)",
        fontSize: 13.5,
        fontWeight: 600,
        cursor: "pointer",
        padding: 0,
        marginBottom: 10
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "arrow-left",
      size: 15
    }), " ", back.label), /*#__PURE__*/React.createElement("h1", {
      style: {
        margin: 0,
        fontSize: 26,
        fontWeight: 800,
        letterSpacing: "-0.02em",
        color: "var(--text-primary)"
      }
    }, title), subtitle && /*#__PURE__*/React.createElement("p", {
      style: {
        margin: "4px 0 0",
        color: "var(--text-secondary)",
        fontSize: 15
      }
    }, subtitle)), actions && /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 10
      }
    }, actions));
  }
  function AppCanvas({
    children,
    max = 1200
  }) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        minHeight: "100vh",
        background: "var(--surface-sunken)"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        maxWidth: max,
        margin: "0 auto",
        padding: "28px 28px 64px"
      }
    }, children));
  }
  Object.assign(window, {
    PoolyNavbar: Navbar,
    PoolyPageHeader: PageHeader,
    PoolyAppCanvas: AppCanvas
  });
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/admin/AppShell.jsx", error: String((e && e.message) || e) }); }

// ui_kits/admin/Dashboard.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* global React */
(() => {
  const {
    Icon,
    Button,
    StatCard,
    StatusBadge,
    Card
  } = window.PoolyDesignSystem_3787fa;
  function EventRow({
    ev,
    onOpen
  }) {
    const [hover, setHover] = React.useState(false);
    return /*#__PURE__*/React.createElement("div", {
      onMouseEnter: () => setHover(true),
      onMouseLeave: () => setHover(false),
      onClick: () => onOpen(ev),
      style: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 20,
        padding: "16px 20px",
        background: "var(--surface)",
        border: `1px solid ${hover ? "var(--brand)" : "var(--border)"}`,
        borderRadius: "var(--radius-lg)",
        boxShadow: hover ? "var(--shadow-sm)" : "none",
        cursor: "pointer",
        transition: "var(--transition-control)"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        minWidth: 0,
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 10,
        marginBottom: 4
      }
    }, /*#__PURE__*/React.createElement("h3", {
      style: {
        margin: 0,
        fontSize: 15.5,
        fontWeight: 700,
        color: "var(--text-primary)",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis"
      }
    }, ev.title), /*#__PURE__*/React.createElement(StatusBadge, {
      kind: "order",
      value: ev.status
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 18,
        fontSize: 13,
        color: "var(--text-secondary)"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: "inline-flex",
        alignItems: "center",
        gap: 5
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "git-branch",
      size: 14
    }), " ", ev.moment), /*#__PURE__*/React.createElement("span", {
      style: {
        display: "inline-flex",
        alignItems: "center",
        gap: 5
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "message-square",
      size: 14
    }), " ", ev.responses.toLocaleString(), " respuestas"), ev.days > 0 && /*#__PURE__*/React.createElement("span", {
      style: {
        display: "inline-flex",
        alignItems: "center",
        gap: 5
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "clock",
      size: 14
    }), " ", ev.days, " d\xEDas restantes"))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 8,
        flexShrink: 0
      }
    }, /*#__PURE__*/React.createElement(Button, {
      variant: "ghost",
      size: "sm",
      rightIcon: "arrow-right"
    }, "Ver insights")));
  }
  function Dashboard({
    onOpen,
    onCreate
  }) {
    const {
      stats,
      events,
      user
    } = window.PoolyData;
    return /*#__PURE__*/React.createElement(window.PoolyAppCanvas, null, /*#__PURE__*/React.createElement(window.PoolyPageHeader, {
      title: `Hola, ${user.name.split(" ")[0]}`,
      subtitle: "Esto es lo que tus clientes est\xE1n diciendo hoy.",
      actions: /*#__PURE__*/React.createElement(Button, {
        variant: "action",
        leftIcon: "plus",
        onClick: onCreate
      }, "Nueva encuesta")
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: 14,
        marginBottom: 28
      }
    }, stats.map((s, i) => /*#__PURE__*/React.createElement(StatCard, _extends({
      key: i
    }, s)))), /*#__PURE__*/React.createElement(Card, {
      style: {
        marginBottom: 28,
        padding: 0,
        overflow: "hidden",
        border: "1px solid var(--border)"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: "18px 22px",
        background: "linear-gradient(135deg, var(--blue-50) 0%, var(--surface) 70%)"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 44,
        height: 44,
        borderRadius: "var(--radius-md)",
        background: "var(--action-soft)",
        color: "var(--action-hover)",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "zap",
      size: 22
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        marginBottom: 2
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        font: "var(--font-eyebrow)",
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        color: "var(--action-hover)"
      }
    }, "Acci\xF3n sugerida")), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 15.5,
        fontWeight: 700,
        color: "var(--text-primary)"
      }
    }, "El tiempo de entrega es la queja #1 esta semana (31% de las menciones)."), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 13.5,
        color: "var(--text-secondary)"
      }
    }, "Revisa el SLA de tu paqueter\xEDa y comunica tiempos reales en el checkout.")), /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      size: "sm",
      rightIcon: "arrow-right",
      onClick: () => onOpen(events[0])
    }, "Ver tema"))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 14
      }
    }, /*#__PURE__*/React.createElement("h2", {
      style: {
        margin: 0,
        fontSize: 18,
        fontWeight: 700,
        color: "var(--text-primary)"
      }
    }, "Tus encuestas"), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 13,
        color: "var(--text-secondary)",
        background: "var(--surface-alt)",
        padding: "3px 12px",
        borderRadius: "var(--radius-pill)"
      }
    }, events.length, " encuestas")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 10
      }
    }, events.map(ev => /*#__PURE__*/React.createElement(EventRow, {
      key: ev.id,
      ev: ev,
      onOpen: onOpen
    }))));
  }
  window.PoolyDashboard = Dashboard;
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/admin/Dashboard.jsx", error: String((e && e.message) || e) }); }

// ui_kits/admin/EventDetails.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* global React */
(() => {
  const {
    Icon,
    Button,
    Card,
    Tabs,
    ShareLink,
    ReportCard,
    StatusBadge,
    Alert,
    Spinner
  } = window.PoolyDesignSystem_3787fa;
  function ResponsesTab() {
    const {
      responses
    } = window.PoolyData;
    return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        font: "var(--font-small)",
        color: "var(--text-muted)",
        marginBottom: 12
      }
    }, "Pregunta: ", /*#__PURE__*/React.createElement("strong", {
      style: {
        color: "var(--text-primary)"
      }
    }, "\xBFQu\xE9 te hizo dudar antes de comprar?")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 8
      }
    }, responses.map((r, i) => /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        padding: "12px 16px",
        background: "var(--surface-alt)",
        borderRadius: "var(--radius-md)",
        fontSize: 14.5,
        color: "var(--text-primary)",
        lineHeight: 1.5
      }
    }, r)), /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: "center",
        padding: "10px",
        fontSize: 13,
        color: "var(--text-muted)"
      }
    }, "+ 1,277 respuestas m\xE1s")));
  }
  function ReportTab({
    analyzed,
    analyzing,
    onAnalyze
  }) {
    const {
      report
    } = window.PoolyData;
    if (analyzing) {
      return /*#__PURE__*/React.createElement("div", {
        style: {
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "64px 24px",
          gap: 16
        }
      }, /*#__PURE__*/React.createElement(Spinner, {
        size: 40
      }), /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: 15,
          fontWeight: 700,
          color: "var(--text-primary)"
        }
      }, "Analizando 1,284 respuestas\u2026"), /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: 13.5,
          color: "var(--text-secondary)"
        }
      }, "Detectando temas, sentimiento y urgencia. Toma menos de un minuto."));
    }
    if (!analyzed) {
      return /*#__PURE__*/React.createElement("div", {
        style: {
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "56px 24px",
          textAlign: "center",
          background: "var(--surface-alt)",
          borderRadius: "var(--radius-lg)"
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          width: 72,
          height: 72,
          borderRadius: "var(--radius-round)",
          background: "var(--brand-soft)",
          color: "var(--brand)",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 16
        }
      }, /*#__PURE__*/React.createElement(Icon, {
        name: "sparkles",
        size: 32
      })), /*#__PURE__*/React.createElement("h4", {
        style: {
          margin: "0 0 6px",
          fontSize: 18,
          fontWeight: 700,
          color: "var(--text-primary)"
        }
      }, "Convierte las respuestas en decisiones"), /*#__PURE__*/React.createElement("p", {
        style: {
          margin: "0 0 20px",
          fontSize: 14.5,
          color: "var(--text-secondary)",
          maxWidth: 360,
          lineHeight: 1.6
        }
      }, "Pooly agrupa todo en temas con sentimiento, urgencia y una acci\xF3n recomendada. Sin leer cada respuesta."), /*#__PURE__*/React.createElement(Button, {
        variant: "action",
        leftIcon: "zap",
        onClick: onAnalyze
      }, "Analizar con IA"));
    }
    return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Alert, {
      variant: "success",
      title: "An\xE1lisis completado",
      style: {
        marginBottom: 16
      }
    }, "6 temas detectados en 1,284 respuestas \xB7 hace un momento"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
        gap: 16
      }
    }, report.map((r, i) => /*#__PURE__*/React.createElement(ReportCard, _extends({
      key: i
    }, r)))));
  }
  function StatusTab() {
    const {
      jobs
    } = window.PoolyData;
    return /*#__PURE__*/React.createElement(Card, {
      padding: 0,
      style: {
        overflow: "hidden"
      }
    }, /*#__PURE__*/React.createElement("table", {
      style: {
        width: "100%",
        borderCollapse: "collapse",
        fontSize: 14
      }
    }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, ["Job", "Estado", "Mensaje", "Fecha"].map(h => /*#__PURE__*/React.createElement("th", {
      key: h,
      style: {
        textAlign: "left",
        padding: "12px 18px",
        background: "var(--surface-alt)",
        fontSize: 11.5,
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.05em",
        color: "var(--text-muted)",
        borderBottom: "1px solid var(--border)"
      }
    }, h)))), /*#__PURE__*/React.createElement("tbody", null, jobs.map((j, i) => /*#__PURE__*/React.createElement("tr", {
      key: j.id,
      style: {
        borderBottom: i < jobs.length - 1 ? "1px solid var(--border)" : "none"
      }
    }, /*#__PURE__*/React.createElement("td", {
      style: {
        padding: "14px 18px",
        fontFamily: "var(--font-mono)",
        fontSize: 12.5,
        color: "var(--text-muted)"
      }
    }, j.id), /*#__PURE__*/React.createElement("td", {
      style: {
        padding: "14px 18px"
      }
    }, /*#__PURE__*/React.createElement(StatusBadge, {
      kind: "job",
      value: j.status
    })), /*#__PURE__*/React.createElement("td", {
      style: {
        padding: "14px 18px",
        color: "var(--text-secondary)"
      }
    }, j.message), /*#__PURE__*/React.createElement("td", {
      style: {
        padding: "14px 18px",
        color: "var(--text-muted)",
        whiteSpace: "nowrap"
      }
    }, j.date))))));
  }
  function EventDetails({
    ev,
    onBack,
    defaultAnalyzed
  }) {
    const [tab, setTab] = React.useState("report");
    const [analyzed, setAnalyzed] = React.useState(!!defaultAnalyzed);
    const [analyzing, setAnalyzing] = React.useState(false);
    const analyze = () => {
      setAnalyzing(true);
      setTimeout(() => {
        setAnalyzing(false);
        setAnalyzed(true);
      }, 1600);
    };
    return /*#__PURE__*/React.createElement(window.PoolyAppCanvas, null, /*#__PURE__*/React.createElement(window.PoolyPageHeader, {
      title: ev.title,
      back: {
        label: "Volver al panel",
        onClick: onBack
      },
      actions: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
        variant: "secondary",
        leftIcon: "external-link"
      }, "Vista previa"), tab === "report" && !analyzing && /*#__PURE__*/React.createElement(Button, {
        variant: "action",
        leftIcon: "zap",
        onClick: analyze
      }, analyzed ? "Re-analizar" : "Analizar con IA"))
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 10,
        marginBottom: 20
      }
    }, /*#__PURE__*/React.createElement(StatusBadge, {
      kind: "order",
      value: ev.status
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 13.5,
        color: "var(--text-secondary)",
        display: "inline-flex",
        alignItems: "center",
        gap: 5
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "message-square",
      size: 15
    }), " ", ev.responses.toLocaleString(), " respuestas"), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 13.5,
        color: "var(--text-secondary)",
        display: "inline-flex",
        alignItems: "center",
        gap: 5
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "git-branch",
      size: 15
    }), " ", ev.moment)), /*#__PURE__*/React.createElement(ShareLink, {
      url: `https://pooly.mx/r/${ev.id}`,
      style: {
        marginBottom: 24
      }
    }), /*#__PURE__*/React.createElement(Tabs, {
      value: tab,
      onChange: setTab,
      style: {
        marginBottom: 20
      },
      tabs: [{
        id: "responses",
        label: "Respuestas",
        icon: "message-square",
        count: ev.responses
      }, {
        id: "report",
        label: "Reporte IA",
        icon: "sparkles"
      }, {
        id: "status",
        label: "Estado",
        icon: "activity"
      }]
    }), tab === "responses" && /*#__PURE__*/React.createElement(ResponsesTab, null), tab === "report" && /*#__PURE__*/React.createElement(ReportTab, {
      analyzed: analyzed,
      analyzing: analyzing,
      onAnalyze: analyze
    }), tab === "status" && /*#__PURE__*/React.createElement(StatusTab, null));
  }
  window.PoolyEventDetails = EventDetails;
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/admin/EventDetails.jsx", error: String((e && e.message) || e) }); }

// ui_kits/admin/SurveyBuilder.jsx
try { (() => {
/* global React */
(() => {
  const {
    Icon,
    Button,
    Input,
    Textarea,
    FormField,
    Card
  } = window.PoolyDesignSystem_3787fa;
  function TemplatePick({
    tpl,
    active,
    onClick
  }) {
    return /*#__PURE__*/React.createElement("button", {
      onClick: onClick,
      style: {
        display: "flex",
        alignItems: "center",
        gap: 12,
        width: "100%",
        textAlign: "left",
        padding: "12px 14px",
        background: active ? "var(--brand-soft)" : "var(--surface)",
        border: `1.5px solid ${active ? "var(--brand)" : "var(--border)"}`,
        borderRadius: "var(--radius-md)",
        cursor: "pointer",
        transition: "var(--transition-control)"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 36,
        height: 36,
        flexShrink: 0,
        borderRadius: "var(--radius-sm)",
        background: active ? "var(--brand)" : "var(--surface-alt)",
        color: active ? "#fff" : "var(--text-secondary)",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center"
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: tpl.icon,
      size: 18
    })), /*#__PURE__*/React.createElement("span", {
      style: {
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: "block",
        fontSize: 14,
        fontWeight: 700,
        color: "var(--text-primary)"
      }
    }, tpl.title), /*#__PURE__*/React.createElement("span", {
      style: {
        display: "block",
        fontSize: 12.5,
        color: "var(--text-secondary)",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis"
      }
    }, tpl.desc)));
  }
  function TipsPanel() {
    const tips = [{
      icon: "help-circle",
      title: "Haz una sola pregunta abierta",
      desc: "Una pregunta clara da respuestas más honestas que diez de opción múltiple."
    }, {
      icon: "target",
      title: "Apunta al momento",
      desc: "Pregunta justo después de la compra, entrega o devolución."
    }, {
      icon: "smile",
      title: "Habla como tu marca",
      desc: "Cercano y breve. El comprador responde desde el móvil en segundos."
    }];
    return /*#__PURE__*/React.createElement(Card, {
      padding: 20,
      style: {
        position: "sticky",
        top: 92
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 10,
        paddingBottom: 14,
        marginBottom: 14,
        borderBottom: "1px solid var(--border)"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 34,
        height: 34,
        borderRadius: "var(--radius-md)",
        background: "var(--action-soft)",
        color: "var(--action-hover)",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center"
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "lightbulb",
      size: 18
    })), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 15,
        fontWeight: 700,
        color: "var(--text-primary)"
      }
    }, "Para mejores insights")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 14
      }
    }, tips.map((t, i) => /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        display: "flex",
        gap: 10,
        alignItems: "flex-start"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        color: "var(--brand)",
        flexShrink: 0,
        marginTop: 1
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: t.icon,
      size: 17
    })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 13.5,
        fontWeight: 700,
        color: "var(--text-primary)"
      }
    }, t.title), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12.5,
        color: "var(--text-secondary)",
        lineHeight: 1.5
      }
    }, t.desc))))));
  }
  function SurveyBuilder({
    onBack,
    onCreated
  }) {
    const {
      templates
    } = window.PoolyData;
    const [pick, setPick] = React.useState(0);
    const [q, setQ] = React.useState(templates[0].desc);
    return /*#__PURE__*/React.createElement(window.PoolyAppCanvas, {
      max: 1000
    }, /*#__PURE__*/React.createElement(window.PoolyPageHeader, {
      title: "Nueva encuesta",
      subtitle: "Elige un momento del journey y la pregunta que har\xE1s.",
      back: {
        label: "Volver al panel",
        onClick: onBack
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "1fr 340px",
        gap: 28,
        alignItems: "start"
      }
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Card, {
      padding: 24,
      style: {
        marginBottom: 20
      }
    }, /*#__PURE__*/React.createElement(FormField, {
      label: "Nombre de la encuesta",
      required: true,
      hint: "Solo t\xFA lo ves, para organizar tus encuestas."
    }, /*#__PURE__*/React.createElement(Input, {
      leftIcon: "tag",
      defaultValue: "Feedback post-compra \u2014 Marzo"
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        font: "var(--font-small)",
        fontWeight: 600,
        color: "var(--text-secondary)",
        marginBottom: 8
      }
    }, "Momento del journey"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 10,
        marginBottom: 20
      }
    }, templates.map((t, i) => /*#__PURE__*/React.createElement(TemplatePick, {
      key: i,
      tpl: t,
      active: pick === i,
      onClick: () => {
        setPick(i);
        setQ(t.desc);
      }
    }))), /*#__PURE__*/React.createElement(FormField, {
      label: "Tu pregunta",
      required: true,
      hint: "Una pregunta abierta \u2014 tus clientes responden con sus palabras."
    }, /*#__PURE__*/React.createElement(Textarea, {
      chat: true,
      value: q,
      onChange: e => setQ(e.target.value),
      rows: 2
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 16
      }
    }, /*#__PURE__*/React.createElement(FormField, {
      label: "Cierra el",
      htmlFor: "d"
    }, /*#__PURE__*/React.createElement(Input, {
      leftIcon: "calendar",
      type: "text",
      defaultValue: "31 / 03 / 2026"
    })), /*#__PURE__*/React.createElement(FormField, {
      label: "Idioma"
    }, /*#__PURE__*/React.createElement(Input, {
      leftIcon: "globe",
      defaultValue: "Espa\xF1ol (M\xE9xico)"
    })))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        justifyContent: "flex-end",
        gap: 10
      }
    }, /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      onClick: onBack
    }, "Cancelar"), /*#__PURE__*/React.createElement(Button, {
      variant: "action",
      leftIcon: "check",
      onClick: onCreated
    }, "Crear y compartir"))), /*#__PURE__*/React.createElement(TipsPanel, null)));
  }
  window.PoolySurveyBuilder = SurveyBuilder;
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/admin/SurveyBuilder.jsx", error: String((e && e.message) || e) }); }

// ui_kits/admin/data.js
try { (() => {
// Mock data for the Pooly admin UI kit. Attached to window for the
// Babel-scoped screen scripts to share.
window.PoolyData = {
  user: {
    name: "Ana Rivera",
    store: "Tienda Lumo"
  },
  stats: [{
    icon: "clipboard-list",
    tone: "brand",
    value: "12",
    label: "Encuestas",
    trend: "+3",
    trendDir: "up"
  }, {
    icon: "message-square",
    tone: "info",
    value: "8,420",
    label: "Respuestas",
    trend: "+18%",
    trendDir: "up"
  }, {
    icon: "activity",
    tone: "success",
    value: "4",
    label: "Activas"
  }, {
    icon: "timer",
    tone: "warning",
    value: "1.4k",
    label: "Prom. respuestas"
  }],
  events: [{
    id: "lumo-post-compra",
    title: "Feedback post-compra — Marzo",
    status: "active",
    responses: 1284,
    days: 6,
    moment: "Post-compra"
  }, {
    id: "devoluciones-q1",
    title: "¿Por qué nos devolviste?",
    status: "urgent",
    responses: 318,
    days: 1,
    moment: "Devoluciones"
  }, {
    id: "nps-suscripcion",
    title: "NPS cualitativo — Suscriptores",
    status: "closing",
    responses: 902,
    days: 2,
    moment: "NPS"
  }, {
    id: "soporte-cx",
    title: "Después de hablar con soporte",
    status: "active",
    responses: 547,
    days: 11,
    moment: "Soporte"
  }, {
    id: "lanzamiento-serum",
    title: "Validación: nuevo sérum",
    status: "ended",
    responses: 1640,
    days: 0,
    moment: "Producto"
  }, {
    id: "checkout-friccion",
    title: "¿Qué te hizo dudar al comprar?",
    status: "paused",
    responses: 211,
    days: 0,
    moment: "Checkout"
  }],
  // Journey-moment templates Pooly suggests (e-commerce, not civic)
  templates: [{
    icon: "shopping-bag",
    title: "Post-compra",
    desc: "¿Qué te hizo dudar antes de comprar?"
  }, {
    icon: "package",
    title: "Post-entrega / NPS",
    desc: "¿Cómo fue recibir tu pedido?"
  }, {
    icon: "rotate-ccw",
    title: "Devoluciones",
    desc: "¿Por qué decidiste devolverlo?"
  }, {
    icon: "headphones",
    title: "Soporte",
    desc: "¿Resolvimos lo que necesitabas?"
  }, {
    icon: "sparkles",
    title: "Validación de producto",
    desc: "¿Qué opinas de este lanzamiento?"
  }],
  responses: ["Tardó 9 días en llegar, pensé que no llegaba.", "El producto está increíble, pero el envío fue lentísimo.", "Me encantó el empaque, se siente premium.", "Dudé por el costo de envío, casi no compro.", "Súper fácil el checkout, lo recomendaría.", "Llegó un día antes, excelente.", "Esperaba más tamaño por el precio."],
  report: [{
    category: "Tiempo de entrega",
    sentiment: "negative",
    urgency: "high",
    mentions: 142,
    percent: 31,
    responses: 1284,
    summary: "Valoran el producto, pero la demora en el envío es el motivo #1 de frustración post-compra. Varios temieron que el pedido no llegara.",
    quotes: ["Tardó 9 días en llegar", "Buen producto, pero el envío fue lentísimo"],
    recommendation: "Revisa el SLA de tu paquetería y muestra tiempos reales de entrega en el checkout."
  }, {
    category: "Empaque y unboxing",
    sentiment: "positive",
    urgency: "low",
    mentions: 88,
    percent: 19,
    responses: 1284,
    summary: "El empaque genera una percepción premium y aparece como un punto de deleite que los clientes mencionan de forma espontánea.",
    quotes: ["Me encantó el empaque", "Se siente premium al abrirlo"],
    recommendation: "Aprovecha el unboxing: incluye un inserto que invite a compartir en redes."
  }, {
    category: "Costo de envío",
    sentiment: "negative",
    urgency: "medium",
    mentions: 64,
    percent: 14,
    responses: 1284,
    summary: "El costo de envío es la principal fricción antes de comprar; algunos estuvieron a punto de abandonar el carrito.",
    quotes: ["Dudé por el costo de envío", "Casi no compro por el shipping"],
    recommendation: "Prueba envío gratis sobre cierto monto y mídelo contra la tasa de conversión."
  }],
  jobs: [{
    id: "job_8f2a",
    status: "completed",
    message: "Análisis completado — 6 temas detectados",
    date: "Hoy, 10:42"
  }, {
    id: "job_8f29",
    status: "running",
    message: "Procesando 1,284 respuestas…",
    date: "Hoy, 10:41"
  }, {
    id: "job_8e7c",
    status: "error",
    message: "Sin respuestas suficientes para analizar",
    date: "Ayer, 18:03"
  }]
};
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/admin/data.js", error: String((e && e.message) || e) }); }

__ds_ns.Button = __ds_scope.Button;

__ds_ns.IconButton = __ds_scope.IconButton;

__ds_ns.Avatar = __ds_scope.Avatar;

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.ProgressBar = __ds_scope.ProgressBar;

__ds_ns.StatCard = __ds_scope.StatCard;

__ds_ns.StatusBadge = __ds_scope.StatusBadge;

__ds_ns.Alert = __ds_scope.Alert;

__ds_ns.Modal = __ds_scope.Modal;

__ds_ns.Spinner = __ds_scope.Spinner;

__ds_ns.ChatOption = __ds_scope.ChatOption;

__ds_ns.FormField = __ds_scope.FormField;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.Textarea = __ds_scope.Textarea;

__ds_ns.Icon = __ds_scope.Icon;

__ds_ns.ReportCard = __ds_scope.ReportCard;

__ds_ns.ShareLink = __ds_scope.ShareLink;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.Tabs = __ds_scope.Tabs;

})();
