"use client";

export default function BotLogPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-900 via-green-800 to-green-700 text-white font-sans">
      <h1 className="text-3xl font-bold mb-6">Bot Interaction Log</h1>
      <p className="text-green-200 mb-4">Audit chatbot messages and responses here.</p>
      {/* TODO: Add bot log table and search/filter */}
      <div className="bg-green-800 rounded-lg p-6 shadow text-center">
        <span className="text-green-200">Feature coming soon...</span>
      </div>
    </div>
  );
}