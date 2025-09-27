export function Stats() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Impact</h2>
          <p className="text-xl text-gray-600">AgriLink is transforming agriculture across Sri Lanka</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <StatCard icon="👨‍🌾" number="10,000+" label="Active Farmers" />
          <StatCard icon="🏪" number="2,500+" label="Registered Sellers" />
          <StatCard icon="📊" number="100,000+" label="Daily Price Updates" />
          <StatCard icon="🌾" number="50+" label="Crop Varieties" />
        </div>
      </div>
    </section>
  )
}

// Reusable StatCard component
type StatCardProps = {
  icon: string
  number: string
  label: string
}

function StatCard({ icon, number, label }: StatCardProps) {
  return (
    <div className="text-center">
      <div className="text-4xl mb-4">{icon}</div>
      <div className="text-3xl font-bold text-green-600 mb-2">{number}</div>
      <p className="text-gray-600 text-sm">{label}</p>
    </div>
  )
}

