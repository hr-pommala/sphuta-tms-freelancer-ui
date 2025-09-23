import React from "react";

/**
 * Minimal Button with simple variants used by the page.
 * Supports 'variant' = default | outline | ghost and size = sm | md
 */
export function Button({ children, variant = "default", size = "md", className = "", ...rest }) {
  const base = "inline-flex items-center justify-center gap-2 rounded-md font-medium focus:outline-none";
  const variants = {
    default: "bg-primary text-white px-3 py-1",
    outline: "border border-gray-300 px-3 py-1 bg-white",
    ghost: "bg-transparent px-2 py-1",
  };
  const sizes = { sm: "text-sm h-8", md: "text-sm h-10" };
  const cls = [base, variants[variant] || variants.default, sizes[size] || sizes.md, className].filter(Boolean).join(" ");
  return <button className={cls} {...rest}>{children}</button>;
}

export default Button;
