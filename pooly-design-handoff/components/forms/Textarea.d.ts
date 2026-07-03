import * as React from "react";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Error styling. */
  error?: boolean;
  /** Public-survey chat style: thicker 2px border, larger radius/text. */
  chat?: boolean;
}
export function Textarea(props: TextareaProps): JSX.Element;
