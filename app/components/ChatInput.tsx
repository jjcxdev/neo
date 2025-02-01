import { Textarea } from "@/components/ui/textarea";
import React from "react";
import MemoizedModelSelector from "./ModelSelector";
import { ChatInputProps } from "../types/types";

export function ChatInput({
  inputMessage,
  onInputChange,
  onSendMessage,
  onModelSelect,
  onFocus,
  selectedModel,
}: ChatInputProps) {
  return (
    <div className="sticky bottom-0 mt-4 w-full">
      <div className="flex w-full justify-center">
        <div className="mx-auto flex w-full max-w-4xl flex-col items-start rounded-t-3xl bg-accent">
          <Textarea
            placeholder="Type your message..."
            value={inputMessage}
            onChange={onInputChange}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onSendMessage();
                e.currentTarget.focus();
              }
            }}
            autoFocus
            onFocus={onFocus}
            className="m-4 mx-auto mb-0 max-w-[96%] flex-1 resize-none border-0"
          />
          <div className="m-4">
            <MemoizedModelSelector onModelSelect={onModelSelect} currentModel={selectedModel} />
          </div>
        </div>
      </div>
    </div>
  );
}
