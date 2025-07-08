import dynamic from "next/dynamic";

const ChatbotWidget = dynamic(() => import("../components/ChatbotWidget"), { ssr: false });

export default ChatbotWidget;
