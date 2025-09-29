"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/users", label: "Users", icon: "👥" },
  { href: "/send-sms", label: "Send SMS", icon: "📱" },
  { href: "/alerts", label: "Alerts", icon: "🚨" },
  { href: "/settings", label: "Settings", icon: "⚙️" },
];

export default function Sidebar() {
  const pathname = usePathname();

  // Color palette from attached image
  const cardColors = [
    'bg-[#edd7c3]', // light beige
    'bg-[#6a6ba7]', // muted blue
    'bg-[#d3cfe0]', // pale lavender
    'bg-[#a07b9c]', // muted mauve
    'bg-[#d8b5bc]'  // soft pink
  ];

  return (
    <aside className="w-64 min-h-screen bg-gradient-to-b from-[#edd7c3] via-[#6a6ba7] to-[#d8b5bc] text-gray-900 shadow-lg">
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-8">AgriLink Admin</h2>
        <nav>
          <ul className="space-y-2">
            {navItems.map((item, idx) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors font-semibold text-lg ${cardColors[idx % cardColors.length]} ${
                    pathname === item.href
                      ? "ring-2 ring-green-700 shadow-md"
                      : "hover:scale-105"
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </aside>
  );
}
