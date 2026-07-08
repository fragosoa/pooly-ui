import * as React from "react";

export interface ModalProps {
  /** Visible when true. Default true. */
  open?: boolean;
  /** Header title. */
  title?: React.ReactNode;
  /** Close handler (overlay click, X button). */
  onClose?: () => void;
  /** Body content. */
  children?: React.ReactNode;
  /** Footer node (usually Buttons). */
  footer?: React.ReactNode;
  /** Max width px. Default 480. */
  width?: number;
  /** Tints the optional header icon bubble. */
  tone?: "danger" | "brand" | "success";
  /** Lucide icon for the header bubble (needs `tone`). */
  icon?: string;
}
export function Modal(props: ModalProps): JSX.Element;
