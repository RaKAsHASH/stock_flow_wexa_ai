"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Sidebar() {
  const pathname = usePathname();

  const links = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Products', href: '/products' },
    { name: 'Settings', href: '/settings' },
  ];

  return (
    <div className="w-64 bg-gray-900 text-white flex flex-col">
      <div className="p-6 font-bold text-xl border-b border-gray-800">
        StockFlow
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {links.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link 
              key={link.name} 
              href={link.href}
              className={`block px-4 py-2 rounded transition-colors ${
                isActive ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              {link.name}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-gray-800">
        <button
          type="button"
          onClick={async () => {
            await fetch('/api/auth/logout', {
              method: 'POST',
              credentials: 'include',
            });
            window.location.href = '/login';
          }}
          className="text-gray-400 hover:text-white w-full text-left px-4 py-2"
        >
          Logout
        </button>
      </div>
    </div>
  );
}