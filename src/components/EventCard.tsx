import Link from 'next/link';
import Image from 'next/image';

export interface EventItem {
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
  classifications?: {
    genre?: { name: string };
    segment?: { name: string };
  }[];
}

interface EventCardProps {
  event: EventItem;
}

export function EventCard({ event }: EventCardProps) {
  const venue = event._embedded?.venues?.[0];
  const imageUrl =
    event.images?.[0]?.url || 'https://via.placeholder.com/400x300?text=Event';

  return (
    <Link
      href={`/events/${event.id}`}
      className="bg-card border border-border hover:border-primary/50 shadow-md hover:shadow-xl rounded-2xl overflow-hidden transition group flex flex-col cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary"
    >
      <div className="relative h-48 overflow-hidden bg-muted">
        <Image
          src={imageUrl}
          alt={event?.name ?? 'Event image'}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition duration-500"
        />
        <div className="absolute top-3 right-3 bg-background/80 backdrop-blur-md border border-border text-[10px] font-bold px-2.5 py-1 rounded-full text-primary z-10">
          {event.classifications?.[0]?.genre?.name || 'Live Event'}
        </div>
      </div>

      <div className="p-5 flex flex-col flex-grow justify-between space-y-4">
        <div className="space-y-1.5">
          <p className="text-[11px] font-mono text-primary font-semibold flex items-center gap-1">
            <span aria-hidden="true">📅</span>{' '}
            {event.dates?.start?.localDate || 'Date TBA'}
          </p>
          <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition line-clamp-2">
            {event.name}
          </h3>
          <p className="text-xs text-muted-foreground line-clamp-1 flex items-center gap-1">
            <span aria-hidden="true">📍</span> {venue?.name || 'Venue TBA'},{' '}
            {venue?.city?.name || ''}
          </p>
        </div>

        <div className="pt-3 border-t border-border flex items-center justify-between text-xs font-bold text-primary group-hover:translate-x-1 transition">
          <span>View Tickets & Seats</span>
          <span aria-hidden="true">→</span>
        </div>
      </div>
    </Link>
  );
}
