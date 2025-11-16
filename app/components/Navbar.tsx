"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { label: "Home", href: "/" },
  { label: "Developers", href: "/#developers" },
  { label: "Blog", href: "/#blog" },
];

const Navbar = () => {
  const pathname = usePathname();

  return (
    <nav className="flex items-center justify-between px-16 py-4 bg-black/80 backdrop-blur-md border-b border-zinc-900">
      <div className="text-2xl font-bold text-white">ZEC × NEAR</div>
      <div className="flex items-center space-x-2">
        {navItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname === item.href || pathname.startsWith(item.href);

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                isActive
                  ? "bg-white text-black border-black"
                  : "bg-black text-white border-black hover:bg-gray-800"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
      <Link
        href="/bridge"
        className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors border border-yellow-400/60 shadow-[0_0_18px_rgba(250,204,21,0.55)]"
      >
        Get Started
      </Link>
    </nav>
  );
};

export default Navbar;


