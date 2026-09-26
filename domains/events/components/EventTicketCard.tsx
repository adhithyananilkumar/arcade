'use client';

import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { Loader2, TicketX } from 'lucide-react';
import type { MyEventTicket } from '../types/events.types';

/**
 * A holder's ticket, with the QR they are admitted by.
 *
 * The QR is rendered to a canvas in the browser and never leaves it. `qrPayload` is a bearer
 * credential — anyone holding the string can be admitted as this person — so it is deliberately
 * never rendered as text, never put in a URL, and never logged. The short code beside it is safe
 * to read aloud precisely because it is not a secret: admitting by code alone requires an
 * authenticated staff member at the other end.
 */
export interface EventTicketCardProps {
  ticket: MyEventTicket;
  className?: string;
}

export function EventTicketCard({ ticket, className }: EventTicketCardProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [qrError, setQrError] = useState<string | null>(null);
  const [rendering, setRendering] = useState(true);

  const admissible = ticket.status === 'ISSUED' || ticket.status === 'CHECKED_IN';

  useEffect(() => {
    if (!admissible || !canvasRef.current) {
      setRendering(false);
      return;
    }

    let cancelled = false;
    setRendering(true);
    QRCode.toCanvas(canvasRef.current, ticket.qrPayload, {
      width: 220,
      margin: 1,
      errorCorrectionLevel: 'M',
    })
      .then(() => {
        if (!cancelled) {
          setQrError(null);
          setRendering(false);
        }
      })
      .catch(() => {
        // The code below still admits them, so this is a degraded state rather than a dead end.
        if (!cancelled) {
          setQrError('Could not draw the QR code. Show the code below at the door instead.');
          setRendering(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [ticket.qrPayload, admissible]);

  return (
    <div
      className={`rounded-xl border border-border bg-card p-6 shadow-sm ${className ?? ''}`}
      data-testid="event-ticket-card"
    >
      <div className="mb-4">
        <p className="text-sm text-muted-foreground">Ticket</p>
        <h3 className="text-lg font-semibold">{ticket.eventTitle ?? 'Event'}</h3>
      </div>

      {admissible ? (
        <div className="flex flex-col items-center gap-3">
          <div className="relative rounded-lg bg-white p-3">
            <canvas ref={canvasRef} aria-label="Ticket QR code" />
            {rendering && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            )}
          </div>
          {qrError && <p className="text-center text-sm text-amber-600">{qrError}</p>}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 rounded-lg bg-muted/40 py-8">
          <TicketX className="h-6 w-6 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">{describeStatus(ticket)}</p>
        </div>
      )}

      <div className="mt-5 text-center">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">Ticket code</p>
        <p className="font-mono text-lg tracking-widest">{ticket.code}</p>
      </div>
    </div>
  );
}

/**
 * Why this ticket cannot be used yet.
 *
 * Each state gets its own sentence because the remedies differ: a held seat needs confirming, an
 * expired one needs re-requesting, and a cancelled one is gone. A single "invalid ticket" would
 * send all three to the same dead end.
 */
function describeStatus(ticket: MyEventTicket): string {
  switch (ticket.status) {
    case 'HELD':
      return ticket.holdExpiresAt
        ? `Seat reserved until ${new Date(ticket.holdExpiresAt).toLocaleString()}. It is not valid for entry until confirmed.`
        : 'Seat reserved. Not valid for entry until confirmed.';
    case 'EXPIRED':
      return 'This reservation expired before it was confirmed.';
    case 'CANCELLED':
      return 'This ticket was cancelled.';
    default:
      return 'This ticket is not valid for entry.';
  }
}
