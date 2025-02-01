import { Button } from "@/components/ui/button";
import { SquarePen } from "lucide-react";
import { SidebarProps } from "../types/types";
import { X } from "lucide-react";
import localFont from "next/font/local";

const neo = localFont({ src: "../fonts/Antimatrix.ttf" });

export function Sidebar({
  conversations,
  currentConversationId,
  onConversationSelect,
  onNewChat,
  onDeleteConversation,
}: SidebarProps) {
  return (
    <div className="w-64 p-4 text-foreground">
      <div className="fixed left-0 top-0 h-screen w-64 border-r-2 bg-background p-4 text-foreground">
        <div className="mb-4 flex w-full items-center justify-between">
          <h2 className={`${neo.className} p-2 text-5xl uppercase`}>Neo</h2>
          <Button
            variant="ghost"
            className="hover:bg-transparent hover:text-muted"
            onClick={onNewChat}
          >
            <SquarePen size={20} />
          </Button>
        </div>
        <div className="h-[calc(100vh-10rem)] overflow-y-auto">
          {conversations.map((conversation) => (
            <div
              key={conversation.id}
              className={`mb-2 flex items-center justify-between gap-2 rounded p-2 ${
                conversation.id === currentConversationId ? "" : ""
              }`}
            >
              <div
                className="w-full cursor-pointer truncate whitespace-nowrap rounded px-2 py-1 hover:text-muted"
                onClick={() => onConversationSelect(conversation.id)}
              >
                {conversation.title}
              </div>
              <Button
                variant="ghost"
                className="p-0 hover:bg-transparent hover:text-muted"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteConversation(conversation.id);
                }}
              >
                <X size={20} />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
