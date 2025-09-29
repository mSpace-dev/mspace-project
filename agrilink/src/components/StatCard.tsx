"use client";

type StatCardProps = {
  icon: string;
  number: string;
  label: string;
};

export default function StatCard({ icon, number, label }: StatCardProps) {
  return (
    <div className="text-center bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="text-3xl mb-4">{icon}</div>
      <div className="text-2xl font-bold text-green-600 mb-2">{number}</div>
      <p className="text-gray-600 text-sm">{label}</p>
    </div>
  );
}
