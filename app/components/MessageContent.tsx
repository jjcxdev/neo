import React, { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { MessageProps } from "../types/types";
import { markdownComponents } from "./markdownComponents";

export function MessageContent({ message }: MessageProps) {
  const content = useMemo(() => {
    if (message.sender === "ai") {
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
