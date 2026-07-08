import * as React from "react";

export type StatusKind = "sentiment" | "urgency" | "order" | "job" | "source";

export interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Which status vocabulary to use. */
  kind: StatusKind;
  /**
   * Value within the vocabulary:
   * sentiment: positive|neutral|negative ·
   * urgency: high|medium|low ·
   * order: active|closing|urgent|ended|paused ·
   * job: completed|running|error ·
   * source: online|imported
   */
  value: string;
  /** Override the default Spanish label. */
  label?: string;
}

/** Semantic status badge — maps product meaning to the right tone/icon/label. */
export function StatusBadge(props: StatusBadgeProps): JSX.Element;
