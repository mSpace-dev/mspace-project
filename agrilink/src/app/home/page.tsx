import Head from "next/head";
import Chatbot from "../components/chatbot";

export default function Home() {
  return (
    <>
      <Head>
        <title>AgriLink – Real-Time Agri Price Alerts</title>
      </Head>

      <main className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100">
        {/* Hero Section */}
        <section className="text-center py-20 px-6">
          <h1 className="text-4xl md:text-6xl font-bold text-green-700 mb-4">
            Welcome to AgriLink
          </h1>
          <p className="text-gray-600 text-lg md:text-xl max-w-2xl mx-auto">
            Real-time, AI-powered agricultural price alerts and insights tailored for Sri Lankan farmers, sellers, and consumers.
          </p>
          <div className="mt-8 flex justify-center gap-4 flex-wrap">
            <a
              href="/prices"
              className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-xl shadow"
            >
              View Prices
            </a>
            <a
              href="/alerts"
              className="bg-white border border-green-600 text-green-700 hover:bg-green-100 font-semibold px-6 py-3 rounded-xl shadow"
            >
              Subscribe to Alerts
            </a>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 px-6 bg-white">
          <h2 className="text-3xl font-bold text-center text-green-700 mb-10">
            Key Features
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <FeatureCard
              title="🔔 Real-Time SMS Alerts"
              desc="Get instant notifications when crop prices change in your region."
            />
            <FeatureCard
              title="📈 AI Forecasting"
              desc="Know tomorrow's trends today with ARIMA and LSTM-powered predictions."
            />
            <FeatureCard
              title="📍 Location-based Updates"
              desc="Receive alerts relevant to your specific district or province."
            />
            <FeatureCard
              title="🗣 Chatbot Assistant"
              desc="Ask natural language questions and get SMS replies instantly."
            />
            <FeatureCard
              title="🧠 GenAI Insights"
              desc="Understand the 'why' behind price movements with summarized insights."
            />
            <FeatureCard
              title="🔗 Open API Access"
              desc="Integrate AgriLink alerts into your apps, platforms, or marketplaces."
            />
          </div>
        </section>

        {/* Chatbot Section */}
        <section className="py-16 px-6 bg-white">
          <h2 className="text-2xl font-bold text-center text-green-700 mb-6">
            Chat with AgriLink
          </h2>
          <div className="flex justify-center">
            <Chatbot />
          </div>
        </section>
      </main>
    </>
  );
}

type FeatureCardProps = {
  title: string;
  desc: string;
};

function FeatureCard({ title, desc }: FeatureCardProps) {
  return (
    <div className="bg-green-50 rounded-2xl p-6 border border-green-100 shadow hover:shadow-md transition">
      <h3 className="text-xl font-semibold text-green-800 mb-2">{title}</h3>
      <p className="text-gray-700">{desc}</p>
    </div>
  );
}