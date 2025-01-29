"use client";

import { useCallback, useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bot, Send, User, Plus, SquarePen } from "lucide-react";
import { parseInlineCode } from "../utils/parseInlineCode";
import type { Message, Conversation } from "../types/chat";
import { nanoid } from "nanoid";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/cjs/styles/prism";
import remarkGfm from "remark-gfm";

export default function ChatInterface() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const currentConversation = conversations.find((conv) => conv.id === currentConversationId);
  const scrollRef = useRef<HTMLDivElement>(null);

  const createNewConversation = useCallback(() => {
    const newConversation: Conversation = {
      id: nanoid(),
      title: `New Chat ${conversations.length + 1}`,
      messages: [],
    };
    setConversations((prev) => [...prev, newConversation]);
    setCurrentConversationId(newConversation.id);
  }, [conversations.length]);

  const handleInputFocus = useCallback(() => {
    if (currentConversationId === null) {
      createNewConversation();
    }
  }, [currentConversationId, createNewConversation]);

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

    if (currentConversationId === null) {
      createNewConversation();
    }

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

  useEffect(() => {
    const viewport = document.querySelector("[data-radix-scroll-area-viewport]");
    if (viewport) {
      const lastMessage = viewport.lastElementChild?.lastElementChild;
      lastMessage?.scrollIntoView({ behavior: "smooth" });
    }
  }, [currentConversation?.messages]);

  return (
    <>
      <div className="border-border w-64 border bg-background p-4 text-foreground">
        <div className="mb-4 flex w-full items-center justify-between">
          <h2 className="text-xl font-bold">JJCX Chat</h2>
          <Button variant="ghost" onClick={createNewConversation} className="">
            <SquarePen size={20} />
          </Button>
        </div>
        <ScrollArea className="h-[calc(100vh-10rem)]">
          {conversations.map((conversation) => (
            <div
              key={conversation.id}
              className={`mb-2 cursor-pointer rounded p-2 ${conversation.id === currentConversationId ? "bg-background" : "hover:bg-gray-700"}`}
              onClick={() => setCurrentConversationId(conversation.id)}
            >
              {conversation.title}
            </div>
          ))}
        </ScrollArea>
      </div>
      <div className="mx-auto flex max-w-4xl flex-1 flex-col bg-background text-foreground">
        <ScrollArea className="flex-1 p-4">
          <div ref={scrollRef}>
            {currentConversation?.messages.map((message) => (
              <div
                className={`max-w-[90%] rounded-lg p-3 ${message.sender === "user" ? "bg-accent rounded-2xl text-foreground" : "bg-background text-foreground"}`}
              >
                {message.sender === "ai" ? (
                  message.content.startsWith("<think>") ? (
                    message.content.split(/(<think>[\s\S]*?<\/think>)/).map((part, index) => {
                      const key = `${message.id}-part-${index}-${part.slice(0, 10)}`;
                      if (part.startsWith("<think>")) {
                        return (
                          <div
                            key={key}
                            className="text-muted-foreground border-border mb-2 border-l-2 bg-background p-2 text-sm italic"
                          >
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm]}
                              components={{
                                code({ node, inline, className, children, ...props }: any) {
                                  const match = /language-(\w+)/.exec(className || "");
                                  return inline ? (
                                    <code
                                      className="bg-muted rounded px-1.5 py-0.5 text-sm"
                                      {...props}
                                    >
                                      {children}
                                    </code>
                                  ) : (
                                    <SyntaxHighlighter
                                      language={match ? match[1] : ""}
                                      style={oneDark}
                                      PreTag="div"
                                      className="rounded-lg"
                                      {...props}
                                    >
                                      {String(children).replace(/\n$/, "")}
                                    </SyntaxHighlighter>
                                  );
                                },
                              }}
                            >
                              {part.replace(/<\/?think>/g, "")}
                            </ReactMarkdown>
                          </div>
                        );
                      } else if (part.trim() !== "") {
                        return (
                          <div key={key}>
                            <ReactMarkdown
                              key={`markdown-${key}`}
                              remarkPlugins={[remarkGfm]}
                              components={{
                                code({ node, inline, className, children, ...props }: any) {
                                  const match = /language-(\w+)/.exec(className || "");
                                  return inline ? (
                                    <code
                                      className="bg-muted rounded px-1.5 py-0.5 text-sm"
                                      {...props}
                                    >
                                      {children}
                                    </code>
                                  ) : (
                                    <SyntaxHighlighter
                                      language={match ? match[1] : ""}
                                      style={oneDark}
                                      PreTag="div"
                                      className="rounded-lg"
                                      {...props}
                                    >
                                      {String(children).replace(/\n$/, "")}
                                    </SyntaxHighlighter>
                                  );
                                },
                              }}
                            >
                              {part}
                            </ReactMarkdown>
                          </div>
                        );
                      }
                      return null;
                    })
                  ) : (
                    <ReactMarkdown
                      key={`markdown-${message.id}`}
                      remarkPlugins={[remarkGfm]}
                      components={{
                        code({ node, inline, className, children, ...props }: any) {
                          const match = /language-(\w+)/.exec(className || "");
                          return inline ? (
                            <code className="bg-muted rounded px-1.5 py-0.5 text-sm" {...props}>
                              {children}
                            </code>
                          ) : (
                            <SyntaxHighlighter
                              language={match ? match[1] : ""}
                              style={oneDark}
                              PreTag="div"
                              className="rounded-lg"
                              {...props}
                            >
                              {String(children).replace(/\n$/, "")}
                            </SyntaxHighlighter>
                          );
                        },
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  )
                ) : (
                  <div className="whitespace-pre-wrap">{message.content}</div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
        <div className="bg-muted rounded-t-2xl border-t p-4">
          <div className="flex w-full flex-col items-center">
            <div className="flex w-full">
              <Input
                type="text"
                placeholder="Type your message..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                className="mr-2 flex-1"
                onFocus={handleInputFocus}
              />
              <Button variant="ghost" onClick={handleSendMessage}>
                <Send size={20} />
              </Button>
            </div>
            <div className="flex w-full">Model picker</div>
          </div>
        </div>
      </div>
    </>
  );
}
