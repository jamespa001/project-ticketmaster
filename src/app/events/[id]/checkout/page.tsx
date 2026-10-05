'use client';

import { useState, useEffect, use, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
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

function CheckoutContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const sectionName = searchParams.get('section') || 'General Admission';
  const initialPrice = Number(searchParams.get('price')) || 75.0;
  const initialQty = Number(searchParams.get('qty')) || 1;

  const [event, setEvent] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState<number>(initialQty);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 5-minute reservation countdown timer (300 seconds)
  const [timeLeft, setTimeLeft] = useState(300);

  useEffect(() => {
    if (timeLeft <= 0) {
      alert('Your ticket reservation has expired. Returning to event page.');
      window.location.href = `/events/${id}`;
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, id]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Reset submitting state when returning via browser back button / bfcache
  useEffect(() => {
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        setIsSubmitting(false);
      }
    };
    window.addEventListener('pageshow', handlePageShow);
    const handleFocus = () => setIsSubmitting(false);
    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('pageshow', handlePageShow);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  useEffect(() => {
    async function fetchEvent() {
      if (!id || id === 'undefined') {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`/api/events/${id}`);
        const data = await res.json();
        setEvent(data);
      } catch (err) {
        console.error('Failed to fetch event:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchEvent();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  const venue = event?._embedded?.venues?.[0];
  const imageUrl =
    event?.images?.[0]?.url || 'https://via.placeholder.com/300x300?text=Event';

  // Financial calculations (15% service fee + flat delivery fee)
  const subtotal = initialPrice * quantity;
  const serviceFee = subtotal * 0.15;
  const deliveryFee = 5.0;
  const grandTotal = subtotal + serviceFee + deliveryFee;

  const handleCancel = () => {
    if (
      confirm(
        'Are you sure you want to cancel this order? Your selected seats will be released.',
      )
    ) {
      window.location.href = `/events/${id}`;
    }
  };

  const handleStripeCheckout = async () => {
    if (!user) {
      alert('Please sign in to complete your order.');
      return;
    }

    if (!id || id === 'undefined') {
      alert(
        'Error: Event ID is missing. Please return to the event page and try again.',
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventName: event?.name || 'Event Ticket',
          sectionName: sectionName,
          price: initialPrice,
          quantity: quantity,
          eventId: id,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(
          data.error || 'Failed to create Stripe Checkout session',
        );
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || 'Failed to initiate checkout.');
        setIsSubmitting(false);
      }
    } catch (err: any) {
      console.error('Checkout error:', err);
      alert(err.message || 'Something went wrong. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground pb-20">
      {/* Top Bar with Countdown Timer */}
      <div className="bg-card border-b border-border px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link
            href={`/events/${id}`}
            className="text-xs text-muted-foreground hover:text-foreground transition flex items-center gap-1"
          >
            ← Back to Event Seats
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full font-mono flex items-center gap-1.5 animate-pulse">
              ⏱️ Time remaining:{' '}
              <strong className="font-bold">{formatTime(timeLeft)}</strong>
            </span>
            <span className="text-xs font-mono bg-primary/10 text-primary border border-primary/20 px-3 py-1 rounded-full hidden sm:inline-block">
              Secure Checkout Review
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left 2 Cols: Order Summary & Event Info */}
        <div className="md:col-span-2 space-y-6">
          {/* Event Card */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-xl flex items-center gap-5">
            <img
              src={imageUrl}
              alt={event?.name || 'Event'}
              className="w-20 h-20 rounded-xl object-cover border border-border"
            />
            <div>
              <span className="text-[10px] text-primary uppercase font-bold tracking-wider">
                Verified Event
              </span>
              <h1 className="text-lg font-extrabold text-foreground mt-0.5">
                {event?.name || 'Loading Event...'}
              </h1>
              <p className="text-xs text-muted-foreground mt-1">
                📅 {event?.dates?.start?.localDate}{' '}
                {event?.dates?.start?.localTime
                  ? `• ${event.dates.start.localTime}`
                  : ''}
              </p>
              <div className="mt-0.5">
                <EventLocation
                  venueName={venue?.name}
                  cityName={venue?.city?.name}
                  stateName={venue?.state?.name}
                />{' '}
              </div>
            </div>
          </div>

          {/* Seats & Quantity Adjuster */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-xl">
            <h2 className="text-md font-bold text-foreground mb-4">
              Ticket Selection & Quantity
            </h2>

            <div className="bg-background border border-border rounded-xl p-4 flex items-center justify-between mb-6">
              <div>
                <span className="text-xs text-muted-foreground uppercase block">
                  Selected Section
                </span>
                <span className="text-sm font-bold text-foreground">
                  {sectionName}
                </span>
                <span className="block text-xs text-primary mt-0.5">
                  ${initialPrice.toFixed(2)} each
                </span>
              </div>

              {/* Quantity Counter +/- */}
              <div className="flex items-center gap-3 bg-card border border-border px-3 py-1.5 rounded-xl">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-7 h-7 rounded-lg bg-muted hover:bg-muted/80 text-foreground font-bold flex items-center justify-center transition cursor-pointer"
                >
                  -
                </button>
                <span className="font-bold text-sm w-4 text-center text-foreground">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(8, quantity + 1))}
                  className="w-7 h-7 rounded-lg bg-muted hover:bg-muted/80 text-foreground font-bold flex items-center justify-center transition cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            <div className="text-xs text-muted-foreground flex items-center gap-2 bg-primary/10 border border-primary/20 p-3 rounded-xl text-primary">
              <span>🎟️</span>
              <span>
                Tickets will be delivered instantly to your account digital
                wallet upon successful checkout.
              </span>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Price Breakdown & Action */}
        <div className="md:col-span-1">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-2xl sticky top-24 space-y-4">
            <h3 className="text-md font-bold text-foreground pb-3 border-b border-border">
              Payment Summary
            </h3>

            <div className="space-y-2 text-xs text-muted-foreground">
              <div className="flex justify-between">
                <span>Tickets ({quantity}x)</span>
                <span className="font-mono">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Service Fee (15%)</span>
                <span className="font-mono">${serviceFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span className="font-mono">${deliveryFee.toFixed(2)}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-border flex justify-between items-center">
              <span className="font-bold text-sm text-foreground">
                Total Due
              </span>
              <span className="text-xl font-black text-primary font-mono">
                ${grandTotal.toFixed(2)}
              </span>
            </div>

            <button
              onClick={handleStripeCheckout}
              disabled={isSubmitting}
              className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground font-bold py-3 rounded-xl transition shadow-lg shadow-primary/20 cursor-pointer flex items-center justify-center gap-2 mt-4 text-sm"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
                  <span>Connecting to Stripe...</span>
                </>
              ) : (
                <span>Proceed to Secure Payment 🔒</span>
              )}
            </button>

            <button
              onClick={handleCancel}
              disabled={isSubmitting}
              className="w-full bg-muted hover:bg-muted/80 disabled:opacity-50 text-muted-foreground font-semibold py-3 rounded-xl transition text-sm cursor-pointer mt-2"
            >
              Cancel Order
            </button>

            <p className="text-[10px] text-center text-muted-foreground mt-2">
              Encrypted 256-bit SSL Checkout powered by Stripe.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function CheckoutPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        </div>
      }
    >
      <CheckoutContent params={params} />
    </Suspense>
  );
}
