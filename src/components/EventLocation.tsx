'use client';

import { useState } from 'react';
import VenueModal from '@/components/VenueModal';

interface EventLocationProps {
  venueName?: string;
  cityName?: string;
  stateName?: string;
  className?: string;
  showIcon?: boolean;
}

export default function EventLocation({
  venueName,
  cityName,
  stateName,
  className = '',
  showIcon = true,
}: EventLocationProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const locationParts = [venueName, cityName, stateName].filter(Boolean);
  const locationString = locationParts.join(', ');

  if (!locationString) return null;

  return (
    <>
      {showIcon && <span className="text-[11px]">📍</span>}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsModalOpen(true);
        }}
        className={`inline-flex items-center gap-1.5 text-xs text-indigo-400 font-semibold hover:text-foreground hover:underline transition cursor-pointer text-left focus:outline-none ${className}`}
        aria-label={`View venue details for ${locationString}`}
      >
        <span className="truncate">{locationString}</span>
      </button>

      <VenueModal
        location={locationString}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
