"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const nav = [
  { href: "/", label: "Dashboard" },
  { href: "/users", label: "Users" },
  { href: "/alerts", label: "Alerts" },
  { href: "/bot-log", label: "Bot Logs" },
  { href: "/settings", label: "Settings" },
];

export default function Sidebar() {
  const pathname = usePathname();

  const navigateToHome = () => {
    window.location.href = '/home';
  };

  return (
    <aside
      className="w-56 min-h-screen p-4
        bg-gradient-to-b from-green-950 via-green-900 to-green-800
        text-green-100 shadow-lg flex flex-col"
    >
      {/* AgriLink Header */}
      <div className="mb-6 cursor-pointer" onClick={navigateToHome}>
        <h1 className="text-2xl font-bold text-white hover:text-green-200 transition-colors">
          AgriLink
        </h1>
        <p className="text-sm text-green-200">Admin Portal</p>
      </div>
      
      <nav className="flex flex-col gap-4 mt-8">
        {nav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`px-3 py-2 rounded transition
              ${pathname === item.href
                ? "bg-green-700 text-white font-bold"
                : "hover:bg-green-800 hover:text-white"}`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}