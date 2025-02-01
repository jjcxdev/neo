import ChatInterface from "./components/ChatInterface";
import { AuthGuard } from "./components/AuthGuard";

export default function Home() {
  return (
    <AuthGuard>
      <div className="flex h-screen text-foreground">
        <ChatInterface />
      </div>
    </AuthGuard>
  );
}
