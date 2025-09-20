"use client";
import Sidebar from "@/components/Sidebar";
import { usePathname } from "next/navigation";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showSidebar = pathname !== "/" && pathname !== "/signup";
  return (
    <div className="flex min-h-screen">
      {showSidebar && <Sidebar />}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
