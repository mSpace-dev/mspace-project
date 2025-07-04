"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Replace with real auth
    if (username === "admin" && password === "password") {
      router.push("/");
    } else {
      alert("Invalid credentials");
    }
  };

  return (
    <form onSubmit={handleLogin} className="max-w-xs mx-auto mt-20 p-8 bg-white rounded shadow">
      <h1 className="text-xl font-bold mb-4">Admin Login</h1>
      <input className="w-full mb-2 p-2 border" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
      <input className="w-full mb-4 p-2 border" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
      <button className="w-full bg-green-600 text-white py-2 rounded" type="submit">Login</button>
    </form>
  );
}