import * as React from "react";

export type ButtonVariant = "primary" | "action" | "secondary" | "ghost" | "danger" | "ink";
export type ButtonSize = "sm" | "md" | "lg";

/**
 * @startingPoint section="Buttons" subtitle="Primary, action, secondary, ghost, danger" viewport="700x150"
 */
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style. `primary` = brand blue, `action` = deep action-blue (conversion only). Default "primary". */
  variant?: ButtonVariant;
  /** Default "md". */
  size?: ButtonSize;
  /** Lucide icon name shown before the label. */
  leftIcon?: string;
  /** Lucide icon name shown after the label. */
  rightIcon?: string;
  /** Show a spinner and disable. */
  loading?: boolean;
  /** Stretch to container width. */
  fullWidth?: boolean;
  /** Render as an anchor instead of a button. */
  as?: "button" | "a";
  /** href when `as="a"`. */
  href?: string;
}

export function Button(props: ButtonProps): JSX.Element;
