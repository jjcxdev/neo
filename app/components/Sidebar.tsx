import { Button } from "@/components/ui/button";
import { SquarePen } from "lucide-react";
import { SidebarProps } from "../types/types";
import localFont from "next/font/local";

const neo = localFont({ src: "../fonts/Antimatrix.ttf" });

export function Sidebar({
  conversations,
  currentConversationId,
  onConversationSelect,
  onNewChat,
}: SidebarProps) {
  return (
    <div className="w-64 p-4 text-foreground">
      <div className="fixed left-0 top-0 h-screen w-64 border-r-2 bg-background p-4 text-foreground">
        <div className="mb-4 flex w-full items-center justify-between">
          <h2 className={`${neo.className} text-5xl uppercase`}>Neo</h2>
          <Button variant="ghost" onClick={onNewChat}>
            <SquarePen size={20} />
          </Button>
        </div>
        <div className="h-[calc(100vh-10rem)] overflow-y-auto">
          {conversations.map((conversation) => (
            <div
              key={conversation.id}
              className={`mb-2 cursor-pointer rounded p-2 ${conversation.id === currentConversationId ? "bg-accent hover:bg-neutral-950" : "hover:bg-neutral-950"}`}
              onClick={() => onConversationSelect(conversation.id)}
            >
              {conversation.title}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
