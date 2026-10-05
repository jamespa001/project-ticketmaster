import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const keyword = searchParams.get('keyword');
  const city = searchParams.get('city');
  const classificationName = searchParams.get('classificationName');
  const attractionId = searchParams.get('attractionId');
  const venueId = searchParams.get('venueId');
  const page = searchParams.get('page') || '0';
  const size = searchParams.get('size') || '20';

  const apiKey = process.env.TICKETMASTER_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: 'Ticketmaster API key is missing on the server.' },
      { status: 500 },
    );
  }

  // Construct Ticketmaster Discovery API URL securely using URLSearchParams
  const tmUrl = new URL(
    'https://app.ticketmaster.com/discovery/v2/events.json',
  );
  tmUrl.searchParams.append('apikey', apiKey);
  tmUrl.searchParams.append('size', size);
  tmUrl.searchParams.append('page', page);

  if (keyword) tmUrl.searchParams.append('keyword', keyword);
  if (city) tmUrl.searchParams.append('city', city);
  if (classificationName)
    tmUrl.searchParams.append('classificationName', classificationName);
  if (attractionId) tmUrl.searchParams.append('attractionId', attractionId);
  if (venueId) tmUrl.searchParams.append('venueId', venueId);

  try {
    const response = await fetch(tmUrl.toString(), {
      // Optional: Add Next.js fetch caching revalidation if desired
      // next: { revalidate: 3600 }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        {
          error: 'Failed to fetch events from Ticketmaster',
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
