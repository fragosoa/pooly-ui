import * as React from "react";

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Default "info". */
  variant?: "success" | "error" | "warning" | "info";
  /** Bold leading title. */
  title?: React.ReactNode;
  /** Dismiss handler — shows a close button. */
  onClose?: () => void;
}
export function Alert(props: AlertProps): JSX.Element;
