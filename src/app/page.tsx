'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { EventCard, EventItem } from '@/components/EventCard';

const CATEGORIES = [
  { name: 'All Events', icon: '🔥', classification: '' },
  { name: 'Concerts', icon: '🎸', classification: 'Music' },
  { name: 'Sports', icon: '🏀', classification: 'Sports' },
  { name: 'Arts & Theater', icon: '🎭', classification: 'Arts & Theatre' },
  { name: 'Comedy', icon: '😂', classification: 'Comedy' },
];

function HomeContent() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category') || '';

  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Location state
  const [locationQuery, setLocationQuery] = useState('Tampa');
  const [inputValue, setInputValue] = useState('Tampa');
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);

  const isInitialMount = useRef(true);

  // Fetch events function
  const fetchEvents = async (
    keyword: string,
    category: string,
    loc: string,
  ) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('size', '12');
      params.set('sort', 'distance,asc');

      if (keyword.trim()) {
        params.set('keyword', keyword.trim());
      }

      if (category) {
        params.set('classificationName', category);
      }

      if (loc && loc.trim()) {
        params.set('city', loc.trim());
      }

      const res = await fetch(`/api/events?${params.toString()}`);
      const data = await res.json();
      setEvents(data._embedded?.events || data.events || []);
    } catch (err) {
      console.error('Failed to load events:', err);
    } finally {
      setLoading(false);
    }
  };

  // Initial load on mount
  useEffect(() => {
    const savedLocation = localStorage.getItem('tm_location') || 'Tampa';
    setLocationQuery(savedLocation);
    setInputValue(savedLocation);
    const initialCategory = categoryParam || '';
    setSelectedCategory(initialCategory);

    fetchEvents('', initialCategory, savedLocation);
    isInitialMount.current = false;
  }, []);

  // Sync when categoryParam changes from URL (e.g. header navigation)
  useEffect(() => {
    if (isInitialMount.current) return;
    const newCategory = categoryParam || '';
    if (newCategory !== selectedCategory) {
      setSelectedCategory(newCategory);
      fetchEvents(searchQuery, newCategory, locationQuery);
    }
  }, [categoryParam]);

  const handleCategoryClick = (classification: string) => {
    setSelectedCategory(classification);
    fetchEvents(searchQuery, classification, locationQuery);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    const city = inputValue.trim() || 'Tampa';

    setLocationQuery(city);
    localStorage.setItem('tm_location', city);
    fetchEvents(query, selectedCategory, city);
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300 pb-24">
      {/* Hero Search Section */}
      <section className="relative bg-gradient-to-b from-primary/10 via-background to-background pt-16 pb-20 px-6 border-b border-border">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-foreground">
            Find Your Next <span className="text-primary">Live Experience</span>
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
            Explore concerts, sports, theater, and world-class tours with
            verified tickets.
          </p>

          {/* Search Bar Form */}
          <form
            onSubmit={handleSearchSubmit}
            className="bg-card border border-border shadow-xl p-2 sm:p-3 rounded-2xl max-w-3xl mx-auto flex flex-col sm:flex-row items-center gap-2"
          >
            <div className="flex items-center gap-2 px-3 py-2 w-full sm:w-1/2 border-b sm:border-b-0 sm:border-r border-border">
              <span className="text-muted-foreground">🔍</span>
              <input
                type="text"
                placeholder="Search artist, team, event, or show..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none w-full"
              />
            </div>

            <div className="flex items-center gap-2 px-3 py-2 w-full sm:w-1/3">
              <span className="text-muted-foreground">📍</span>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Enter city (e.g. Tampa, Orlando)..."
                className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none w-full"
              />
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-6 py-3 rounded-xl transition cursor-pointer text-sm shadow-lg shadow-primary/25"
            >
              Search
            </button>
          </form>

          {/* Category Quick Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.name}
                type="button"
                onClick={() => handleCategoryClick(cat.classification)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer border ${
                  selectedCategory === cat.classification
                    ? 'bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20'
                    : 'bg-card text-muted-foreground border-border hover:bg-accent hover:text-accent-foreground'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.name}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content Feed */}
      <main className="max-w-7xl mx-auto px-6 mt-12 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-foreground">
              {selectedCategory
                ? `${selectedCategory === 'Arts & Theatre' ? 'Arts & Theater' : selectedCategory} Events`
                : 'Featured Events'}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {locationQuery
                ? `Showing events near ${locationQuery}`
                : 'Showing all available tour dates'}
            </p>
          </div>
          <span className="text-xs text-primary font-mono bg-primary/10 border border-primary/20 px-3 py-1 rounded-full">
            Live Inventory
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="bg-card border border-border rounded-2xl h-80 animate-pulse"
              />
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-20 bg-card border border-border rounded-3xl shadow-sm">
            <span className="text-4xl block mb-2">🏟</span>
            <h3 className="text-lg font-bold text-foreground">
              No events found
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Try typing another major metro city (e.g., Tampa, Orlando, Miami).
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  );
}
