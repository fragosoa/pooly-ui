import * as React from "react";

export type BadgeTone =
  | "brand" | "action" | "success" | "danger"
  | "warning" | "info" | "special" | "neutral";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Color/meaning. Default "neutral". */
  tone?: BadgeTone;
  /** Optional leading Lucide icon. */
  icon?: string;
  /** Show a leading status dot. */
  dot?: boolean;
  /** Fully rounded pill (default true) vs. soft 6px corner. */
  pill?: boolean;
  /** Uppercase micro-label styling. */
  uppercase?: boolean;
}

export function Badge(props: BadgeProps): JSX.Element;
