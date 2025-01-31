import React from "react";
import { MessageProps } from "../types/types";
import { MessageContent } from "./MessageContent";

export const MemoizedMessage = React.memo(
  ({ message }: MessageProps) => (
    <div
      className={`mt-4 w-fit max-w-[85%] rounded-lg p-3 ${
        message.sender === "user" ? "text-xs text-foreground" : "bg-background text-foreground"
      }`}
    >
      <MessageContent message={message} />
    </div>
  ),
  (prev, next) =>
    prev.message.content === next.message.content && prev.message.sender === next.message.sender,
);
