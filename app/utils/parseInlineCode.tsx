import type React from "react";

export function parseInlineCode(text: string): React.ReactNode[] {
  const parts = text.split(/(`[^`]+`)/).filter(Boolean);
  return parts.map((part, index) => {
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code key={index} className="rounded bg-gray-100 p-1 font-mono text-sm">
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}
