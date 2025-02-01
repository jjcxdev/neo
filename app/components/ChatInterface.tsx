"use client";

import { useCallback, useState, useEffect, useRef, useMemo } from "react";
import type { Message, Conversation } from "../types/types";
import { nanoid } from "nanoid";
import React from "react";
import _, { set } from "lodash";
import {
  MAX_VISIBLE_MESSAGES,
  MAX_CONVERSATIONS,
  CLEANUP_THRESHOLD,
  API_TIMEOUT,
  UPDATE_THRESHOLD,
} from "../types/types";
import { Sidebar } from "./Sidebar";
import { MessageList } from "./MessageList";
import { ChatInput } from "./ChatInput";

export default function ChatInterface() {
  // State Management
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState("llama3.2:latest");

  // Refs for Memory Management
  const messageCache = useRef<Map<string, Message[]>>(new Map());
  const cleanupTimeout = useRef<NodeJS.Timeout | null>(null);
  const abortController = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const createNewConversation = useCallback(() => {
    if (conversations.length >= MAX_CONVERSATIONS) {
      const toRemove = conversations.slice(0, -MAX_CONVERSATIONS + 1);
      toRemove.forEach((conv) => {
        messageCache.current.delete(conv.id);
        localStorage.removeItem(`chat_archive_${conv.id}`);
      });
    }

    const newConversation: Conversation = {
      id: nanoid(),
      title: `New Chat`,
      messages: [],
    };

    setConversations((prev) => [...prev.slice(-MAX_CONVERSATIONS + 1), newConversation]);
    setCurrentConversationId(newConversation.id);
  }, [conversations.length]);

  const handleModelChange = useCallback(
    (model: string) => {
      setSelectedModel(model);
      const currentChat = conversations.find((conv) => conv.id === currentConversationId);
      if (!currentChat || currentChat.messages.length > 0) {
        createNewConversation();
      }
    },
    [createNewConversation, conversations, currentConversationId],
  );

  // Memoized Values
  const currentConversation = useMemo(
    () => conversations.find((conv) => conv.id === currentConversationId),
    [conversations, currentConversationId],
  );

  const cleanupOldMessages = useCallback(() => {
    setConversations((prev) =>
      prev.map((conv) => ({
        ...conv,
        messages: conv.messages.slice(-MAX_VISIBLE_MESSAGES),
      })),
    );

    const currentMessages = currentConversation?.messages || [];
    if (currentMessages.length > MAX_VISIBLE_MESSAGES) {
      const toArchive = currentMessages.slice(0, -MAX_VISIBLE_MESSAGES);
      archiveMessages(currentConversationId!, toArchive);
    }
  }, [currentConversation, currentConversationId]);

  const archiveMessages = async (conversationId: string, messages: Message[]) => {
    try {
      const key = `chat_archive_${conversationId}`;
      const existing = JSON.parse(localStorage.getItem(key) || "[]");
      localStorage.setItem(key, JSON.stringify([...existing, ...messages]));
    } catch (error) {
      console.error("Failed to archive messages:", error);
    }
  };

  const loadMessagesFromStorage = async (
    conversationId: string,
    start: number,
    count: number,
  ): Promise<Message[]> => {
    try {
      const key = `chat_archive_${conversationId}`;
      const archived = JSON.parse(localStorage.getItem(key) || "[]");
      return archived.slice(start, start + count);
    } catch (error) {
      console.error("Failed to load archived messages:", error);
      return [];
    }
  };

  const addMessage = useCallback(
    (message: Message) => {
      setConversations((prev) => {
        const updated = prev.map((conv) =>
          conv.id === currentConversationId
            ? {
                ...conv,
                messages: [...conv.messages, message],
              }
            : conv,
        );

        if (
          currentConversationId &&
          updated.find((c) => c.id === currentConversationId)?.messages.length! > CLEANUP_THRESHOLD
        ) {
          if (cleanupTimeout.current) {
            clearTimeout(cleanupTimeout.current);
          }
          cleanupTimeout.current = setTimeout(cleanupOldMessages, 1000);
        }

        return updated;
      });
    },
    [currentConversationId, cleanupOldMessages],
  );

  const updateLastMessage = useCallback(
    (content: string) => {
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === currentConversationId
            ? {
                ...conv,
                messages: conv.messages.map((msg, idx) =>
                  idx === conv.messages.length - 1 && msg.sender === "ai"
                    ? { ...msg, content }
                    : msg,
                ),
              }
            : conv,
        ),
      );
    },
    [currentConversationId],
  );

  // Debounced update function
  const debouncedUpdate = useMemo(
    () => _.debounce((content: string) => updateLastMessage(content), UPDATE_THRESHOLD),
    [updateLastMessage],
  );

  const handleSendMessage = useCallback(async () => {
    if (inputMessage.trim() === "" || currentConversationId === null || isLoading) return;

    setIsLoading(true);
    const userMessage: Message = {
      id: nanoid(),
      content: inputMessage,
      sender: "user",
    };
    addMessage(userMessage);
    const messageToSend = inputMessage;
    setInputMessage("");

    // Check if this is the first message in the conversation
    const isFirstMessage = currentConversation?.messages.length === 0;

    const loadingMessage: Message = {
      id: nanoid(),
      content: "▋",
      sender: "ai",
    };
    addMessage(loadingMessage);

    // Abort previous request if exists
    if (abortController.current) {
      abortController.current.abort();
    }

    abortController.current = new AbortController();
    const timeout = setTimeout(() => abortController.current?.abort(), API_TIMEOUT);

    const contextMessages =
      currentConversation?.messages
        .slice(-MAX_VISIBLE_MESSAGES)
        .filter((msg) => msg.content !== "▋")
        .map((msg) => ({
          role: msg.sender === "user" ? "user" : "assistant",
          content: msg.content,
        })) || [];

    let updateQueue: string[] = [];
    let lastUpdate = Date.now();
    let aiContent = "";
    let currentThinkBlock = "";
    let isInsideThinkBlock = false;

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: messageToSend,
          model: selectedModel,
          messages: contextMessages,
        }),
        signal: abortController.current.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      if (!response.body) throw new Error("No response body received");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          // Make sure we process any remaining content in the updateQueue
          if (updateQueue.length > 0) {
            aiContent += updateQueue.join("");
            updateQueue = [];
          }

          break;
        }

        const text = decoder.decode(value);
        const lines = text.split("\n").filter((line) => line.trim());

        for (const line of lines) {
          try {
            const parsedChunk = JSON.parse(line);
            if (parsedChunk.response) {
              const chunk = parsedChunk.response;
              if (chunk.includes("<think>")) {
                isInsideThinkBlock = true;
                updateQueue.push("<think>");
              }

              if (isInsideThinkBlock) {
                if (chunk.includes("</think>")) {
                  isInsideThinkBlock = false;
                  updateQueue.push(chunk.replace("</think>", ""));
                  updateQueue.push("</think>");
                } else {
                  updateQueue.push(chunk);
                }
              } else {
                updateQueue.push(chunk);
              }

              if (Date.now() - lastUpdate > UPDATE_THRESHOLD) {
                aiContent += updateQueue.join("");
                updateQueue = [];
                debouncedUpdate(aiContent + "▋");
                lastUpdate = Date.now();
              }
            }
          } catch (e) {
            console.warn("Failed to parse chunk:", line);
            continue;
          }
        }
      }

      aiContent += updateQueue.join("");
      updateLastMessage(aiContent);

      // Generate title if this is the first message
      if (isFirstMessage) {
        try {
          const titleResponse = await fetch("/api/chat", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              prompt: `Based on this message, give me a 2-3 word title. Only output the title words, nothing else.

Message: "${messageToSend}"

Title:`,
              model: selectedModel,
              messages: [],
            }),
          });

          if (titleResponse.ok) {
            let titleContent = "";
            const titleReader = titleResponse.body?.getReader();
            const titleDecoder = new TextDecoder();

            if (titleReader) {
              try {
                while (true) {
                  const { done, value } = await titleReader.read();
                  if (done) break;
                  const text = titleDecoder.decode(value);
                  const lines = text.split("\n").filter((line) => line.trim());
                  for (const line of lines) {
                    try {
                      const parsedChunk = JSON.parse(line);
                      if (parsedChunk.response) {
                        titleContent += parsedChunk.response;
                      }
                    } catch (e) {
                      continue;
                    }
                  }
                }
              } finally {
                titleReader.releaseLock();
              }
            }

            const processedTitle = titleContent
              .trim()
              .replace(/["']/g, "") // remove quotes
              .replace(/^Title:?\s*/i, "") // remove "Title:" prefix
              .replace(/[<>]/g, "") // remove any HTML-like tags
              .replace(/think/gi, "") // remove any instances of "think"
              .replace(/\s+/g, " ") // normalize whitespace
              .split(/\s+/) // split into words
              .slice(0, 3) // limit to 3 words
              .join(" ")
              .substring(0, 30); // hard limit on length

            // Update the conversation title
            setConversations((prev) =>
              prev.map((conv) =>
                conv.id === currentConversationId
                  ? {
                      ...conv,
                      title: processedTitle || "New Chat",
                    }
                  : conv,
              ),
            );
          }
        } catch (error) {
          console.error("Error generating title:", error);
          // Set a fallback title
          setConversations((prev) =>
            prev.map((conv) =>
              conv.id === currentConversationId
                ? {
                    ...conv,
                    title: "New Chat",
                  }
                : conv,
            ),
          );
        }
      }
    } catch (error) {
      console.error("Stream reading error:", error);
      updateLastMessage(
        error instanceof Error && error.name === "AbortError"
          ? "Request timed out. Please try again."
          : `Error: ${error instanceof Error ? error.message : "Failed to connect to chat service"}`,
      );
    } finally {
      setIsLoading(false);
    }
  }, [
    inputMessage,
    currentConversationId,
    isLoading,
    addMessage,
    updateLastMessage,
    debouncedUpdate,
    currentConversation?.messages,
    selectedModel,
  ]);

  const handleInputFocus = useCallback(() => {
    if (currentConversationId === null) {
      createNewConversation();
    }
  }, [currentConversationId, createNewConversation]);

  // Cleanup Effects
  useEffect(() => {
    return () => {
      if (cleanupTimeout.current) {
        clearTimeout(cleanupTimeout.current);
      }
      if (abortController.current) {
        abortController.current.abort();
      }
      messageCache.current.clear();
      debouncedUpdate.cancel();
    };
  }, [debouncedUpdate]);

  useEffect(() => {
    scrollToBottom();
  }, [currentConversation?.messages, scrollToBottom]);

  return (
    <>
      <Sidebar
        conversations={conversations}
        currentConversationId={currentConversationId}
        onConversationSelect={setCurrentConversationId}
        onNewChat={createNewConversation}
      />
      <div className="flex h-screen w-full flex-1 flex-col items-center pt-8 text-foreground">
        <div className="w-full max-w-3xl flex-1">
          <MessageList
            messages={currentConversation?.messages || []}
            onScrollRef={(ref) => (messagesEndRef.current = ref)}
          />
        </div>
        <ChatInput
          inputMessage={inputMessage}
          onInputChange={(e) => setInputMessage(e.target.value)}
          onSendMessage={handleSendMessage}
          onFocus={handleInputFocus}
          onModelSelect={handleModelChange}
          selectedModel={selectedModel}
        />
      </div>
    </>
  );
}
