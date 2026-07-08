import * as React from "react";

export interface TabItem {
  id: string;
  label: React.ReactNode;
  /** Optional leading Lucide icon. */
  icon?: string;
  /** Optional count badge. */
  count?: number;
}

export interface TabsProps {
  tabs: TabItem[];
  /** Active tab id. */
  value: string;
  /** Change handler. */
  onChange?: (id: string) => void;
  style?: React.CSSProperties;
}
export function Tabs(props: TabsProps): JSX.Element;
