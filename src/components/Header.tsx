'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import AuthModal from './AuthModal';

export default function Header() {
  const { user, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const themeDropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const mobileButtonRef = useRef<HTMLButtonElement>(null);

  // Check if logged-in user has admin role in Firestore
  useEffect(() => {
    let isMounted = true;
    async function checkAdminRole() {
      if (!user) {
        if (isMounted) setIsAdmin(false);
        return;
      }
      try {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (isMounted) {
          setIsAdmin(userDoc.exists() && userDoc.data()?.role === 'admin');
        }
      } catch (err) {
        if (isMounted) setIsAdmin(false);
      }
    }
    checkAdminRole();
    return () => {
      isMounted = false;
    };
  }, [user]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
      if (
        themeDropdownRef.current &&
        !themeDropdownRef.current.contains(event.target as Node)
      ) {
        setThemeDropdownOpen(false);
      }
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node) &&
        mobileButtonRef.current &&
        !mobileButtonRef.current.contains(event.target as Node)
      ) {
        setMobileMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleThemeSelect = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    window.dispatchEvent(new Event('themeChange'));
    setThemeDropdownOpen(false);
  };

  const firstLetter = user?.email ? user.email.charAt(0).toUpperCase() : 'U';

  return (
    <>
      <header className="bg-background/80 backdrop-blur-md border-b border-border sticky top-0 z-40 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-8">
            <Link
              href="/"
              className="text-lg sm:text-xl font-extrabold tracking-tight flex items-center mr-1 sm:mr-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded"
            >
              <span className="text-blue-600 dark:text-blue-400">
                ticketmaster
              </span>
              <span className="text-foreground">.clone</span>
            </Link>
            <nav
              aria-label="Main Navigation"
              className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground"
            >
              <Link
                href="/?category=Music"
                className="hover:text-foreground transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded"
              >
                Concerts
              </Link>
              <Link
                href="/?category=Sports"
                className="hover:text-foreground transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded"
              >
                Sports
              </Link>
              <Link
                href="/?category=Arts+%26+Theatre"
                className="hover:text-foreground transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded"
              >
                Arts & Theater
              </Link>
              {isAdmin && (
                <Link
                  href="/admin"
                  className="text-sky-500 hover:text-sky-400 font-semibold transition flex items-center gap-1.5 px-2 py-1 bg-sky-500/10 rounded-lg border border-sky-500/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/50"
                >
                  <span aria-hidden="true">⚙️</span> Admin
                </Link>
              )}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            {/* Theme Toggle Button & Dropdown */}
            <div className="relative" ref={themeDropdownRef}>
              <button
                onClick={() => setThemeDropdownOpen(!themeDropdownOpen)}
                aria-label={
                  theme === 'dark'
                    ? 'Switch to light theme'
                    : 'Switch to dark theme'
                }
                aria-expanded={themeDropdownOpen}
                className="p-2.5 rounded-xl bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-accent transition flex items-center justify-center cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 shadow-sm"
                title="Change theme"
              >
                {theme === 'dark' ? (
                  <svg
                    aria-hidden="true"
                    focusable="false"
                    className="w-4 h-4 text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                    />
                  </svg>
                ) : (
                  <svg
                    aria-hidden="true"
                    focusable="false"
                    className="w-4 h-4 text-amber-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                )}
              </button>

              {themeDropdownOpen && (
                <div className="absolute right-0 mt-3 w-40 bg-card border border-border rounded-2xl shadow-2xl py-2 z-50">
                  <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border">
                    Appearance
                  </div>
                  <div className="py-1 space-y-0.5 px-1">
                    <button
                      onClick={() => handleThemeSelect('light')}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center gap-2.5 transition rounded-lg cursor-pointer ${
                        theme === 'light'
                          ? 'bg-primary/10 text-primary font-semibold'
                          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                      }`}
                    >
                      <span aria-hidden="true">☀️</span> Light
                    </button>
                    <button
                      onClick={() => handleThemeSelect('dark')}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center gap-2.5 transition rounded-lg cursor-pointer ${
                        theme === 'dark'
                          ? 'bg-primary/10 text-primary font-semibold'
                          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                      }`}
                    >
                      <span aria-hidden="true">🌙</span> Dark
                    </button>
                  </div>
                </div>
              )}
            </div>

            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  aria-label={`User account menu for ${user.email || 'User'}`}
                  aria-expanded={dropdownOpen}
                  className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-emerald-500 text-primary-foreground font-bold flex items-center justify-center transition shadow-md cursor-pointer border-2 border-border hover:border-primary hover:ring-4 hover:ring-primary/20 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                  title={user.email || 'Account'}
                >
                  {firstLetter}
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-3 w-56 bg-card border border-border rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-2.5 border-b border-border">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                        Signed in as
                      </p>
                      <p className="text-xs font-semibold text-foreground truncate mt-0.5">
                        {user.email}
                      </p>
                      {isAdmin && (
                        <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-sky-500/20 text-sky-400 border border-sky-500/30">
                          ADMIN
                        </span>
                      )}
                    </div>

                    <div className="py-1 px-1">
                      <Link
                        href="/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="w-full text-left px-3 py-2.5 text-xs text-foreground hover:bg-accent hover:text-accent-foreground rounded-lg flex items-center gap-2.5 transition"
                      >
                        <span aria-hidden="true">🎟</span> My Profile
                      </Link>
                      {isAdmin && (
                        <Link
                          href="/admin"
                          onClick={() => setDropdownOpen(false)}
                          className="w-full text-left px-3 py-2.5 text-xs text-sky-400 hover:bg-sky-500/10 rounded-lg flex items-center gap-2.5 transition font-semibold"
                        >
                          <span aria-hidden="true">⚙️</span> Admin Dashboard
                        </Link>
                      )}
                    </div>

                    <div className="border-t border-border pt-1 px-1">
                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          signOut();
                        }}
                        className="w-full text-left px-3 py-2.5 text-xs text-red-500 hover:bg-red-500/10 rounded-lg flex items-center gap-2.5 transition cursor-pointer"
                      >
                        <span aria-hidden="true">🚪</span> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="text-muted-foreground hover:text-foreground text-sm font-medium transition px-3 py-2 rounded-xl cursor-pointer whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
              >
                Sign In
              </button>
            )}

            {/* Mobile Menu Hamburger Button */}
            <button
              ref={mobileButtonRef}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
              className="md:hidden p-2.5 rounded-xl bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-accent transition flex items-center justify-center cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 shadow-sm"
              title="Toggle menu"
            >
              <svg
                aria-hidden="true"
                focusable="false"
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {mobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown Drawer */}
        {mobileMenuOpen && (
          <div
            ref={mobileMenuRef}
            className="md:hidden absolute top-16 left-0 w-full bg-card/95 backdrop-blur-md border-b border-border shadow-2xl py-4 px-6 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
          >
            <nav
              aria-label="Mobile Navigation"
              className="flex flex-col space-y-2 font-medium text-sm"
            >
              <Link
                href="/?category=Music"
                onClick={() => setMobileMenuOpen(false)}
                className="text-muted-foreground hover:text-foreground hover:bg-accent px-4 py-2.5 rounded-xl transition flex items-center gap-3"
              >
                <span aria-hidden="true">🎸</span> Concerts
              </Link>
              <Link
                href="/?category=Sports"
                onClick={() => setMobileMenuOpen(false)}
                className="text-muted-foreground hover:text-foreground hover:bg-accent px-4 py-2.5 rounded-xl transition flex items-center gap-3"
              >
                <span aria-hidden="true">🏀</span> Sports
              </Link>
              <Link
                href="/?category=Arts+%26+Theatre"
                onClick={() => setMobileMenuOpen(false)}
                className="text-muted-foreground hover:text-foreground hover:bg-accent px-4 py-2.5 rounded-xl transition flex items-center gap-3"
              >
                <span aria-hidden="true">🎭</span> Arts & Theater
              </Link>

              {isAdmin && (
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sky-400 bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/20 px-4 py-2.5 rounded-xl transition flex items-center gap-3 font-semibold"
                >
                  <span aria-hidden="true">⚙️</span> Admin Dashboard
                </Link>
              )}
            </nav>
          </div>
        )}
      </header>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </>
  );
}
