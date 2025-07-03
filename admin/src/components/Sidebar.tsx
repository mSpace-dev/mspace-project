import Link from "next/link";

const nav = [
  { href: "/", label: "Dashboard" },
  { href: "/users", label: "Users" },
  { href: "/alerts", label: "Alerts" },
  { href: "/bot-log", label: "Bot Logs" },
  { href: "/settings", label: "Settings" },
];

export default function Sidebar() {
  return (
    <aside className="w-56 min-h-screen bg-green-100 p-4">
      <nav className="flex flex-col gap-4">
        {nav.map((item) => (
          <Link key={item.href} href={item.href} className="hover:font-bold">
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}