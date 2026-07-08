import * as React from "react";

export interface FormFieldProps {
  /** Field label. */
  label?: React.ReactNode;
  /** Helper text shown when there is no error. */
  hint?: React.ReactNode;
  /** Error message (replaces hint, turns red). */
  error?: React.ReactNode;
  /** Show a required asterisk. */
  required?: boolean;
  /** Matches the control id. */
  htmlFor?: string;
  /** The control (Input / Textarea / Select). */
  children?: React.ReactNode;
  style?: React.CSSProperties;
}
export function FormField(props: FormFieldProps): JSX.Element;
