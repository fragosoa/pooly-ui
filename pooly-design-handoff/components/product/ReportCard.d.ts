import * as React from "react";

/**
 * @startingPoint section="Product" subtitle="AI-discovered theme: sentiment, urgency, quotes, action" viewport="700x420"
 */
export interface ReportCardProps {
  /** Theme name, e.g. "Tiempo de entrega". */
  category: string;
  /** positive | neutral | negative. */
  sentiment?: "positive" | "neutral" | "negative";
  /** high | medium | low. */
  urgency?: "high" | "medium" | "low";
  /** Number of mentions. */
  mentions?: number;
  /** Percent of total responses. */
  percent?: number;
  /** Total responses analyzed. */
  responses?: number;
  /** AI summary paragraph. */
  summary?: string;
  /** Example verbatim quotes. */
  quotes?: string[];
  /** Recommended action (shown in an action-blue strip). */
  recommendation?: string;
  style?: React.CSSProperties;
}
export function ReportCard(props: ReportCardProps): JSX.Element;
