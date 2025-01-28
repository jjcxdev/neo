export type Message = {
  id: string;
  content: string;
  sender: "user" | "ai";
};

export type Conversation = {
  id: string;
  title: string;
  messages: Message[];
};
