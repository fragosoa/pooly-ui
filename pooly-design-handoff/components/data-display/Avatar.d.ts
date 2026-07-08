import * as React from "react";

export interface AvatarProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Person/brand name — drives initials and the auto color. */
  name?: string;
  /** Optional image URL; overrides initials. */
  src?: string;
  /** Preset size token or a pixel number. Default "md" (40px). */
  size?: "xs" | "sm" | "md" | "lg" | number;
  /** "round" (people/chat) or "rounded" (squared author style). */
  shape?: "round" | "rounded";
  /** Force a background color (else derived from name). */
  color?: string;
}

export function Avatar(props: AvatarProps): JSX.Element;
