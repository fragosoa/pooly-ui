import * as React from "react";

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Lucide icon name. */
  icon: string;
  /** Default "md". */
  size?: "sm" | "md" | "lg";
  /** Default "ghost". */
  variant?: "ghost" | "outline" | "brand" | "action";
  /** Fully round (FAB / avatar action). */
  round?: boolean;
  /** Accessible label (also the tooltip). */
  label?: string;
}

export function IconButton(props: IconButtonProps): JSX.Element;
