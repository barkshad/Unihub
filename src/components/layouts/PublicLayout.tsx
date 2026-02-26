import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Home, Search, LogIn, Menu, X, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

export default function PublicLayout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Listings', href: '/listings', icon: Search },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 bg-neutral-900 rounded-lg flex items-center justify-center text-white transition-transform group-hover:scale-105">
                <Building2 className="w-5 h-5" />
              </div>
              <span className="text-lg font-bold tracking-tight text-neutral-900">UniHub</span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-neutral-900",
                    location.pathname === link.href ? "text-neutral-900" : "text-neutral-500"
                  )}
                >
                  {link.name}
                </Link>
              ))}
              <Link
                to="/admin"
                className="text-sm font-medium text-neutral-400 hover:text-neutral-900 flex items-center gap-2 transition-colors"
              >
                <LogIn className="w-4 h-4" />
                Admin
              </Link>
            </nav>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 text-neutral-500 hover:text-neutral-900"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-neutral-100 bg-white absolute w-full shadow-lg">
            <div className="px-4 pt-2 pb-6 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className={cn(
                    "block px-3 py-3 rounded-lg text-base font-medium transition-colors",
                    location.pathname === link.href 
                      ? "bg-neutral-100 text-neutral-900" 
                      : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
                  )}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              <div className="pt-4 mt-4 border-t border-neutral-100">
                <Link
                  to="/admin"
                  className="block px-3 py-3 rounded-lg text-base font-medium text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Admin Login
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-neutral-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-neutral-900 rounded flex items-center justify-center text-white">
                <Building2 className="w-3 h-3" />
              </div>
              <span className="text-base font-bold text-neutral-900">UniHub</span>
            </div>
            <p className="text-sm text-neutral-500">
              © {new Date().getFullYear()} UniHub. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
