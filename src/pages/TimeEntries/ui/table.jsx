import React from "react";

/* Simple table primitives used by TimeEntryPage */

export function Table({ children, className = "" }) {
  return <table className={["w-full border-collapse", className].filter(Boolean).join(" ")}>{children}</table>;
}

export function TableHeader({ children, className = "" }) {
  return <thead className={className}>{children}</thead>;
}

export function TableBody({ children, className = "" }) {
  return <tbody className={className}>{children}</tbody>;
}

export function TableRow({ children, className = "" }) {
  return <tr className={className}>{children}</tr>;
}

export function TableHead({ children, className = "" }) {
  const cls = ["px-3 py-2 text-left text-sm font-semibold", className].filter(Boolean).join(" ");
  return <th className={cls}>{children}</th>;
}

export function TableCell({ children, className = "" }) {
  const cls = ["px-3 py-2 align-top text-sm", className].filter(Boolean).join(" ");
  return <td className={cls}>{children}</td>;
}
