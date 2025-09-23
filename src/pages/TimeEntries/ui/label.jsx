import React from "react";

export function Label({ children, htmlFor, className = "" }) {
  return <label htmlFor={htmlFor} className={["text-sm font-medium", className].filter(Boolean).join(" ")}>{children}</label>;
}

export default Label;
