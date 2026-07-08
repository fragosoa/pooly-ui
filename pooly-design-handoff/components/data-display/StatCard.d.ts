import * as React from "react";

/**
 * @startingPoint section="Data" subtitle="Dashboard KPI tile with icon bubble + trend" viewport="700x150"
 */
export interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Lucide icon name for the tinted bubble. */
  icon?: string;
  /** Bubble color. Default "brand". */
  tone?: "brand" | "success" | "info" | "warning" | "action";
  /** Big number / value. */
  value?: React.ReactNode;
  /** Caption under the value. */
  label?: React.ReactNode;
  /** Optional trend text, e.g. "+12%". */
  trend?: string;
  /** Trend direction (sets color + arrow). Default "up". */
  trendDir?: "up" | "down";
}

export function StatCard(props: StatCardProps): JSX.Element;
