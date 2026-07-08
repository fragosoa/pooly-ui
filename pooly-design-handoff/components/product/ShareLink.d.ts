import * as React from "react";

export interface ShareLinkProps {
  /** The shareable survey URL. */
  url?: string;
  /** Heading. */
  title?: string;
  /** Subtext under the heading. */
  subtitle?: string;
  style?: React.CSSProperties;
}
export function ShareLink(props: ShareLinkProps): JSX.Element;
