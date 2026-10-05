import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock_key');

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { eventName, sectionName, price, quantity, eventId } = body;

    // Safely parse and validate numeric values to prevent NaN
    const numericPrice = Number(price);
    const numericQuantity = Number(quantity);

    if (isNaN(numericPrice) || numericPrice < 0) {
      return NextResponse.json(
        { error: 'Invalid or missing price parameter.' },
        { status: 400 },
      );
    }

    const validQuantity =
      isNaN(numericQuantity) || numericQuantity < 1 ? 1 : numericQuantity;

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${eventName || 'Event'} - ${sectionName || 'General Admission'}`,
              description: `Verified Resale Ticket (${validQuantity}x)`,
            },
            unit_amount: Math.round(numericPrice * 100), // Stripe expects cents as an integer
          },
          quantity: validQuantity,
        },
      ],
      mode: 'payment',
      success_url: `${request.headers.get('origin')}/tickets/${eventId}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.headers.get('origin')}/events/${eventId}`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error('Stripe Checkout Error:', err);
    return NextResponse.json(
      { error: err.message || 'Internal Server Error' },
      { status: 500 },
    );
  }
}
