'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import Link from 'next/link';

interface Ticket {
  id: string;
  eventId: string;
  eventName: string;
  eventDate: string;
  eventTime: string;
  venueName: string;
  city: string;
  image: string;
  sessionId: string;
  purchasedAt: string;
}

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const { theme, setTheme } = useTheme();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUserTickets() {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const q = query(
          collection(db, 'tickets'),
          where('userId', '==', user.uid),
        );
        const querySnapshot = await getDocs(q);
        const userTickets: Ticket[] = [];
        querySnapshot.forEach((doc) => {
          userTickets.push({ id: doc.id, ...doc.data() } as Ticket);
        });
        setTickets(userTickets);
      } catch (err) {
        console.error('Error fetching tickets from Firestore:', err);
      } finally {
        setLoading(false);
      }
    }

    if (!authLoading) {
      fetchUserTickets();
    }
  }, [user, authLoading]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-2xl font-bold mb-2">Sign-in Required</h1>
        <p className="text-muted-foreground text-sm mb-6">
          Please log in to view your profile and purchased ticket passes.
        </p>
        <Link
          href="/"
          className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-3 rounded-xl transition text-sm"
        >
          Back to Home
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground pb-20">
      {/* Header */}
      <div className="bg-card border-b border-muted px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="text-xs text-muted-foreground hover:text-foreground transition flex items-center gap-1"
          >
            ← Back to Home
          </Link>
          <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full uppercase tracking-wider">
            Account Dashboard
          </span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 mt-8 space-y-8">
        {/* User Info Card */}
        <div className="bg-card border border-muted rounded-3xl p-6 md:p-8 flex items-center gap-6 shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-emerald-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
            {user.email?.[0].toUpperCase() || 'U'}
          </div>
          <div>
            <h1 className="text-xl font-bold">{user.email}</h1>
            <p className="text-xs text-muted-foreground mt-1">
              Verified Ticketmaster Fan Account
            </p>
          </div>
        </div>

        {/* Preferences / Settings Section */}
        <div className="bg-card border border-muted rounded-3xl p-6 md:p-8 space-y-4 shadow-xl">
          <h2 className="text-base font-bold flex items-center gap-2">
            <span>⚙️</span> Preferences & Appearance
          </h2>
          <p className="text-xs text-muted-foreground">
            Choose your preferred theme. Changes are instantly saved to your
            account profile.
          </p>

          <div className="grid grid-cols-3 gap-3 pt-2">
            <button
              onClick={() => setTheme('light')}
              className={`p-4 rounded-2xl border text-left transition flex flex-col gap-2 cursor-pointer ${
                theme === 'light'
                  ? 'bg-blue-600/10 border-blue-500 text-blue-400 font-semibold'
                  : 'bg-muted/50 border-muted hover:border-muted-foreground text-muted-foreground hover:text-foreground'
              }`}
            >
              <span className="text-xl">☀️</span>
              <div>
                <p className="text-sm font-bold">Light</p>
                <p className="text-[10px] opacity-80">Clean bright look</p>
              </div>
            </button>

            <button
              onClick={() => setTheme('dark')}
              className={`p-4 rounded-2xl border text-left transition flex flex-col gap-2 cursor-pointer ${
                theme === 'dark'
                  ? 'bg-blue-600/10 border-blue-500 text-blue-400 font-semibold'
                  : 'bg-muted/50 border-muted hover:border-muted-foreground text-muted-foreground hover:text-foreground'
              }`}
            >
              <span className="text-xl">🌙</span>
              <div>
                <p className="text-sm font-bold">Dark</p>
                <p className="text-[10px] opacity-80">Easy on the eyes</p>
              </div>
            </button>
          </div>
        </div>

        {/* Tickets Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <span>🎟</span> My Digital Tickets ({tickets.length})
            </h2>
          </div>

          {tickets.length === 0 ? (
            <div className="bg-card/50 border border-muted rounded-3xl p-12 text-center space-y-3">
              <div className="text-4xl">🎫</div>
              <h3 className="text-base font-bold">
                No tickets in your account yet
              </h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Complete a checkout simulation to securely save tickets to your
                Firestore database.
              </p>
              <div className="pt-2">
                <Link
                  href="/"
                  className="inline-block bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-2.5 rounded-xl transition text-xs"
                >
                  Explore Events
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {tickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="bg-card border border-muted rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-muted-foreground transition shadow-md"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={ticket.image || 'https://via.placeholder.com/150'}
                      alt={ticket.eventName}
                      className="w-16 h-16 rounded-xl object-cover border border-muted"
                    />
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded">
                        Confirmed Pass
                      </span>
                      <h3 className="text-base font-bold">
                        {ticket.eventName}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        📅{' '}
                        {ticket.eventDate
                          ? new Date(ticket.eventDate).toLocaleDateString(
                              'en-US',
                              {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              },
                            )
                          : 'Date TBA'}{' '}
                        • 📍 {ticket.venueName}, {ticket.city}
                      </p>
                    </div>
                  </div>
                  <Link
                    href={`/tickets/${ticket.eventId}?session_id=${ticket.sessionId}`}
                    className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white font-bold px-5 py-2.5 rounded-xl transition text-xs text-center shadow-lg shadow-blue-600/20"
                  >
                    View Digital Pass →
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
