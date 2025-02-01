import React from "react";
import { MessageListProps } from "../types/types";
import { MessageContent } from "./MessageContent";

export const MessageList = React.memo(function MessageList({
  messages,
  onScrollRef,
}: MessageListProps) {
  return (
    <div className="w-full max-w-3xl">
      {messages.map((message, index) => (
        // Container for each message

        <div
          key={index}
          className={`flex ${message.sender === "user" ? "mb-4 justify-start" : "justify-start px-2"}`}
        >
          {/* Message  */}

          <div
            className={`mt-4${
              message.sender === "user" ? "w-fit rounded-xl bg-border px-4 py-2" : "text-sm"
            } text-foreground`}
          >
            <MessageContent message={message} />
          </div>
        </div>
      ))}
      <div ref={onScrollRef} />
    </div>
  );
});
