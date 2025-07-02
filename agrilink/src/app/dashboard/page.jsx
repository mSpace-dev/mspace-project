'use client'
import { useRouter } from 'next/navigation'

export default function Dashboard() {
  const router = useRouter()

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-green-100">
      <h1 className="text-3xl font-bold mb-8">Agri Dashboard</h1>
      <div className="flex gap-10">
        <button
          onClick={() => router.push('/customer')}
          className="bg-white p-6 rounded-2xl shadow-lg hover:bg-green-200 text-lg font-semibold"
        >
          Customer
        </button>
        <button
          onClick={() => alert('Seller login coming soon')}
          className="bg-white p-6 rounded-2xl shadow-lg hover:bg-green-200 text-lg font-semibold"
        >
          Seller
        </button>
      </div>
    </div>
  )
}
