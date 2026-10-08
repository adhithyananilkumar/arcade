/**
 * ------------------------------------------------------------------
 * Arcade Frontend Architecture
 * Layer: Domains
 * Domain: Credentials
 *
 * How a channel appears on the credentials it issues: a full sample certificate (`CertificateFace`)
 * and, for an organisation, a sample badge (`CredentialBadge`, the logo in its lower medallion).
 * Shown wherever a channel sets its logo or its signatory, so it sees the result before saving.
 *
 * An organisation issues its own certificates: its logo sits beside the Arcade mark and it is named
 * as issuer and conductor. A personal channel is a person, not an issuing institution, so the host
 * institution issues its certificates (backend `ExamAttemptOutcomeService`) and the instructor is
 * named as conducting and signing them; personal channels put nothing on badges. An organisation
 * can also choose to issue in the host's name (`asHost`): the host is the issuer, with its seal, while
 * the organisation's logo stays beside the Arcade mark and it is named as conducting. Pure and
 * presentational.
 * ------------------------------------------------------------------
 */

import { CertificateFace } from "./CertificateFace";
import { CredentialBadge } from "./CredentialBadge";
import { HOST_INSTITUTION_NAME } from "../lib/hostInstitution";

export interface IssuerLogoPreviewProps {
  /** The logo as it will be saved: an uploaded URL or a local preview (data/blob URL). */
  logoSrc?: string | null;
  /** The organisation's name; for a personal channel, the instructor's. */
  organisationName: string;
  /** The organisation's seal, printed above its name in the issuer column. */
  sealSrc?: string | null;
  /** The certificate signatory, shown in the certificate's signature column. */
  signatory?: { name: string; title: string; signatureUrl: string } | null;
  /** Show the badge preview too (signatures do not appear on badges). Default true; never for personal. */
  showBadge?: boolean;
  /** An organisation issuing in the host institution's name: host issuer and seal, its own logo. */
  asHost?: boolean;
  /** A personal channel: issued by the host institution, conducted by `organisationName`. */
  personal?: boolean;
  className?: string;
}

const SAMPLE_DATE = "2026-01-15T06:30:00Z";

export function IssuerLogoPreview({
  logoSrc,
  organisationName,
  sealSrc,
  signatory,
  showBadge = true,
  personal = false,
  asHost = false,
  className,
}: IssuerLogoPreviewProps) {
  const name = organisationName || (personal ? "Your name" : "Your organisation");
  const badge = showBadge && !personal;
  return (
    // Sized by its own width (container queries), not the viewport: the same preview sits in the
    // wide branding section and in the narrower cropper dialog.
    <div className={`@container ${className ?? ""}`}>
      <div className={badge ? "grid gap-4 @3xl:grid-cols-[minmax(0,1fr)_minmax(220px,28%)]" : undefined}>
        <figure className="min-w-0">
          <figcaption className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
            On certificates
          </figcaption>
          <div className="overflow-hidden rounded-xl border border-slate-200 shadow-sm">
            <CertificateFace
              verificationUrl="https://arcade.ajce.in/credentials/CERT-SAMPLE"
              certificate={{
                credentialCode: "CERT-SAMPLE-0000",
                documentTitle: "Certificate of Achievement",
                sourceLabel: "Certification exam",
                title: "Your course or exam",
                recipientName: "Learner Name",
                issuerName: personal || asHost ? HOST_INSTITUTION_NAME : name,
                issuerLogoUrl: personal ? null : logoSrc ?? null,
                issuerSealUrl: personal || asHost ? null : sealSrc ?? null,
                issuedByHost: personal || asHost,
                signatoryName: signatory?.name ?? null,
                signatoryTitle: signatory?.title ?? null,
                signatureUrl: signatory?.signatureUrl ?? null,
                conductedBy: name,
                scorePercent: 92,
                achievedAt: SAMPLE_DATE,
                issuedAt: SAMPLE_DATE,
                expiresAt: null,
                revoked: false,
              }}
            />
          </div>
        </figure>
        {badge && (
          <figure className="flex min-w-0 flex-col">
            <figcaption className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              On badges
            </figcaption>
            <div className="flex flex-1 flex-col items-center justify-center gap-4 rounded-xl border border-slate-200 bg-slate-50 px-6 py-8 shadow-sm">
              <CredentialBadge
                family="COURSE"
                level={2}
                title="Your course"
                issuerLogoUrl={logoSrc}
                label="Badge preview with your logo"
                className="w-full max-w-[240px]"
              />
              <p className="max-w-[260px] text-center text-[11px] font-medium leading-relaxed text-slate-500">
                Your logo sits in the badge&apos;s lower medallion, recoloured into the badge&apos;s metal.
              </p>
            </div>
          </figure>
        )}
      </div>
    </div>
  );
}
