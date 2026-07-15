import React from 'react';

interface CertificateTemplateProps {
  participantName: string;
  courseName: string;
  courseUrl: string;
  issuedAt: string;
  blockchainHash: string;
  isPrintMode?: boolean;
}

export default function CertificateTemplate({
  participantName,
  courseName,
  courseUrl,
  issuedAt,
  blockchainHash,
  isPrintMode = false,
}: CertificateTemplateProps) {
  const formattedDate = new Date(issuedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const verifyUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/verify/${blockchainHash}`
    : `http://localhost:3000/verify/${blockchainHash}`;

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(verifyUrl)}`;
  const wrapperSizeClass = isPrintMode
    ? 'w-full max-w-none shadow-none'
    : 'mx-auto max-w-[850px] shadow-2xl';

  return (
    <div
      className={`relative bg-[#FBF9F3] text-[#2A2E36] border-2 border-[#1C2B45] rounded-sm select-none aspect-[1.414/1] overflow-hidden ${wrapperSizeClass} ${
        isPrintMode ? 'rounded-none' : ''
      }`}
    >
      {/* Fonts: Fraunces (ceremonial serif) + IBM Plex Sans/Mono (data-native utility faces) */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,500;0,9..144,600;1,9..144,500&family=Alex+Brush&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@500;600&display=swap');
        .cert-title { font-family: 'Fraunces', Georgia, serif; }
        .cert-signature { font-family: 'Alex Brush', cursive; }
        .cert-body { font-family: 'IBM Plex Sans', sans-serif; }
        .cert-mono { font-family: 'IBM Plex Mono', monospace; }
      `,
        }}
      />

      {/* Hairline inner rule, brass — a second frame instead of a thicker double border */}
      <div className="absolute inset-[10px] border border-[#B9924F] pointer-events-none" />

      {/* Registration-mark corners (precision/verification motif, not decorative brackets) */}
      <div className="absolute top-[6px] left-[6px] w-6 h-6 border-t-2 border-l-2 border-[#1C2B45] pointer-events-none" />
      <div className="absolute top-[6px] right-[6px] w-6 h-6 border-t-2 border-r-2 border-[#1C2B45] pointer-events-none" />
      <div className="absolute bottom-[6px] left-[6px] w-6 h-6 border-b-2 border-l-2 border-[#1C2B45] pointer-events-none" />
      <div className="absolute bottom-[6px] right-[6px] w-6 h-6 border-b-2 border-r-2 border-[#1C2B45] pointer-events-none" />

      {/* Watermark: hexagon + ring, echoing the college crest and the seal below */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.05]">
        <svg width="380" height="380" viewBox="0 0 100 100" className="text-[#1C2B45]">
          <polygon points="50,8 88,30 88,70 50,92 12,70 12,30" fill="none" stroke="currentColor" strokeWidth="0.6" />
          <circle cx="50" cy="50" r="34" fill="none" stroke="currentColor" strokeWidth="0.4" />
        </svg>
      </div>

      <div className="relative flex flex-col justify-between h-full cert-body text-center px-12 py-7">
        {/* Institution & platform marks */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2 text-left">
            <svg width="34" height="34" viewBox="0 0 100 100">
              <path d="M50,10 L90,30 L90,65 L50,90 L10,65 L10,30 Z" fill="none" stroke="#1C2B45" strokeWidth="6" />
              <path d="M35,45 L50,30 L65,45 L50,60 Z" fill="#B9924F" />
            </svg>
            <div>
              <h4 className="text-[10px] font-semibold tracking-wider text-[#1C2B45] uppercase">Amal Jyothi</h4>
              <p className="text-[8px] text-[#6b7280] font-medium">College of Engineering</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-right">
            <div>
              <h4 className="text-[11px] font-semibold tracking-[0.15em] text-[#1C2B45] uppercase">Arcade</h4>
              <p className="cert-mono text-[6px] text-[#9ca3af] uppercase tracking-[0.1em]">Platform Token</p>
            </div>
            {/* Hexagon badge (rather than a rounded gradient circle) to echo the college crest shape */}
            <div
              className="w-9 h-9 bg-[#1C2B45] flex items-center justify-center text-[#B9924F] text-sm font-semibold"
              style={{ clipPath: 'polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%)' }}
            >
              A
            </div>
          </div>
        </div>

        {/* Title */}
        <div>
          <p className="cert-mono text-[9px] uppercase tracking-[0.3em] font-semibold text-[#A9782E]">
            Certificate of Completion
          </p>
          <h2 className="cert-title text-lg tracking-[0.15em] text-[#1C2B45] mt-1">PROUDLY PRESENTED TO</h2>
        </div>

        {/* Participant name — solid ink color, short brass underline instead of a full-width gradient rule */}
        <div>
          <h1 className="cert-title inline-block relative font-medium text-4xl text-[#1C2B45]">
            {participantName}
            <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-14 h-[2px] bg-[#B9924F]" />
          </h1>
          <p className="text-[10px] text-[#6b7280] font-medium mt-4 px-16 leading-relaxed">
            for successfully satisfying all completion requirements for the digital learning experience
          </p>
        </div>

        {/* Course */}
        <div className="space-y-2">
          <h3 className="cert-title text-xl italic text-[#33456B]">{courseName}</h3>
          <a
            href={courseUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center text-[7px] font-semibold uppercase tracking-[0.2em] text-[#8B6B2E] hover:text-[#1C2B45] transition-colors"
          >
            Course Link
          </a>
        </div>

        {/* Footer: signatures + verification seal */}
        <div className="flex justify-between items-end border-t border-[#DDD6C4] pt-4">
          <div className="text-left w-[170px]">
            <p className="cert-signature text-xl text-[#1C2B45] h-7 flex items-end">Dr. Jacob J.</p>
            <div className="border-t border-[#B0AA97] w-full mt-1" />
            <p className="text-[7px] font-semibold text-[#9ca3af] uppercase tracking-wider mt-1">Director, AJCE</p>
          </div>

          {/* Verification seal — the QR *is* the wax seal: dashed brass ring around it,
              framing the functional verification code as the certificate's ceremonial mark */}
          <div className="flex flex-col items-center">
            <div className="w-[62px] h-[62px] rounded-full border-2 border-dashed border-[#B9924F] flex items-center justify-center bg-white p-1">
              <img src={qrCodeUrl} alt="Verification QR code" width={48} height={48} className="rounded-full" />
            </div>
            <span className="cert-mono text-[6px] text-[#9ca3af] uppercase tracking-wider mt-1.5">
              Cryptographically Sealed
            </span>
          </div>

          <div className="text-right w-[170px]">
            <p className="cert-signature text-xl text-[#1C2B45] h-7 flex items-end justify-end">Adhithyan A.</p>
            <div className="border-t border-[#B0AA97] w-full mt-1" />
            <p className="text-[7px] font-semibold text-[#9ca3af] uppercase tracking-wider mt-1">Founder, Arcade</p>
          </div>
        </div>

        {/* Issue date + hash — own row, no absolute overlap with the border */}
        <div className="flex justify-between items-center cert-mono text-[7px] text-[#9ca3af] uppercase tracking-wider pt-2">
          <span>Issued {formattedDate}</span>
          <span className="truncate max-w-[420px]">
            Hash <span className="text-[#33456B]/70 normal-case select-all">{blockchainHash}</span>
          </span>
        </div>
      </div>
    </div>
  );
}