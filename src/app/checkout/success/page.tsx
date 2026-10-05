'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense, useEffect, useState } from 'react';

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const eventId = searchParams.get('event_id');

  const [isValidating, setIsValidating] = useState(true);
  const [verificationError, setVerificationError] = useState(false);

  useEffect(() => {
    async function verifySession() {
      if (!sessionId) {
        setIsValidating(false);
        return;
      }

      try {
        // Optional: Call your backend to verify the Stripe session status
        const res = await fetch(`/api/checkout/verify?session_id=${sessionId}`);
        if (!res.ok) {
          setVerificationError(true);
        }
      } catch (err) {
        console.error('Session verification failed:', err);
        // Depending on your webhook setup, you can choose whether to block or let through
      } finally {
        setIsValidating(false);
      }
    }

    verifySession();
  }, [sessionId]);

  if (isValidating) {
    return (
      <main className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-card border border-border rounded-3xl p-8 shadow-2xl text-center space-y-4">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500 mx-auto"></div>
          <p className="text-xs text-muted-foreground font-medium">
            Verifying your payment and securing tickets...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-card border border-border rounded-3xl p-8 shadow-2xl text-center space-y-6">
        {/* Success Icon */}
        <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto text-3xl shadow-lg">
          ✓
        </div>

        <div>
          <span className="text-xs font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full uppercase tracking-wider">
            Payment Successful
          </span>
          <h1 className="text-2xl font-black text-foreground mt-3">
            You&apos;re Going to the Show!
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Your payment has been securely processed via Stripe. Your digital
            tickets are ready in your account.
          </p>
        </div>

        {/* Session Badge */}
        {sessionId && (
          <div className="bg-muted border border-border rounded-xl p-3 text-left font-mono text-[11px] text-muted-foreground">
            <span className="text-muted-foreground/80 block">
              Stripe Session ID:
            </span>
            <span className="truncate block text-foreground mt-0.5">
              {sessionId}
            </span>
          </div>
        )}

        <div className="pt-2 space-y-3">
          {eventId && (
            <Link
              href={`/tickets/${eventId}?session_id=${sessionId || 'success'}`}
              className="w-full block text-center bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 rounded-xl transition shadow-lg shadow-primary/20 text-sm"
            >
              View Digital Tickets & Pass
            </Link>
          )}
          <Link
            href="/"
            className="w-full block text-center bg-secondary hover:bg-secondary/80 text-secondary-foreground font-medium py-3 rounded-xl transition text-sm"
          >
            Browse More Events
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500"></div>
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
