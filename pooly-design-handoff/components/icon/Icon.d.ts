import * as React from "react";

export interface IconProps extends React.HTMLAttributes<HTMLElement> {
  /** Lucide icon name, e.g. "shopping-cart", "package", "star", "zap". */
  name: string;
  /** Pixel size (square). Default 20. */
  size?: number;
  /** Stroke width. Default 2. */
  strokeWidth?: number;
  /** Override color; defaults to currentColor. */
  color?: string;
}

/**
 * Lucide line icon, the Pooly iconography standard. Requires the Lucide
 * UMD script on the page.
 */
export function Icon(props: IconProps): JSX.Element;
