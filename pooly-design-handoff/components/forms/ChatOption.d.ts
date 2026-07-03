import * as React from "react";

export interface ChatOptionProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Selected state (brand tint + filled marker). */
  selected?: boolean;
  /** Checkbox marker instead of radio dot. */
  multi?: boolean;
  /** Click/select handler. */
  onSelect?: () => void;
}
export function ChatOption(props: ChatOptionProps): JSX.Element;
