"use client";

import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bot, Send, User, Plus } from "lucide-react";
import { parseInlineCode } from "../utils/parseInlineCode";
import type { Message, Conversation } from "../types/chat";
import { nanoid } from "nanoid";

export default function ChatInterface() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const currentConversation = conversations.find((conv) => conv.id === currentConversationId);

  const createNewConversation = useCallback(() => {
    const newConversation: Conversation = {
      id: nanoid(),
      title: `New Chat ${conversations.length + 1}`,
      messages: [],
    };
    setConversations((prev) => [...prev, newConversation]);
    setCurrentConversationId(newConversation.id);
  }, [conversations.length]);

  const addMessage = useCallback(
    (message: Message) => {
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === currentConversationId
            ? { ...conv, messages: [...conv.messages, message] }
            : conv,
        ),
      );
    },
    [currentConversationId],
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
                    ? { ...msg, content: content }
                    : msg,
                ),
              }
            : conv,
        ),
      );
    },
    [currentConversationId],
  );

  const handleSendMessage = useCallback(() => {
    if (inputMessage.trim() === "" || currentConversationId === null || isLoading) return;

    setIsLoading(true);

    // Add user message
    const userMessage: Message = {
      id: nanoid(),
      content: inputMessage,
      sender: "user",
    };
    addMessage(userMessage);

    // Store message and clear input
    const messageToSend = inputMessage;
    setInputMessage("");

    // Add temporary loading message
    const loadingMessage: Message = {
      id: nanoid(),
      content: "▋", // Creates a typing indicator
      sender: "ai",
    };
    addMessage(loadingMessage);

    // Call Ollama API
    fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: messageToSend,
      }),
    })
      .then((response) => {
        if (!response.body) throw new Error("No response body");

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let aiContent = "";

        function readStream() {
          reader
            .read()
            .then(({ done, value }) => {
              if (done) {
                updateLastMessage(aiContent);
                setIsLoading(false);
                return;
              }

              const chunk = decoder.decode(value);
              // Splie the chunk into lines
              const lines = chunk.split("\n").filter((line) => line.trim() !== "");

              for (const line of lines) {
                try {
                  const parsedChunk = JSON.parse(line);
                  if (parsedChunk.response) {
                    aiContent += parsedChunk.response;
                  }
                } catch (e) {
                  console.error("Error parsing chunk:", line, e);
                  continue;
                }
              }

              updateLastMessage(aiContent + "▋");
              readStream();
            })
            .catch((error: Error) => {
              console.error("Error reading stream", error);
              handleStreamError();
            });
        }

        readStream();
      })
      .catch((error) => {
        console.error("Error connecting to Ollama", error);
        handleStreamError();
      });
  }, [inputMessage, currentConversationId, isLoading, addMessage, updateLastMessage]);

  const handleStreamError = useCallback(() => {
    let errorContent = "An error occurred while connecting to Ollama";
    errorContent += "Please ensure:\n";
    errorContent += "1. Ollama is installed and running\n";
    errorContent += "2. The server is accessible at http://192.168.2.23:11434\n";
    errorContent += "3. The deepseek-r1 model is installed (`ollama pull deepseek-r1`)\n";

    const errorMessage: Message = {
      id: nanoid(),
      content: "Failed to connect to Ollama",
      sender: "ai",
    };
    addMessage(errorMessage);
    setIsLoading(false);
  }, [addMessage]);

  return (
    <>
      <div className="w-64 bg-gray-800 p-4 text-white">
        <h2 className="mb-4 text-xl font-bold">Conversations</h2>
        <Button onClick={createNewConversation} className="mb-4 w-full">
          <Plus size={20} className="mr-2" /> New Chat
        </Button>
        <ScrollArea className="h-[calc(100vh-10rem)]">
          {conversations.map((conversation) => (
            <div
              key={conversation.id}
              className={`mb-2 cursor-pointer rounded p-2 ${conversation.id === currentConversationId ? "bg-gray-700" : "hover:bg-gray-700"}`}
              onClick={() => setCurrentConversationId(conversation.id)}
            >
              {conversation.title}
            </div>
          ))}
        </ScrollArea>
      </div>
      <div className="flex flex-1 flex-col">
        <ScrollArea className="flex-1 p-4">
          {currentConversation?.messages.map((message) => (
            <div
              key={message.id}
              className={`mb-4 flex items-start ${message.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              {message.sender === "ai" && (
                <Avatar className="mr-2">
                  <AvatarFallback>
                    <Bot size={24} />
                  </AvatarFallback>
                </Avatar>
              )}
              <div
                className={`max-w-[70%] rounded-lg p-3 ${message.sender === "user" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
              >
                {message.sender === "ai"
                  ? message.content.startsWith("<think>")
                    ? // Split content by think tags and map each part
                      message.content.split(/(<think>[\s\S]*?<\/think>)/).map((part, index) => {
                        const key = `${message.id}-part-${index}-${part.slice(0, 10)}`;
                        if (part.startsWith("<think>")) {
                          // style the think content
                          return (
                            <div
                              key={key}
                              className="rounded border-l-4 border-gray-400 bg-gray-100 p-2 italic text-gray-600"
                            >
                              {parseInlineCode(message.content.replace(/<\/?think>/g, ""))}
                            </div>
                          );
                        } else if (part.trim() !== "") {
                          return <div key={key}>{parseInlineCode(part)}</div>;
                        }
                        return null;
                      })
                    : parseInlineCode(message.content)
                  : message.content}
              </div>
              {message.sender === "user" && (
                <Avatar className="ml-2">
                  <AvatarFallback>
                    <User size={24} />
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
        </ScrollArea>
        <div className="border-t p-4">
          <div className="flex items-center">
            <Input
              type="text"
              placeholder="Type your message..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              className="mr-2 flex-1"
            />
            <Button onClick={handleSendMessage} disabled={currentConversationId === null}>
              <Send size={20} />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
