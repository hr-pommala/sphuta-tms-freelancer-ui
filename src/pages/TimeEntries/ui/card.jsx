import React from "react";

/* Minimal Card primitives */

export function Card({ children, className = "" }) {
  return <div className={["bg-white shadow-sm rounded", className].filter(Boolean).join(" ")}>{children}</div>;
}

export function CardHeader({ children, className = "" }) {
  return <div className={["p-4 border-b", className].filter(Boolean).join(" ")}>{children}</div>;
}

export function CardTitle({ children, className = "" }) {
  return <h3 className={["text-lg font-semibold", className].filter(Boolean).join(" ")}>{children}</h3>;
}

export function CardContent({ children, className = "" }) {
  return <div className={["p-4", className].filter(Boolean).join(" ")}>{children}</div>;
}

export default Card;
