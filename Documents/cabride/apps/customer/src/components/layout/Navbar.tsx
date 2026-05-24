"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import Logo from "./Logo";

const NAV = [
  { href: "/dashboard", label: "Home",    icon: "🏠" },
  { href: "/book",      label: "Book",    icon: "🚖" },
  { href: "/history",   label: "History", icon: "📋" },
];

export default function Navbar() {
  const path = usePathname();
  const { logout } = useAuth();

  return (
    <>
      {/* Desktop sidebar / top bar */}
      <header className="hidden md:flex fixed top-0 left-0 right-0 z-50 h-14 items-center px-6 bg-[#0f0f0f] border-b border-[#1e1e1e]">
        <Logo size="sm" />
        <nav className="flex items-center gap-1 ml-8">
          {NAV.map(({ href, label }) => (
            <Link key={href} href={href}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
                ${path === href ? "bg-yellow-400/10 text-yellow-400" : "text-gray-500 hover:text-white hover:bg-[#1e1e1e]"}`}>
              {label}
            </Link>
          ))}
        </nav>
        <button onClick={logout}
          className="ml-auto text-sm text-gray-500 hover:text-white transition-colors">
          Sign out
        </button>
      </header>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0f0f0f] border-t border-[#1e1e1e] px-2 py-2 safe-area-bottom">
        <div className="flex items-center justify-around max-w-md mx-auto">
          {NAV.map(({ href, label, icon }) => (
            <Link key={href} href={href}
              className={`flex flex-col items-center gap-1 px-4 py-1.5 rounded-xl transition-colors text-xs font-medium
                ${path === href ? "text-yellow-400" : "text-gray-600"}`}>
              <span className="text-xl leading-none">{icon}</span>
              {label}
            </Link>
          ))}
          <button onClick={logout}
            className="flex flex-col items-center gap-1 px-4 py-1.5 rounded-xl text-xs font-medium text-gray-600">
            <span className="text-xl leading-none">👤</span>
            Sign out
          </button>
        </div>
      </nav>
    </>
  );
}
