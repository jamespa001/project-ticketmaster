'use client';

import { useState, useEffect, use, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import EventLocation from '@/components/EventLocation';

interface EventDetail {
  id: string;
  name: string;
  images?: { url: string }[];
  dates?: {
    start?: {
      localDate?: string;
      localTime?: string;
    };
  };
  _embedded?: {
    venues?: {
      name: string;
      city?: { name: string };
      state?: { name: string };
    }[];
  };
}

function TicketConfirmationContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const searchParams = useSearchParams();
  const sessionId =
    searchParams.get('session_id') || 'cs_test_mock_session_12345';
  const { user } = useAuth();

  const [event, setEvent] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const [timeLeft, setTimeLeft] = useState(8);
  const [barcodePattern, setBarcodePattern] = useState<number[]>([
    2, 1, 4, 1, 3, 2, 1, 1, 4, 2, 3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 2, 1, 4,
    2,
  ]);

  // Countdown timer for SafeTix barcode
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setBarcodePattern((prevPattern) => {
            const newPattern = [...prevPattern];
            const first = newPattern.shift()!;
            newPattern.push(first);
            newPattern[3] = Math.floor(Math.random() * 4) + 1;
            newPattern[12] = Math.floor(Math.random() * 4) + 1;
            newPattern[18] = Math.floor(Math.random() * 4) + 1;
            return newPattern;
          });
          return 8;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch event and save ticket to Firestore
  useEffect(() => {
    async function fetchEvent() {
      try {
        const res = await fetch(`/api/events/${id}`);
        const data = await res.json();
        setEvent(data);

        // Save ticket to Firestore if user is logged in
        if (user && data) {
          const venue = data._embedded?.venues?.[0];
          const ticketRef = doc(
            db,
            'tickets',
            `${user.uid}_${id}_${sessionId}`,
          );
          await setDoc(
            ticketRef,
            {
              userId: user.uid,
              eventId: id,
              eventName: data.name,
              eventDate: data.dates?.start?.localDate || '',
              eventTime: data.dates?.start?.localTime || '',
              venueName: venue?.name || 'Venue TBA',
              city: venue?.city?.name || '',
              image: data.images?.[0]?.url || '',
              sessionId,
              purchasedAt: new Date().toISOString(),
            },
            { merge: true },
          );
        }
      } catch (err) {
        console.error('Failed to fetch event or save ticket:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchEvent();
  }, [id, user, sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  const venue = event?._embedded?.venues?.[0];
  const imageUrl =
    event?.images?.[0]?.url || 'https://via.placeholder.com/300x300?text=Event';

  return (
    <main className="min-h-screen bg-background text-foreground pb-20">
      {/* Top Navigation */}
      <div className="bg-card border-b border-border px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="text-xs text-muted-foreground hover:text-foreground transition flex items-center gap-1"
          >
            ← Back to Home
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              SafeTix Active
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 mt-8 space-y-6">
        {/* Success Banner */}
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-2xl shrink-0">
            ✓
          </div>
          <div>
            <h1 className="text-lg font-bold text-emerald-300">
              Tickets Confirmed & Secured!
            </h1>
            <p className="text-xs text-emerald-400/80 mt-0.5">
              Saved to your profile. Hold this live digital pass near the
              turnstile scanner for entry.
            </p>
          </div>
        </div>

        {/* Digital Ticket Pass Card */}
        <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-2xl">
          <div className="p-6 md:p-8 border-b border-border flex flex-col md:flex-row items-start md:items-center gap-6 bg-gradient-to-br from-card to-background">
            <img
              src={imageUrl}
              alt={event?.name}
              className="w-24 h-24 rounded-2xl object-cover border border-border shadow-md"
            />
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2.5 py-0.5 rounded-md">
                Mobile Entry Ticket
              </span>
              <h2 className="text-xl md:text-2xl font-black text-foreground">
                {event?.name}
              </h2>
              <p className="text-xs text-muted-foreground font-medium">
                📅{' '}
                {event?.dates?.start?.localDate
                  ? new Date(event.dates.start.localDate).toLocaleDateString(
                      'en-US',
                      {
                        weekday: 'long',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      },
                    )
                  : 'Date TBA'}
                {event?.dates?.start?.localTime
                  ? ` • ${event.dates.start.localTime}`
                  : ''}
              </p>
              {/* <p className="text-xs text-indigo-400 font-semibold">
                📍 {venue?.name || 'Venue TBA'}, {venue?.city?.name || ''}
                {venue?.state?.name ? `, ${venue.state.name}` : ''}
              </p> */}
              <div className="mt-0.5">
                <EventLocation
                  venueName={venue?.name}
                  cityName={venue?.city?.name}
                  stateName={venue?.state?.name}
                />{' '}
              </div>
            </div>
          </div>

          <div className="p-6 md:p-8 grid grid-cols-2 md:grid-cols-4 gap-4 bg-muted/40 border-b border-border">
            <div>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">
                Section
              </span>
              <span className="text-sm font-bold text-foreground mt-0.5 block">
                Section 101
              </span>
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">
                Row / Seat
              </span>
              <span className="text-sm font-bold text-foreground mt-0.5 block">
                Row A, Seats 4-5
              </span>
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">
                Ticket Type
              </span>
              <span className="text-sm font-bold text-emerald-400 mt-0.5 block">
                Verified Resale
              </span>
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">
                Holder
              </span>
              <span className="text-sm font-bold text-foreground mt-0.5 block truncate">
                {user?.email || 'Guest User'}
              </span>
            </div>
          </div>

          {/* Live SafeTix Barcode */}
          <div className="p-8 flex flex-col items-center justify-center bg-card text-center space-y-4 relative overflow-hidden">
            <div className="flex items-center justify-between w-full max-w-sm px-2 text-xs font-mono text-muted-foreground">
              <span className="text-indigo-400 font-semibold flex items-center gap-1">
                🛡️ SafeTix Active
              </span>
              <span>
                Refreshes in{' '}
                <strong className="text-foreground font-mono">
                  {timeLeft}s
                </strong>
              </span>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-inner border border-border relative overflow-hidden group w-full max-w-sm">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent shadow-[0_0_15px_#6366f1] z-10 opacity-90 animate-pulse pointer-events-none"></div>

              <div className="h-28 flex items-stretch justify-between gap-0.5 bg-white px-2 overflow-hidden">
                {barcodePattern.map((widthWeight, i) => (
                  <div
                    key={i}
                    style={{ flex: widthWeight }}
                    className={`transition-all duration-500 ${i % 2 === 0 ? 'bg-black' : 'bg-white'}`}
                  />
                ))}
              </div>

              <div className="mt-3 text-center font-mono text-xs tracking-widest text-gray-800 font-bold">
                |||*|*||||*||*|*|||||*||*|*||||*|*||
              </div>
            </div>

            <p className="text-xs text-muted-foreground font-mono">
              Hold near venue reader • Screenshots not supported
            </p>
            <span className="text-[10px] text-muted-foreground font-mono bg-background px-3 py-1 rounded-full border border-border">
              Order Ref: {sessionId.slice(0, 24)}...
            </span>
          </div>

          <div className="p-6 bg-background border-t border-border flex flex-col sm:flex-row gap-3">
            <button
              onClick={() =>
                alert('Simulated: Pass added to Apple Wallet / Google Pay!')
              }
              className="flex-1 bg-muted hover:bg-muted/80 text-foreground font-medium py-3 rounded-xl transition text-xs flex items-center justify-center gap-2 cursor-not-allowed shadow-md"
            >
              <span>📱</span> Add to Digital Wallet
            </button>
            <Link
              href="/profile"
              className="flex-1 bg-muted hover:bg-muted/80 text-foreground font-medium py-3 rounded-xl transition text-xs flex items-center justify-center gap-2 text-center shadow-md"
            >
              <span>👤</span> View My Profile
            </Link>
            <Link
              href="/"
              className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition text-xs flex items-center justify-center gap-2 text-center shadow-md shadow-indigo-600/20"
            >
              Done
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function TicketConfirmationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"></div>
        </div>
      }
    >
      <TicketConfirmationContent params={params} />
    </Suspense>
  );
}
