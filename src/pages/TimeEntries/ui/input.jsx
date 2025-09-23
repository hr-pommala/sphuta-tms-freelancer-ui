import React from "react";

/**
 * Minimal Input component used by TimeEntryPage.
 * Passes all props through and merges a small default className.
 */
export function Input(props) {
  const { className = "", ...rest } = props;
  const cls = ["border rounded px-2 py-1 text-sm", className].filter(Boolean).join(" ");
  return <input {...rest} className={cls} />;
}

export default Input;
