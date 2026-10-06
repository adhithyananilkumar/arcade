/**
 * ------------------------------------------------------------------
 * Arcade Frontend Architecture
 * Layer: Domains
 * Domain: Credentials
 *
 * How an organisation's logo appears on the credentials it issues: a full sample certificate
 * (`CertificateFace`, issued by this organisation, so its logo sits beside the Arcade mark) and a
 * sample badge (`CredentialBadge`, the logo in its lower medallion). Shown wherever an organisation
 * sets its logo or its signatory, so it sees the result before saving. Pure and presentational.
 * ------------------------------------------------------------------
 */

import { CertificateFace } from "./CertificateFace";
import { CredentialBadge } from "./CredentialBadge";

export interface IssuerLogoPreviewProps {
  /** The logo as it will be saved: an uploaded URL or a local preview (data/blob URL). */
  logoSrc?: string | null;
  organisationName: string;
  /** The organisation's certificate signatory, shown in the certificate's signature column. */
  signatory?: { name: string; title: string; signatureUrl: string } | null;
  /** Show the badge preview too (signatures do not appear on badges). Default true. */
  showBadge?: boolean;
  className?: string;
}

const SAMPLE_DATE = "2026-01-15T06:30:00Z";

export function IssuerLogoPreview({ logoSrc, organisationName, signatory, showBadge = true, className }: IssuerLogoPreviewProps) {
  const issuer = organisationName || "Your organisation";
  return (
    <div className={className}>
      <figure>
        <figcaption className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
          On certificates
        </figcaption>
        <div className="overflow-hidden rounded-xl border border-slate-200 shadow-sm">
          <CertificateFace
            verificationUrl="https://arcade.example/credentials/CERT-SAMPLE"
            certificate={{
              credentialCode: "CERT-SAMPLE-0000",
              documentTitle: "Certificate of Achievement",
              sourceLabel: "Certification exam",
              title: "Your course or exam",
              recipientName: "Learner Name",
              issuerName: issuer,
              issuerLogoUrl: logoSrc ?? null,
              issuedByHost: false,
              signatoryName: signatory?.name ?? null,
              signatoryTitle: signatory?.title ?? null,
              signatureUrl: signatory?.signatureUrl ?? null,
              scorePercent: 92,
              achievedAt: SAMPLE_DATE,
              issuedAt: SAMPLE_DATE,
              expiresAt: null,
              revoked: false,
            }}
          />
        </div>
      </figure>
      {showBadge && (
      <figure className="mt-3 flex items-center gap-4">
        <div className="flex h-[112px] w-[112px] shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 p-2">
          <CredentialBadge
            family="COURSE"
            level={2}
            title="Your course"
            issuerLogoUrl={logoSrc}
            label="Badge preview with your logo"
            className="w-[88px]"
          />
        </div>
        <figcaption className="text-[11px] font-medium leading-relaxed text-slate-500">
          <span className="mb-0.5 block font-bold uppercase tracking-wider">On badges</span>
          Your logo sits in the badge&apos;s lower medallion, recoloured into the badge&apos;s metal.
        </figcaption>
      </figure>
      )}
    </div>
  );
}
