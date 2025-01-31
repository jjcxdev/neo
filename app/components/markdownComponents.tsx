import { Components } from "react-markdown";
import SyntaxHighlighter, { SyntaxHighlighterProps } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

export const markdownComponents: Components = {
  code({ className, children, ...props }) {
    const match = /language-(\w+)/.exec(className || "");
    const isInline = !className;

    if (isInline) {
      return <code className="rounded bg-muted px-1.5 py-0.5 text-sm">{children}</code>;
    }

    return (
      <div className="not-prose my-4">
        <SyntaxHighlighter
          language={match?.[1] || ""}
          style={oneDark}
          PreTag="div"
          className="rounded-lg"
          {...(props as SyntaxHighlighterProps)}
        >
          {String(children).replace(/\n$/, "")}
        </SyntaxHighlighter>
      </div>
    );
  },
  p: ({ children }) => <div className="mb-4 last:mb-0">{children}</div>,
  pre: ({ children }) => <div className="not-prose">{children}</div>,
  ul: ({ children }) => <ul className="mb-4 ml-4 list-disc space-y-2">{children}</ul>,
  ol: ({ children }) => <ol className="mb-4 ml-4 list-decimal space-y-2">{children}</ol>,
  h1: ({ children }) => <h1 className="mb-4 mt-6 text-2xl font-bold">{children}</h1>,
  h2: ({ children }) => <h2 className="mb-3 mt-5 text-xl font-bold">{children}</h2>,
  h3: ({ children }) => <h3 className="mb-2 mt-4 text-lg font-bold">{children}</h3>,
};
