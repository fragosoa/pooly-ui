import * as React from "react";

/**
 * @startingPoint section="Surfaces" subtitle="Base white card, 12px radius, hover lift" viewport="700x150"
 */
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Brand-border + lift on hover (event/feature/report cards). */
  interactive?: boolean;
  /** Start at the medium shadow level. */
  elevated?: boolean;
  /** Padding in px. Default 24. */
  padding?: number;
}
export function Card(props: CardProps): JSX.Element;
