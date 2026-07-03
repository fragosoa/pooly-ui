import * as React from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Leading Lucide icon name. */
  leftIcon?: string;
  /** Error styling (red border + ring). */
  error?: boolean;
  /** Default "md". */
  size?: "md" | "lg";
}
export function Input(props: InputProps): JSX.Element;
