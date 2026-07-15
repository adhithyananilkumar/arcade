export function toBlockchainCode(hash: string, prefix = 'ARC'): string {
  if (!hash) return '';

  const normalized = hash.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  const segment = normalized.slice(0, 6) || normalized.slice(-6) || '000000';

  return `${prefix}-${segment}`;
}
