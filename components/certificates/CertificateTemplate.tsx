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

  return (
    <div className={`relative bg-white font-sans text-gray-800 border-[16px] border-double border-indigo-900 rounded-lg shadow-2xl p-12 select-none mx-auto max-w-[850px] aspect-[1.414/1] overflow-hidden ${isPrintMode ? 'shadow-none border-[12px]' : ''}`}>
      {/* Styles to load elegant Google fonts */}
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,800;1,400&family=Alex+Brush&family=Montserrat:wght@400;500;700&display=swap');
        .cert-title { font-family: 'Playfair Display', Georgia, serif; }
        .cert-signature { font-family: 'Alex Brush', cursive; }
        .cert-body { font-family: 'Montserrat', sans-serif; }
      `}} />

      {/* Decorative Ornaments in corners */}
      <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-amber-500 rounded-tl-sm pointer-events-none"></div>
      <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-amber-500 rounded-tr-sm pointer-events-none"></div>
      <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-amber-500 rounded-bl-sm pointer-events-none"></div>
      <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-amber-500 rounded-br-sm pointer-events-none"></div>

      {/* Background Watermark SVG Pattern */}
      <div className="absolute inset-0 opacity-[0.03] flex items-center justify-center pointer-events-none">
        <svg width="400" height="400" viewBox="0 0 100 100" fill="currentColor" className="text-indigo-900">
          <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="1" fill="none" />
          <polygon points="50,15 62,38 88,38 67,54 75,80 50,65 25,80 33,54 12,38 38,38" fill="none" stroke="currentColor" strokeWidth="1" />
        </svg>
      </div>

      <div className="relative flex flex-col justify-between h-full cert-body text-center">
        {/* Logos & Institution Info */}
        <div className="flex justify-between items-center px-4">
          {/* College Logo (Amal Jyothi College of Engineering) */}
          <div className="flex items-center gap-2 text-left">
            <svg width="40" height="40" viewBox="0 0 100 100" className="text-indigo-900">
              <path d="M50,10 L90,30 L90,65 L50,90 L10,65 L10,30 Z" fill="none" stroke="currentColor" strokeWidth="6" />
              <path d="M50,20 L80,35 L80,60 L50,80 L20,60 L20,35 Z" fill="currentColor" opacity="0.2" />
              <path d="M35,45 L50,30 L65,45 L50,60 Z" fill="currentColor" className="text-amber-500" />
              <line x1="50" y1="60" x2="50" y2="80" stroke="currentColor" strokeWidth="5" />
            </svg>
            <div>
              <h4 className="text-[10px] font-bold tracking-wider text-indigo-950 uppercase">Amal Jyothi</h4>
              <p className="text-[8px] text-gray-500 font-medium">College of Engineering</p>
            </div>
          </div>

          {/* Arcade Logo */}
          <div className="flex items-center gap-2 text-right">
            <div>
              <h4 className="text-[11px] font-extrabold tracking-widest text-indigo-900 uppercase">ARCADE</h4>
              <p className="text-[7px] text-gray-400 font-bold uppercase tracking-widest">Platform Token</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-100">
              <span className="text-sm font-extrabold italic">A</span>
            </div>
          </div>
        </div>

        {/* Certificate Title */}
        <div className="my-2">
          <p className="text-[10px] uppercase tracking-[0.25em] font-semibold text-amber-600">Certificate of Completion</p>
          <h2 className="cert-title text-3xl font-extrabold text-indigo-950 mt-1">PROUDLY PRESENTED TO</h2>
        </div>

        {/* Participant Name */}
        <div className="my-2">
          <h1 className="text-3xl font-bold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-indigo-950 via-indigo-900 to-indigo-950 underline decoration-amber-500 decoration-2 underline-offset-8">
            {participantName}
          </h1>
          <p className="text-[10px] text-gray-500 font-medium mt-3 px-12 leading-relaxed">
            for successfully satisfying all completion requirements for the digital learning experience
          </p>
        </div>

        {/* Course Details */}
        <div className="my-2">
          <h3 className="cert-title text-xl font-bold italic text-indigo-900">
            {courseName}
          </h3>
        </div>

        {/* Footer info: Signatures, QR Code & Blockchain Hash */}
        <div className="flex justify-between items-end mt-4 border-t border-gray-100 pt-6">
          {/* Signature 1 */}
          <div className="text-left w-[180px]">
            <p className="cert-signature text-2xl text-indigo-900/90 h-8 flex items-end">Dr. Jacob J.</p>
            <div className="border-t border-gray-300 w-full mt-1"></div>
            <p className="text-[8px] font-bold text-gray-400 uppercase tracking-wider mt-1">Director, AJCE</p>
          </div>

          {/* QR Code and Ledger Verification */}
          <div className="flex flex-col items-center">
            <img
              src={qrCodeUrl}
              alt="Verification QR Code"
              width={65}
              height={65}
              className="bg-white p-1 border border-gray-100 rounded-sm shadow-sm"
            />
            <span className="text-[7px] text-gray-400 font-bold uppercase tracking-wider mt-1.5">Scan to Verify</span>
          </div>

          {/* Signature 2 */}
          <div className="text-right w-[180px]">
            <p className="cert-signature text-2xl text-indigo-900/90 h-8 flex items-end justify-end">Adhithyan A.</p>
            <div className="border-t border-gray-300 w-full mt-1"></div>
            <p className="text-[8px] font-bold text-gray-400 uppercase tracking-wider mt-1">Founder, Arcade</p>
          </div>
        </div>

        {/* Blockchain Ledger Hash Proof Bar */}
        <div className="absolute bottom-2 left-0 right-0 px-12 flex justify-between items-center text-[7px] font-bold text-gray-400 uppercase tracking-wider">
          <span>Issued: {formattedDate}</span>
          <span className="truncate max-w-[450px]">Arcade Blockchain Hash: <span className="text-indigo-900/70 font-mono font-normal normal-case select-all">{blockchainHash}</span></span>
        </div>
      </div>
    </div>
  );
}
