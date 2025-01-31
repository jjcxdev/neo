import { Textarea } from "@/components/ui/textarea";
import React from "react";
import MemoizedModelSelector from "./ModelSelector";
import { ChatInputProps } from "../types/types";

export function ChatInput({
  inputMessage,
  onInputChange,
  onSendMessage,
  onFocus,
  selectedModel,
}: ChatInputProps) {
  function onModelSelect(model: string): void {
    throw new Error("Function not implemented.");
  }

  return (
    <div className="sticky bottom-0 mt-4">
      <div className="flex w-full justify-center">
        <div className="mx-auto flex w-full max-w-4xl flex-col items-start gap-2 rounded-t-3xl bg-accent">
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
            className="flex-1 resize-none border-0 p-4"
          />
          <MemoizedModelSelector onModelSelect={onModelSelect} currentModel={selectedModel} />
        </div>
      </div>
    </div>
  );
}
