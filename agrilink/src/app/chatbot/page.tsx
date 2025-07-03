import Chatbot from "../components/chatbot";

export default function ChatbotPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-400 via-green-200 to-green-100">
      <h1 className="text-3xl font-bold text-green-700 mb-8">Chat with AgriLink</h1>
      <Chatbot />
    </div>
  );
}
