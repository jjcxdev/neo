import ChatInterface from "./components/ChatInterface";

export default function Home() {
  return (
    <div className="flex h-screen bg-background text-foreground">
      <ChatInterface />
    </div>
  );
}
