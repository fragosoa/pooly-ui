import * as React from "react";

export interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Current value. */
  value?: number;
  /** Max value. Default 100. */
  max?: number;
  /** Fill color. Default "brand". */
  tone?: "brand" | "action" | "success" | "warning" | "danger";
  /** Track height px. Default 8. */
  height?: number;
  /** Show a trailing percentage label. */
  showLabel?: boolean;
}

export function ProgressBar(props: ProgressBarProps): JSX.Element;
