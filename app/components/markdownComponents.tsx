import { Components } from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { poimandresTheme } from "./poimandresTheme";
import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export const markdownComponents: Components = {
  code({ className, children, ...props }) {
    const match = /language-(\w+)/.exec(className || "");
    const isInline = !className;
    const [isCopied, setIsCopied] = useState(false);

    if (isInline) {
      return <code className="rounded bg-muted px-1.5 py-0.5 text-sm">{children}</code>;
    }

    const handleCopy = () => {
      const code = String(children).replace(/\n$/, "");
      navigator.clipboard
        .writeText(code)
        .then(() => {
          setIsCopied(true);
          setTimeout(() => setIsCopied(false), 100);
        })
        .catch((err) => {
          console.error("Failed to copy:", err);
        });
    };

    return (
      <div className={`not-prose my-4`}>
        {match?.[1] && (
          <div className="flex items-center justify-between rounded-t-2xl bg-neutral-950 px-4 py-2 text-sm text-foreground">
            {match[1]}
            <Button
              onClick={handleCopy}
              variant="ghost"
              className="hover:bg-transparent"
              size="icon"
            >
              <Copy size={16} className={isCopied ? "text-accent" : "text-foreground"} />
            </Button>
          </div>
        )}
        <SyntaxHighlighter
          language={match?.[1] || ""}
          style={poimandresTheme}
          PreTag="div"
          className="rounded-b-2xl"
          customStyle={{
            margin: 0,
            padding: "1rem",
          }}
        >
          {String(children).replace(/\n$/, "")}
        </SyntaxHighlighter>
      </div>
    );
  },
  p: ({ children }) => <div className="mb-4">{children}</div>,
  pre: ({ children }) => <div className="not-prose">{children}</div>,
  ul: ({ children }) => <ul className="mb-4 ml-4 list-disc space-y-2">{children}</ul>,
  ol: ({ children }) => <ol className="mb-4 ml-4 list-decimal space-y-2">{children}</ol>,
  h1: ({ children }) => <h1 className="mb-4 mt-6 text-2xl font-bold">{children}</h1>,
  h2: ({ children }) => <h2 className="mb-3 mt-5 text-xl font-bold">{children}</h2>,
  h3: ({ children }) => <h3 className="mb-2 mt-4 text-lg font-bold">{children}</h3>,
};
