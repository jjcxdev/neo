export type Message = {
  id: string;
  content: string;
  sender: "user" | "ai";
};

export interface MessageListProps {
  messages: Message[];
  onScrollRef: (ref: HTMLDivElement | null) => void;
}

export interface MessageProps {
  message: Message;
}

export type Conversation = {
  id: string;
  title: string;
  messages: Message[];
};

// Constants for memory optimization
export const MAX_VISIBLE_MESSAGES = 50;
export const MAX_CONVERSATIONS = 10;
export const CLEANUP_THRESHOLD = 100;
export const API_TIMEOUT = 30000;
export const UPDATE_THRESHOLD = 100;

export interface ModelDetails {
  parent_model: string;
  format: string;
  family: string;
  families: string[];
  parameter_size: string;
  quantization_level: string;
}

export interface Model {
  name: string;
  model: string;
  modified_at: string;
  size: number;
  digest: string;
  details: ModelDetails;
}

export interface ModelSelectorProps {
  onModelSelect: (model: string) => void;
  currentModel: string;
  defaultModel?: string;
}

export interface ChatInputProps {
  inputMessage: string;
  onInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSendMessage: () => void;
  onFocus: () => void;
  onModelSelect: (model: string) => void;
  selectedModel: string;
}

export interface SidebarProps {
  conversations: Conversation[];
  currentConversationId: string | null;
  onConversationSelect: (id: string) => void;
  onNewChat: () => void;
}
