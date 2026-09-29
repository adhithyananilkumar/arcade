/**
 * ------------------------------------------------------------------
 * Arcade Frontend Architecture
 * Layer: Domains
 * Domain: Credentials
 *
 * Sharing a credential: its public link, LinkedIn's "Add licence or certification" form pre-filled
 * with the credential ID and verification URL, and the artwork as a file. Pure URL builders plus
 * one browser-only download helper.
 * ------------------------------------------------------------------
 */

import { renderBadgeSvg, type BadgeFamilyKey, type BadgeLevel } from "./badgeArt";

export interface ShareableCredential {
  credentialCode: string;
  /** The award's name, e.g. the course title. */
  name: string;
  issuedAt: string;
  /** Absolute URL of the public credential page. */
  url: string;
}

/**
 * LinkedIn's add-to-profile deep link. The credential ID and URL land in the certification's own
 * fields, so anyone reading the profile can click through to Arcade's verification page.
 */
export function linkedInAddToProfileUrl(c: ShareableCredential, organizationName = "Arcade"): string {
  const issued = new Date(c.issuedAt);
  const params = new URLSearchParams({
    startTask: "CERTIFICATION_NAME",
    name: c.name,
    organizationName,
    issueYear: String(issued.getFullYear()),
    issueMonth: String(issued.getMonth() + 1),
    certUrl: c.url,
    certId: c.credentialCode,
  });
  return `https://www.linkedin.com/profile/add?${params.toString()}`;
}

export function linkedInShareUrl(url: string): string {
  return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
}

export function xShareUrl(url: string, text: string): string {
  return `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
}

/** Saves the badge artwork: SVG as drawn, or PNG rasterised at 3× for print and social posts. */
export async function downloadBadgeImage(
  family: BadgeFamilyKey,
  level: BadgeLevel,
  title: string,
  fileName: string,
  format: "svg" | "png" = "png",
  issuerLogoUrl?: string | null
): Promise<void> {
  // A standalone SVG loads nothing external, so the logo travels inside it as a data: URL.
  const logo = issuerLogoUrl ? await toDataUrl(issuerLogoUrl) : null;
  const svg = renderBadgeSvg({ family, level, title, issuerLogoUrl: logo, uid: "dl", standalone: true });
  const svgBlob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
  if (format === "svg") {
    triggerDownload(svgBlob, `${fileName}.svg`);
    return;
  }
  const url = URL.createObjectURL(svgBlob);
  try {
    const img = new Image();
    img.decoding = "async";
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("Could not render the badge image."));
      img.src = url;
    });
    const scale = 3;
    const canvas = document.createElement("canvas");
    canvas.width = img.width * scale;
    canvas.height = img.height * scale;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas is unavailable.");
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const png = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
    if (!png) throw new Error("Could not render the badge image.");
    triggerDownload(png, `${fileName}.png`);
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** Null when the logo cannot be fetched (e.g. a host without CORS): the badge is drawn without it. */
async function toDataUrl(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, { mode: "cors" });
    if (!res.ok) return null;
    const blob = await res.blob();
    return await new Promise<string | null>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : null);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

function triggerDownload(blob: Blob, name: string) {
  const href = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = href;
  a.download = name.replace(/[\\/:*?"<>|]+/g, "-");
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(href), 1000);
}
