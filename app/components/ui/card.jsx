"use client";

import { cn } from "@/lib/utils";

export function Card({ className, children, ...props }) {
  return (
    <div
      className={cn(
        "rounded-xl bg-white text-gray-900 shadow-md border border-gray-200 overflow-hidden",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardContent({ className, children, ...props }) {
  return (
    <div className={cn("p-4", className)} {...props}>
      {children}
    </div>
  );
}
