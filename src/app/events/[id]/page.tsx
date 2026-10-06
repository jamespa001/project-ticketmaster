'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import EventLocation from '@/components/EventLocation';
import AuthModal from '@/components/AuthModal';

interface EventDetail {
  id: string;
  name: string;
  url: string;
  images?: { url: string }[];
  dates?: {
    start?: {
      localDate?: string;
      localTime?: string;
    };
  };
  classifications?: {
    segment?: { name: string };
    genre?: { name: string };
  }[];
  priceRanges?: {
    type: string;
    min: number;
    max: number;
    currency: string;
  }[];
  pleaseNote?: string;
  accessibility?: { info?: string };
  _embedded?: {
    venues?: {
      name: string;
      city?: { name: string };
      state?: { name: string };
    }[];
  };
}

export default function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { user } = useAuth();
  const router = useRouter();

  const [event, setEvent] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSection, setSelectedSection] = useState<{
    name: string;
    price: number;
    category: string;
  } | null>(null);
  const [ticketCount, setTicketCount] = useState<number>(1);
  const [error, setError] = useState('');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  useEffect(() => {
    async function fetchEventDetails() {
      try {
        const res = await fetch(`/api/events/${id}`);
        const data = await res.json();
        setEvent(data);
      } catch (err) {
        console.error('Failed to fetch event details:', err);
        setError('Could not load event details.');
      } finally {
        setLoading(false);
      }
    }
    fetchEventDetails();
  }, [id]);

  // 1. Get real price range from API if available
  const priceRange = event?.priceRanges?.[0];
  let rawMin = priceRange?.min;
  let rawMax = priceRange?.max;

  // 2. Fallback: If API omits priceRanges, generate a deterministic unique price range per event ID
  if (rawMin === undefined || rawMax === undefined) {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = (hash << 5) - hash + id.charCodeAt(i);
      hash |= 0;
    }
    const positiveHash = Math.abs(hash);
    rawMin = 29 + (positiveHash % 45); // Min between $29 and $73
    rawMax = rawMin + 50 + ((positiveHash / 100) % 140); // Max scaled dynamically
  }

  const spread = rawMax - rawMin;

  // Dynamically calculate tier prices across the price spectrum
  const goldPrice = Number(rawMax.toFixed(2));
  const platinumPrice = Number((rawMin + spread * 0.65).toFixed(2));
  const generalPrice = Number((rawMin + spread * 0.25).toFixed(2));
  const adaPrice = generalPrice;

  // Categorized Ticket Tiers powered by live or dynamic pricing
  const ticketCategories = [
    {
      categoryName: 'Gold / VIP',
      description:
        'Exclusive front-row seating with premium unobstructed views.',
      sections: [
        {
          id: 'sec-101',
          name: 'Section 101 (Rows A-D)',
          price: goldPrice,
          availableCount: 12,
        },
        {
          id: 'sec-102',
          name: 'Section 102 (Center Floor)',
          price: Number((goldPrice * 0.95).toFixed(2)),
          availableCount: 8,
        },
      ],
    },
    {
      categoryName: 'Platinum',
      description:
        'Mid-level elevated sections with phenomenal acoustics and sightlines.',
      sections: [
        {
          id: 'sec-201',
          name: 'Section 201 (Lower Balcony)',
          price: platinumPrice,
          availableCount: 24,
        },
        {
          id: 'sec-202',
          name: 'Section 202 (Mezzanine Center)',
          price: Number((platinumPrice * 0.9).toFixed(2)),
          availableCount: 19,
        },
      ],
    },
    {
      categoryName: 'General Admission',
      description:
        'Standard seating offering great value and overall atmosphere.',
      sections: [
        {
          id: 'sec-301',
          name: 'Section 301 (Upper Bowl)',
          price: generalPrice,
          availableCount: 45,
        },
        {
          id: 'sec-302',
          name: 'Section 302 (Rear Balcony)',
          price: Number((generalPrice * 0.9).toFixed(2)),
          availableCount: 60,
        },
      ],
    },
    {
      categoryName: 'Accessible Tickets',
      description: 'ADA compliant wheelchair platforms and companion seating.',
      sections: [
        {
          id: 'sec-ada-1',
          name: 'Accessible Platform North',
          price: adaPrice,
          availableCount: 6,
        },
        {
          id: 'sec-ada-2',
          name: 'Accessible Platform South',
          price: adaPrice,
          availableCount: 4,
        },
      ],
    },
  ];

  // Set default selected section when event loads
  useEffect(() => {
    if (
      ticketCategories.length > 0 &&
      ticketCategories[0].sections.length > 0
    ) {
      const defaultSec = ticketCategories[0].sections[0];
      setSelectedSection({
        name: defaultSec.name,
        price: defaultSec.price,
        category: ticketCategories[0].categoryName,
      });
    }
  }, [goldPrice]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-2xl font-bold mb-2">Event Not Found</h2>
        <p className="text-muted-foreground mb-6">
          {error || 'This event could not be retrieved.'}
        </p>
        <Link
          href="/"
          className="bg-primary text-primary-foreground px-6 py-2.5 rounded-lg font-medium hover:bg-primary/90 transition"
        >
          Back to Search
        </Link>
      </div>
    );
  }

  const venue = event._embedded?.venues?.[0];
  const imageUrl =
    event.images?.[0]?.url || 'https://via.placeholder.com/300x300?text=Event';
  const segmentName = event.classifications?.[0]?.segment?.name || 'Concerts';
  const genreName = event.classifications?.[0]?.genre?.name || 'Live Event';
  const currentPrice = selectedSection ? selectedSection.price : generalPrice;

  const handleCheckoutClick = () => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    const section = selectedSection?.name || 'General Admission';
    const price = currentPrice;
    router.push(
      `/events/${id}/checkout?section=${encodeURIComponent(section)}&price=${price}&qty=${ticketCount}`,
    );
  };

  return (
    <main className="min-h-screen bg-background text-foreground pb-20">
      {/* Exact Ticketmaster Header Banner */}
      <div className="bg-card text-card-foreground border-b border-border px-6 py-4">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
            <Link href="/" className="hover:text-foreground transition">
              Home
            </Link>
            <span>/</span>
            <span>{segmentName}</span>
            <span>/</span>
            <span>{genreName}</span>
            <span>/</span>
            <span className="text-primary truncate max-w-xs">{event.name}</span>
          </div>

          {/* Event Header Card */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <img
                src={imageUrl}
                alt={event.name}
                className="w-24 h-24 md:w-28 md:h-28 rounded-lg object-cover border border-border shadow-md"
              />
              <div>
                <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                  <h1 className="text-xl md:text-2xl font-extrabold text-foreground">
                    {event.name}
                  </h1>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-muted hover:bg-muted/80 text-foreground border border-border px-3 py-1 rounded-full font-medium transition cursor-not-allowed flex items-center gap-1">
                      ℹ More Info
                    </span>
                    <span className="text-xs bg-muted hover:bg-muted/80 text-foreground border border-border px-3 py-1 rounded-full font-medium transition cursor-not-allowed flex items-center gap-1">
                      ♿ Accessible Tickets
                    </span>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground font-medium">
                  {event.dates?.start?.localDate
                    ? new Date(event.dates.start.localDate).toLocaleDateString(
                        'en-US',
                        {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        },
                      )
                    : ''}
                  {event.dates?.start?.localTime
                    ? ` • ${event.dates.start.localTime}`
                    : ''}
                </p>

                <div className="mt-0.5">
                  <EventLocation
                    venueName={venue?.name}
                    cityName={venue?.city?.name}
                    stateName={venue?.state?.name}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Important Info Alert Banner */}
      <div className="bg-amber-500/10 border-y border-amber-500/20 px-6 py-2.5 text-xs text-amber-800 dark:text-amber-300">
        <div className="max-w-7xl mx-auto flex items-center gap-2">
          <span className="font-bold uppercase tracking-wider">
            Important Info:
          </span>
          <span>
            {event.pleaseNote ||
              'This event has standard mobile entry. Tickets will be available in your account 48 hours prior to showtime.'}
          </span>
        </div>
      </div>

      {/* Main Content: Tiered Section List (Left) & Checkout Box (Right) */}
      <div className="max-w-7xl mx-auto px-6 mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Categorized Ticket Lists */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card text-card-foreground border border-border rounded-2xl p-6 shadow-xl">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-bold text-foreground">
                Select Your Tickets
              </h2>
              <span className="text-xs text-muted-foreground font-mono">
                Price Spectrum: ${rawMin.toFixed(2)} –${rawMax.toFixed(2)}{' '}
                {priceRange?.currency || 'USD'}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mb-6">
              Choose from available price levels and seating categories below.
            </p>

            <div className="space-y-6">
              {ticketCategories.map((category) => (
                <div
                  key={category.categoryName}
                  className="border border-border rounded-xl bg-muted/30 p-5"
                >
                  <div className="flex justify-between items-start mb-3 pb-3 border-b border-border">
                    <div>
                      <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-primary"></span>
                        {category.categoryName}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {category.description}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    {category.sections.map((sec) => {
                      const isSelected = selectedSection?.name === sec.name;
                      return (
                        <div
                          key={sec.id}
                          onClick={() =>
                            setSelectedSection({
                              name: sec.name,
                              price: sec.price,
                              category: category.categoryName,
                            })
                          }
                          className={`p-4 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                            isSelected
                              ? 'bg-primary/10 border-primary text-foreground shadow-md'
                              : 'bg-card border-border text-card-foreground hover:border-border hover:bg-muted/50'
                          }`}
                        >
                          <div>
                            <h4 className="font-bold text-sm text-foreground">
                              {sec.name}
                            </h4>
                            <span className="text-[11px] text-muted-foreground">
                              {sec.availableCount} tickets available
                            </span>
                          </div>
                          <div className="text-right flex items-center gap-4">
                            <span className="text-lg font-black text-primary">
                              ${sec.price.toFixed(2)}
                            </span>
                            <div
                              className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                                isSelected
                                  ? 'bg-primary border-primary text-primary-foreground'
                                  : 'border-border'
                              }`}
                            >
                              {isSelected && <span className="text-xs">✓</span>}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary / Checkout Box */}
        <div className="lg:col-span-1">
          <div className="bg-card text-card-foreground border border-border rounded-2xl p-6 shadow-2xl sticky top-24">
            <h3 className="text-lg font-bold text-foreground mb-4">
              Order Summary
            </h3>

            <div className="mb-4 pb-4 border-b border-border">
              <span className="text-xs text-muted-foreground uppercase tracking-wider block mb-1">
                Selected Section
              </span>
              <p className="text-sm font-bold text-foreground">
                {selectedSection?.name || 'Please select a section'}
              </p>
              <p className="text-xs text-primary mt-0.5">
                ${currentPrice.toFixed(2)} per ticket
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-xs font-semibold text-muted-foreground uppercase mb-2">
                Ticket Quantity
              </label>
              <select
                value={ticketCount}
                onChange={(e) => setTicketCount(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary text-foreground text-sm"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                  <option key={num} value={num}>
                    {num} {num === 1 ? 'Ticket' : 'Tickets'}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-between items-center mb-6 pt-4 border-t border-border">
              <span className="font-bold text-foreground">Total Price</span>
              <span className="text-2xl font-black text-primary">
                ${(currentPrice * ticketCount).toFixed(2)}
              </span>
            </div>

            <button
              onClick={handleCheckoutClick}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 rounded-xl transition shadow-lg cursor-pointer"
            >
              {user ? 'Proceed to Checkout' : 'Sign In to Buy Tickets'}
            </button>

            {!user && (
              <p className="text-xs text-center text-muted-foreground mt-3">
                Sign in required to secure your tickets.
              </p>
            )}
          </div>
        </div>

        {/* Authentication Modal */}
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
        />
      </div>
    </main>
  );
}
