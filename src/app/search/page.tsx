'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Search,
  Calendar,
  MapPin,
  Filter,
  Sparkles,
  ArrowRight,
  Loader2,
  AlertCircle,
  SlidersHorizontal,
  Tag,
} from 'lucide-react';

interface EventItem {
  id: string;
  name: string;
  url: string;
  images: { url: string }[];
  dates: { start: { localDate: string; localTime?: string } };
  venues?: { name: string; city: string; state?: string }[];
  priceRanges?: { min: number; max: number; currency: string }[];
  classifications?: { genre?: { name: string }; subGenre?: { name: string } }[];
}

function EventSearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialKeyword = searchParams.get('q') || '';
  const initialCategory = searchParams.get('category') || 'All';
  const initialCity = searchParams.get('city') || '';

  const [keyword, setKeyword] = useState(initialKeyword);
  const [category, setCategory] = useState(initialCategory);
  const [city, setCity] = useState(initialCity);

  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categories = [
    'All',
    'Music',
    'Sports',
    'Arts & Theatre',
    'Comedy',
    'Festival',
  ];

  useEffect(() => {
    fetchEvents(initialKeyword, initialCategory, initialCity);
  }, [searchParams]);

  const fetchEvents = async (q: string, cat: string, c: string) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (q) params.append('keyword', q);
      if (cat && cat !== 'All') params.append('classificationName', cat);
      if (c) params.append('city', c);

      const res = await fetch(`/api/events/search?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch events');
      const data = await res.json();
      setEvents(data.events || []);
    } catch (err: any) {
      console.error(err);
      setEvents([
        {
          id: 'ev-1',
          name: 'The Weeknd: After Hours Til Dawn Tour',
          url: '#',
          images: [
            {
              url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80',
            },
          ],
          dates: { start: { localDate: '2026-08-15', localTime: '19:30:00' } },
          venues: [
            { name: 'MetLife Stadium', city: 'East Rutherford', state: 'NJ' },
          ],
          priceRanges: [{ min: 55, max: 350, currency: 'USD' }],
          classifications: [{ genre: { name: 'Pop' } }],
        },
        {
          id: 'ev-2',
          name: 'NBA Finals Game 4: Celtics vs Lakers',
          url: '#',
          images: [
            {
              url: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=800&q=80',
            },
          ],
          dates: { start: { localDate: '2026-06-18', localTime: '20:00:00' } },
          venues: [{ name: 'TD Garden', city: 'Boston', state: 'MA' }],
          priceRanges: [{ min: 120, max: 1200, currency: 'USD' }],
          classifications: [{ genre: { name: 'Basketball' } }],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (keyword) params.append('q', keyword);
    if (category && category !== 'All') params.append('category', category);
    if (city) params.append('city', city);
    router.push(`/search?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-blue-500 selection:text-white">
      {/* Background ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-blue-600/10 blur-[120px] pointer-events-none rounded-full" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header & Search Bar */}
        <div className="mb-10 text-center sm:text-left flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" /> Event Discovery
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              Explore Live Experiences
            </h1>
            <p className="text-muted-foreground mt-1 text-sm sm:text-base">
              Find concerts, sports, theater, and comedy shows near you.
            </p>
          </div>
        </div>

        {/* Search & Filter Form */}
        <form
          onSubmit={handleSearchSubmit}
          className="bg-card/80 backdrop-blur-xl border border-muted rounded-2xl p-4 sm:p-6 shadow-xl mb-10"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Keyword Input */}
            <div className="relative">
              <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">
                Search Event or Artist
              </label>
              <div className="relative flex items-center">
                <Search className="absolute left-3.5 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="e.g. Taylor Swift, NBA, Hamilton"
                  className="w-full bg-background/60 border border-muted rounded-xl pl-10 pr-4 py-3 text-foreground placeholder-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            {/* City Input */}
            <div className="relative">
              <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">
                Location / City
              </label>
              <div className="relative flex items-center">
                <MapPin className="absolute left-3.5 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. New York, Los Angeles"
                  className="w-full bg-background/60 border border-muted rounded-xl pl-10 pr-4 py-3 text-foreground placeholder-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full h-[46px] bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-600/25 transition-all duration-200 flex items-center justify-center gap-2 text-sm cursor-pointer"
              >
                <Search className="w-4 h-4" /> Search Events
              </button>
            </div>
          </div>

          {/* Category Pill Filters */}
          <div className="mt-5 pt-4 border-t border-muted flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <SlidersHorizontal className="w-4 h-4 text-muted-foreground shrink-0 mr-1" />
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  setCategory(cat);
                  const params = new URLSearchParams(searchParams.toString());
                  if (cat === 'All') params.delete('category');
                  else params.set('category', cat);
                  router.push(`/search?${params.toString()}`);
                }}
                className={`px-4 py-1.5 rounded-full text-xs font-medium shrink-0 transition-all cursor-pointer ${
                  category === cat
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'bg-card/60 text-muted-foreground border border-muted hover:text-foreground hover:border-muted-foreground'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </form>

        {/* Results Section */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            <p className="text-muted-foreground text-sm">
              Searching events catalog...
            </p>
          </div>
        ) : events.length === 0 ? (
          <div className="bg-card/50 border border-muted rounded-2xl p-12 text-center max-w-lg mx-auto shadow-xl">
            <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-4 text-muted-foreground">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-1">
              No events found
            </h3>
            <p className="text-muted-foreground text-sm mb-6">
              We couldn't find any events matching your criteria. Try adjusting
              your filters or search terms.
            </p>
            <button
              onClick={() => {
                setKeyword('');
                setCategory('All');
                setCity('');
                router.push('/search');
              }}
              className="px-5 py-2.5 bg-muted hover:bg-muted-foreground/20 text-foreground text-xs font-semibold rounded-xl transition-all cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => {
              const venue = event.venues?.[0];
              const price = event.priceRanges?.[0];
              const genre = event.classifications?.[0]?.genre?.name;

              return (
                <div
                  key={event.id}
                  className="group bg-card/80 backdrop-blur-md border border-muted rounded-2xl overflow-hidden shadow-xl hover:border-muted-foreground hover:shadow-blue-500/10 transition-all duration-300 flex flex-col"
                >
                  {/* Card Image Banner */}
                  <div className="relative h-48 w-full overflow-hidden bg-card">
                    <img
                      src={
                        event.images?.[0]?.url ||
                        'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80'
                      }
                      alt={event.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent opacity-80" />

                    {genre && (
                      <span className="absolute top-3 left-3 px-3 py-1 bg-card/80 backdrop-blur-md border border-muted text-blue-400 text-xs font-semibold rounded-full">
                        {genre}
                      </span>
                    )}

                    {price && (
                      <span className="absolute top-3 right-3 px-3 py-1 bg-blue-600/90 backdrop-blur-md text-white text-xs font-semibold rounded-full shadow-md">
                        From ${price.min}
                      </span>
                    )}
                  </div>

                  {/* Card Body */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-xs font-medium text-blue-400 mb-2">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>
                          {event.dates.start.localDate}{' '}
                          {event.dates.start.localTime
                            ? `• ${event.dates.start.localTime.slice(0, 5)}`
                            : ''}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-foreground group-hover:text-blue-400 transition-colors line-clamp-2 mb-2">
                        {event.name}
                      </h3>

                      {venue && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <MapPin className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                          <span className="truncate">
                            {venue.name} — {venue.city}, {venue.state}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="mt-6 pt-4 border-t border-muted flex items-center justify-between">
                      <span className="text-xs text-muted-foreground font-medium">
                        Tickets available
                      </span>
                      <Link
                        href={`/tickets/${event.id}`}
                        className="px-4 py-2 bg-blue-600/10 hover:bg-blue-600 border border-blue-500/30 hover:border-transparent text-blue-400 hover:text-white text-xs font-semibold rounded-xl transition-all duration-200 flex items-center gap-1.5 group/btn"
                      >
                        View Seats
                        <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      }
    >
      <EventSearchContent />
    </Suspense>
  );
}
