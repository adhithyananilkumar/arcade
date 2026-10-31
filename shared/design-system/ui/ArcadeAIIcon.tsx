import React from "react";

export interface ArcadeAIIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  className?: string;
  variant?: "invader" | "bot" | "mascot";
}

/**
 * ArcadeAIIcon - Retro 8-bit arcade AI companion icon
 * Designed specifically for Arcade's AI assistant, matching the retro gaming aesthetic.
 *
 * Variants:
 * - 'invader': The iconic Space Invader sprite (default), universally recognized arcade emblem.
 * - 'bot': 8-bit AI Robot with communication antenna beacon and cyber visor.
 * - 'mascot': Playful arcade alien mascot inspired by classic 8-bit sprites.
 */
export function ArcadeAIIcon({
  size = 16,
  className = "",
  variant = "invader",
  ...props
}: ArcadeAIIconProps) {
  const viewBox = variant === "invader" ? "1 2.5 13 11" : "0 0 16 16";

  return (
    <svg
      width={size}
      height={size}
      viewBox={viewBox}
      fill="currentColor"
      aria-hidden="true"
      shapeRendering="crispEdges"
      className={className}
      {...props}
    >
      {variant === "invader" && (
        <path
          d="M4 4h1v1H4V4zm6 0h1v1h-1V4zm-5 1h1v1H5V5zm4 0h1v1H9V5zm-5 1h7v1H4V6zm-1 1h2v1H3V7zm3 0h3v1H6V7zm4 0h2v1h-2V7zm-8 1h11v1H2V8zm0 1h1v2H2V9zm2 0h7v1H4V9zm8 0h1v2h-1V9zm-8 1h1v1H4v-1zm6 0h1v1h-1v-1zm-5 1h2v1H5v-1zm3 0h2v1H8v-1z"
        />
      )}

      {variant === "bot" && (
        <path
          d="M7 1h2v1H7V1zm0 1h2v1H7V2zm-3 1h8v1H4V3zm-1 1h10v1H3V4zm-1 1h3v2H2V5zm4 0h4v2H6V5zm5 0h3v2h-3V5zm-8 2h10v1H3V7zm3 1h4v1H6V8zm-3 1h10v2H3V9zm1 2h2v2H4v-2zm6 0h2v2h-2v-2z"
        />
      )}

      {variant === "mascot" && (
        <path
          d="M2 2h2v2H2V2zm10 0h2v2h-2V2zm-9 2h10v1H3V4zm-1 1h12v1H2V5zm-2 1h16v2H0V6zm2 2h12v1H2V8zm1 1h10v1H3V9zm1 1h2v3H4v-3zm6 0h2v3h-2v-3z"
        />
      )}
    </svg>
  );
}

export default ArcadeAIIcon;
