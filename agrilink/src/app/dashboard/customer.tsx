'use client'
import { useState } from 'react'

export default function CustomerLogin() {
  const [isRegistering, setIsRegistering] = useState(true)
  const [form, setForm] = useState({ name: '', email: '', password: '' })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (isRegistering) {
      alert(`Registered as ${form.name}`)
    } else {
      alert(`Signed in as ${form.email}`)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-green-50">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-lg w-80">
        <h2 className="text-xl font-bold mb-4">
          {isRegistering ? 'Register' : 'Sign In'}
        </h2>

        {isRegistering && (
          <input
            type="text"
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full mb-3 p-2 border rounded"
            required
          />
        )}

        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="w-full mb-3 p-2 border rounded"
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="w-full mb-4 p-2 border rounded"
          required
        />

        <button
          type="submit"
          className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600"
        >
          {isRegistering ? 'Register' : 'Sign In'}
        </button>

        <p className="mt-4 text-sm text-center">
          {isRegistering ? 'Already registered?' : 'New user?'}{' '}
          <span
            onClick={() => setIsRegistering(!isRegistering)}
            className="text-green-600 cursor-pointer underline"
          >
            {isRegistering ? 'Sign In' : 'Register'}
          </span>
        </p>
      </form>
    </div>
  )
}
