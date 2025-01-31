import ChatInterface from "./components/ChatInterface";
import MatrixRain from "./components/MatrixRain";

export default function Home() {
  return (
    <div className="flex h-screen text-foreground">
      {/* <MatrixRain /> */}
      <ChatInterface />
    </div>
  );
}
