import * as React from "react";

export interface SpinnerProps {
  /** Diameter px. Default 24. */
  size?: number;
  /** Ring color. Default "brand". */
  tone?: "brand" | "action" | "muted";
  style?: React.CSSProperties;
}
export function Spinner(props: SpinnerProps): JSX.Element;
