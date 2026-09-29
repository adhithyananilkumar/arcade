/**
 * ------------------------------------------------------------------
 * Arcade Frontend Architecture
 * Layer: Domains
 * Domain: Credentials
 *
 * The certificate as it looks, on screen: the same landscape A4 design the server prints to PDF
 * (backend `CertificateDocument`) — navy double frame, gold kicker and seal, the holder's name in
 * serif. Pure and presentational; it states nothing the certificate record does not.
 *
 * Sizes are in container units (cqw), so the face scales as one piece at any width — a thumbnail in
 * a list or the hero of the public page.
 * ------------------------------------------------------------------
 */

import { ARCADE_WORDMARK_PATHS, ARCADE_WORDMARK_VIEWBOX } from "../lib/arcadeWordmark";
import type { IssuedCertificate } from "../types/credential.types";

const NAVY = "#1A2238";
const GOLD = "#B08D3C";
const MUTED = "#5B6475";

export interface CertificateFaceProps {
  certificate: Pick<
    IssuedCertificate,
    | "credentialCode"
    | "documentTitle"
    | "sourceLabel"
    | "title"
    | "programme"
    | "recipientName"
    | "issuerName"
    | "issuerLogoUrl"
    | "scorePercent"
    | "passPercent"
    | "achievedAt"
    | "expiresAt"
    | "revoked"
  >;
  className?: string;
}

function pct(v: number) {
  return `${Number(v.toFixed(2))}%`;
}

function longDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" });
}

export function CertificateFace({ certificate: c, className }: CertificateFaceProps) {
  return (
    <div
      className={className}
      style={{ containerType: "inline-size", aspectRatio: "297 / 210", width: "100%" }}
      role="img"
      aria-label={`${c.documentTitle}: ${c.title}, awarded to ${c.recipientName} by ${c.issuerName}${c.revoked ? " (revoked)" : ""}`}
    >
      <div
        className="relative h-full w-full overflow-hidden bg-white"
        style={{ padding: "0.8cqw", border: `0.55cqw solid ${NAVY}`, color: NAVY }}
      >
        <div
          className="relative flex h-full w-full flex-col items-center text-center"
          style={{ border: `0.12cqw solid ${GOLD}`, padding: "3cqw 5.5cqw 2cqw" }}
        >
          {c.revoked && (
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 flex select-none items-center justify-center font-black"
              style={{ fontSize: "12cqw", color: "#F6D3CE", transform: "rotate(-24deg)" }}
            >
              REVOKED
            </span>
          )}

          <div className="relative flex w-full items-center justify-between" style={{ height: "5cqw" }}>
            <svg
              viewBox={`0 0 ${ARCADE_WORDMARK_VIEWBOX.width} ${ARCADE_WORDMARK_VIEWBOX.height}`}
              style={{ width: "13.5cqw", height: "3cqw" }}
              aria-hidden
            >
              {ARCADE_WORDMARK_PATHS.map((d, i) => (
                <path key={i} d={d} fill={NAVY} />
              ))}
            </svg>
            {c.issuerLogoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={c.issuerLogoUrl} alt="" style={{ maxHeight: "5cqw", maxWidth: "14cqw" }} className="object-contain" />
            )}
          </div>

          <p className="relative font-bold uppercase" style={{ marginTop: "1.4cqw", fontSize: "1.25cqw", letterSpacing: "0.38cqw", color: GOLD }}>
            {c.documentTitle}
          </p>
          <span className="relative block" style={{ width: "9cqw", height: "0.18cqw", background: GOLD, marginTop: "1cqw" }} />

          <p className="relative font-serif italic" style={{ marginTop: "2cqw", fontSize: "1.5cqw", color: MUTED }}>
            This is to certify that
          </p>
          <p className="relative font-serif font-bold leading-tight" style={{ marginTop: "0.8cqw", fontSize: "3.9cqw" }}>
            {c.recipientName}
          </p>
          <p className="relative font-serif italic" style={{ marginTop: "0.8cqw", fontSize: "1.5cqw", color: MUTED }}>
            has successfully passed the {c.sourceLabel.toLowerCase()}
          </p>
          <p className="relative font-bold leading-snug" style={{ marginTop: "0.8cqw", fontSize: "2.2cqw" }}>
            {c.title}
          </p>
          {c.programme && (
            <p className="relative" style={{ marginTop: "0.4cqw", fontSize: "1.3cqw", color: MUTED }}>
              {c.programme}
            </p>
          )}
          {c.scorePercent != null && (
            <p className="relative font-semibold" style={{ marginTop: "1.2cqw", fontSize: "1.25cqw" }}>
              Score {pct(c.scorePercent)}
              {c.passPercent != null && <> &nbsp;·&nbsp; Pass mark {pct(c.passPercent)}</>}
            </p>
          )}

          <div className="relative mt-auto flex w-full items-end justify-between text-left">
            <div style={{ width: "38%" }}>
              <p className="font-serif font-bold" style={{ fontSize: "1.55cqw" }}>
                {c.issuerName}
              </p>
              <span className="block" style={{ width: "21cqw", height: "0.1cqw", background: NAVY, margin: "0.5cqw 0" }} />
              <p style={{ fontSize: "1cqw", color: MUTED }}>Issuing organisation, through Arcade</p>
              <p style={{ fontSize: "1cqw", color: MUTED, marginTop: "0.3cqw" }}>
                Awarded {longDate(c.achievedAt)}
                {c.expiresAt && <> · Valid until {longDate(c.expiresAt)}</>}
              </p>
            </div>
            <Seal />
            <div className="text-right" style={{ width: "38%" }}>
              <p style={{ fontSize: "0.95cqw", color: MUTED }}>Credential ID</p>
              <p className="font-mono font-bold" style={{ fontSize: "1.3cqw", letterSpacing: "0.08cqw" }}>
                {c.credentialCode}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** The formal seal, drawn exactly as on the PDF. */
function Seal() {
  return (
    <svg viewBox="0 0 120 120" style={{ width: "9cqw", height: "9cqw" }} aria-hidden>
      <circle cx="60" cy="60" r="57" fill="#FBF7EC" stroke={GOLD} strokeWidth="3" />
      <circle cx="60" cy="60" r="26" fill="none" stroke={GOLD} strokeWidth="0.8" strokeDasharray="1.6 2" />
      <circle cx="60" cy="60" r="38" fill="none" stroke={GOLD} strokeWidth="1.4" />
      <path
        d="M60 34 L66.5 51.5 L85 52 L70.5 63.5 L75.5 81.5 L60 71 L44.5 81.5 L49.5 63.5 L35 52 L53.5 51.5 Z"
        fill={GOLD}
      />
      <text x="60" y="104.5" textAnchor="middle" fontWeight="700" fontSize="6.4" letterSpacing="2" fill={GOLD}>
        VERIFIED
      </text>
      <text x="60" y="20" textAnchor="middle" fontWeight="700" fontSize="6.4" letterSpacing="2" fill={GOLD}>
        ARCADE
      </text>
    </svg>
  );
}
