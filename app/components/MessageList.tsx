import { Message } from "../types/types";
import React, { useRef } from "react";
import { MessageListProps } from "../types/types";
import { MemoizedMessage } from "./Message";

export const MessageList = React.memo(function MessageList({
  messages,
  onScrollRef,
}: MessageListProps) {
  return (
    <div>
      {messages.map((message, index) => (
        <div
          key={index}
          className={`mb-4 flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
        >
          <MemoizedMessage message={message} />
        </div>
      ))}
      <div ref={onScrollRef} />
    </div>
  );
});
