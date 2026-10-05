'use client';

import React from 'react';

interface Venue {
  name?: string;
  address?: {
    line1?: string;
  };
  city?: {
    name?: string;
  };
  state?: {
    name?: string;
  };
  parkingDetail?: string;
  generalInfo?: {
    generalRule?: string;
  };
  boxOfficeInfo?: {
    openHours?: string;
  };
}

interface VenueModalProps {
  location: string;
  isOpen: boolean;
  onClose: () => void;
  venue?: Venue | null;
}

export default function VenueModal({
  location,
  isOpen,
  onClose,
  venue,
}: VenueModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="venue-modal-title"
        className="bg-card text-card-foreground border border-border rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl relative flex flex-col"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground text-lg font-bold w-8 h-8 rounded-full bg-muted flex items-center justify-center transition"
          aria-label="Close modal"
        >
          ✕
        </button>

        {/* Header Info */}
        <div className="mb-4 pr-8">
          <span className="text-xs bg-primary/10 text-primary border border-primary/20 px-3 py-1 rounded-full font-medium">
            Venue Information
          </span>
          <h2 className="text-xl font-bold text-foreground mt-8">Location</h2>
          <p className="text-sm text-muted-foreground mt-0.5">📍 {location}</p>
        </div>

        {/* Details Section */}
        <div className="space-y-4 text-sm text-muted-foreground border-t border-b border-border py-4 my-2">
          <div>
            <h4 className="font-semibold text-foreground mb-1">
              🚗 Parking & Transportation
            </h4>
            <p className="text-xs text-muted-foreground">
              {venue?.parkingDetail ||
                'On-site parking is available. Public transit drop-off zones are located near the main entrance.'}
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-1">
              🎒 Bag Policy
            </h4>
            <p className="text-xs text-muted-foreground">
              {venue?.generalInfo?.generalRule ||
                'Clear bags up to 12"x6"x12" or small clutch purses are permitted. All bags are subject to search.'}
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-1">
              🚪 Doors Open
            </h4>
            <p className="text-xs text-muted-foreground">
              {venue?.boxOfficeInfo?.openHours ||
                'Doors typically open 1 hour prior to the event start time.'}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-4">
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
              location,
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex-1 bg-primary text-indigo-400 font-bold hover:bg-primary/90 text-center py-2.5 rounded-xl transition text-sm flex items-center justify-center gap-2"
          >
            <span>🗺</span>
            <span className="group-hover:underline">Open in Google Maps</span>
          </a>
          <button
            onClick={onClose}
            className="px-5 bg-muted hover:bg-muted/80 text-foreground font-medium py-2.5 rounded-xl transition text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
