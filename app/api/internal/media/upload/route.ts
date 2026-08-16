import { NextResponse } from 'next/server';
import { promises as dns } from 'dns';
import { isIP } from 'net';

/**
 * The presigned `uploadUrl` in the request body is entirely client-controlled
 * (it round-trips through the browser between the presign call and this
 * upload call). Without validation, this route is a server-side-request-
 * forgery primitive: it will make an outbound request from the Next.js
 * server to whatever URL the client supplies. This guard rejects anything
 * that isn't a plausible https presigned-storage URL pointing at a public
 * host, including DNS-rebinding attempts (a hostname that resolves to a
 * private/loopback/link-local/cloud-metadata address).
 */
async function assertSafeUploadUrl(rawUrl: string): Promise<void> {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    throw new Error('Invalid upload URL');
  }

  if (url.protocol !== 'https:') {
    throw new Error('Upload URL must use https');
  }

  const hostname = url.hostname;

  // Reject literal loopback/private/link-local/unspecified IP addresses used directly as the host.
  if (isIP(hostname)) {
    if (isPrivateOrReservedIp(hostname)) {
      throw new Error('Upload URL host is not allowed');
    }
  } else {
    if (hostname === 'localhost' || hostname.endsWith('.localhost')) {
      throw new Error('Upload URL host is not allowed');
    }

    // Resolve the hostname and reject if it (or any of its resolved
    // addresses) points at a private/reserved range — defeats DNS
    // rebinding, where a hostname resolves to a public IP at request-time
    // validation but the actual connection target differs.
    let addresses: string[];
    try {
      const [v4, v6] = await Promise.all([
        dns.resolve4(hostname).catch(() => [] as string[]),
        dns.resolve6(hostname).catch(() => [] as string[]),
      ]);
      addresses = [...v4, ...v6];
    } catch {
      throw new Error('Unable to resolve upload URL host');
    }

    if (addresses.length === 0) {
      throw new Error('Unable to resolve upload URL host');
    }

    if (addresses.some(isPrivateOrReservedIp)) {
      throw new Error('Upload URL host is not allowed');
    }
  }
}

function isPrivateOrReservedIp(ip: string): boolean {
  const version = isIP(ip);

  if (version === 4) {
    const parts = ip.split('.').map(Number);
    const [a, b] = parts;
    if (a === 127) return true; // loopback
    if (a === 10) return true; // private
    if (a === 172 && b >= 16 && b <= 31) return true; // private
    if (a === 192 && b === 168) return true; // private
    if (a === 169 && b === 254) return true; // link-local, incl. 169.254.169.254 cloud metadata
    if (a === 0) return true; // "this network"
    if (a === 100 && b >= 64 && b <= 127) return true; // carrier-grade NAT
    if (a === 198 && (b === 18 || b === 19)) return true; // benchmarking
    return false;
  }

  if (version === 6) {
    const lower = ip.toLowerCase();
    if (lower === '::1') return true; // loopback
    if (lower === '::') return true; // unspecified
    if (lower.startsWith('fc') || lower.startsWith('fd')) return true; // unique local (fc00::/7)
    if (lower.startsWith('fe80')) return true; // link-local
    if (lower.startsWith('::ffff:')) {
      // IPv4-mapped IPv6 — validate the embedded IPv4 address too.
      const v4 = lower.slice('::ffff:'.length);
      if (isIP(v4) === 4) return isPrivateOrReservedIp(v4);
    }
    return false;
  }

  // Not a recognizable IP literal — treat conservatively as unsafe.
  return true;
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as Blob;
    const uploadUrl = formData.get('uploadUrl') as string;

    if (!file || !uploadUrl) {
      return NextResponse.json({ error: 'Missing file or uploadUrl' }, { status: 400 });
    }

    try {
      await assertSafeUploadUrl(uploadUrl);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Invalid upload URL';
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();

    const res = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': file.type,
        'Content-Length': arrayBuffer.byteLength.toString(),
      },
      body: arrayBuffer,
      // Presigned storage PUT uploads never legitimately redirect; treat any
      // redirect response as a failure rather than silently following it to
      // an unvalidated target.
      redirect: 'manual',
    });

    if (res.type === 'opaqueredirect' || (res.status >= 300 && res.status < 400)) {
      return NextResponse.json({ error: 'Upload target attempted a redirect, which is not allowed' }, { status: 502 });
    }

    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to upload to S3', details: await res.text() }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
