import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const apiKey = process.env.TICKETMASTER_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: 'Ticketmaster API key is missing on the server.' },
      { status: 500 },
    );
  }

  const tmUrl = new URL(
    `https://app.ticketmaster.com/discovery/v2/events/${id}.json`,
  );
  tmUrl.searchParams.append('apikey', apiKey);

  try {
    const response = await fetch(tmUrl.toString());

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        {
          error: 'Failed to fetch event from Ticketmaster',
          details: errorData,
        },
        { status: response.status },
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
