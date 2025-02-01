import React, { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { MessageProps } from "../types/types";
import { markdownComponents } from "./markdownComponents";

export function MessageContent({ message }: MessageProps) {
  const content = useMemo(() => {
    if (message.sender === "ai") {
      // Check if we're currently inside a think block
      const isStartingThink =
        message.content.includes("<think>") && !message.content.includes("</think>");
      const isCompleteThink = message.content.match(/<think>[\s\S]*?<\/think>/);

      if (isStartingThink || isCompleteThink) {
        // Split content to handle both complete and incomplete think blocks
        const parts = message.content
          .replace(/▋/g, "")
          .split(/(<think>[\s\S]*?<\/think>|<think>[\s\S]*$)/);

        return (
          <div>
            {parts.map((part, index) => {
              if (part.startsWith("<think>")) {
                const thoughtContent = part.replace(/<think>|<\/think>/g, "");
                return (
                  <div
                    key={index}
                    className="my-4 border-l-2 border-border p-4 text-xs italic text-muted"
                  >
                    <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                      {thoughtContent}
                    </ReactMarkdown>
                  </div>
                );
              }
              return (
                <ReactMarkdown
                  key={index}
                  remarkPlugins={[remarkGfm]}
                  components={markdownComponents}
                >
                  {part}
                </ReactMarkdown>
              );
            })}
          </div>
        );
      }

      return (
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
          {message.content.replace(/▋/g, "")}
        </ReactMarkdown>
      );
    }
    return <div className="whitespace-pre-wrap">{message.content}</div>;
  }, [message.content, message.sender]);

  return content;
}
