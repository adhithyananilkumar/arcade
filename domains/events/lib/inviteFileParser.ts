/**
 * Parser for bulk event invitation files (CSV and JSON).
 *
 * Extracts and normalizes email addresses from various CSV and JSON shapes,
 * identifies invalid entries and duplicates, and provides sample templates.
 */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface ParsedInviteFile {
  filename: string;
  fileSizeBytes: number;
  format: 'csv' | 'json';
  totalFound: number;
  validEmails: string[];
  invalidEntries: string[];
  duplicatesCount: number;
}

/**
 * Parses a CSV line respecting quoted strings.
 */
function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

/**
 * Extracts emails from CSV text.
 */
function parseCsvText(text: string): { valid: string[]; invalid: string[]; duplicates: number; total: number } {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length === 0) {
    return { valid: [], invalid: [], duplicates: 0, total: 0 };
  }

  // Check header row
  const firstRow = parseCsvLine(lines[0]);
  let emailColIndex = -1;

  for (let c = 0; c < firstRow.length; c++) {
    const header = firstRow[c].toLowerCase().replace(/[^a-z]/g, '');
    if (header === 'email' || header === 'mail' || header === 'emailaddress') {
      emailColIndex = c;
      break;
    }
  }

  const rawCandidates: string[] = [];
  const startRow = emailColIndex !== -1 ? 1 : 0;

  for (let r = startRow; r < lines.length; r++) {
    const row = parseCsvLine(lines[r]);
    if (emailColIndex !== -1 && emailColIndex < row.length) {
      const candidate = row[emailColIndex].trim();
      if (candidate) rawCandidates.push(candidate);
    } else {
      // Scan each column for anything looking like an email or token
      for (const cell of row) {
        const trimmed = cell.trim();
        if (trimmed) rawCandidates.push(trimmed);
      }
    }
  }

  return categorizeCandidates(rawCandidates);
}

/**
 * Extracts emails from JSON text.
 */
function parseJsonText(text: string): { valid: string[]; invalid: string[]; duplicates: number; total: number } {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error('The file contains invalid JSON formatting. Please check the syntax.');
  }

  const rawCandidates: string[] = [];

  function extract(node: unknown) {
    if (!node) return;
    if (typeof node === 'string') {
      const trimmed = node.trim();
      if (trimmed) rawCandidates.push(trimmed);
    } else if (Array.isArray(node)) {
      for (const item of node) {
        extract(item);
      }
    } else if (typeof node === 'object') {
      const obj = node as Record<string, unknown>;
      // Look for common email keys
      const emailField = obj.email ?? obj.Email ?? obj.mail ?? obj.emailAddress;
      if (typeof emailField === 'string' && emailField.trim()) {
        rawCandidates.push(emailField.trim());
      } else if (Array.isArray(obj.emails)) {
        extract(obj.emails);
      } else if (Array.isArray(obj.participants)) {
        extract(obj.participants);
      } else if (Array.isArray(obj.users)) {
        extract(obj.users);
      } else if (Array.isArray(obj.invites)) {
        extract(obj.invites);
      } else {
        // Fallback: search all values
        for (const val of Object.values(obj)) {
          if (typeof val === 'string' && EMAIL_REGEX.test(val.trim())) {
            rawCandidates.push(val.trim());
          }
        }
      }
    }
  }

  extract(parsed);
  return categorizeCandidates(rawCandidates);
}

function categorizeCandidates(rawCandidates: string[]): {
  valid: string[];
  invalid: string[];
  duplicates: number;
  total: number;
} {
  const seen = new Set<string>();
  const valid: string[] = [];
  const invalid: string[] = [];
  let duplicates = 0;

  for (const item of rawCandidates) {
    // Strip leading/trailing brackets or quotes if any
    const clean = item.replace(/^[<"']|[>"']$/g, '').trim();
    if (!clean) continue;

    const lower = clean.toLowerCase();
    if (seen.has(lower)) {
      duplicates++;
      continue;
    }
    seen.add(lower);

    if (EMAIL_REGEX.test(clean)) {
      valid.push(clean);
    } else {
      invalid.push(clean);
    }
  }

  return {
    valid,
    invalid,
    duplicates,
    total: valid.length + invalid.length + duplicates,
  };
}

/**
 * Parses an uploaded File object (CSV or JSON).
 */
export async function parseInviteFile(file: File): Promise<ParsedInviteFile> {
  const extension = file.name.split('.').pop()?.toLowerCase();
  const format: 'csv' | 'json' = extension === 'json' ? 'json' : 'csv';

  const text = await file.text();
  if (!text.trim()) {
    throw new Error('The uploaded file is empty.');
  }

  let result: { valid: string[]; invalid: string[]; duplicates: number; total: number };

  if (format === 'json') {
    result = parseJsonText(text);
  } else {
    result = parseCsvText(text);
  }

  if (result.valid.length === 0 && result.invalid.length === 0) {
    throw new Error('No email addresses could be found in the uploaded file.');
  }

  return {
    filename: file.name,
    fileSizeBytes: file.size,
    format,
    totalFound: result.total,
    validEmails: result.valid,
    invalidEntries: result.invalid,
    duplicatesCount: result.duplicates,
  };
}

/**
 * Triggers browser download of a sample CSV template.
 */
export function downloadCsvTemplate(): void {
  const content = 'email,name\nalex.morgan@example.com,Alex Morgan\nsam.wilson@example.com,Sam Wilson\npriya.sharma@example.com,Priya Sharma\n';
  triggerDownload(content, 'arcade_event_invites_template.csv', 'text/csv');
}

/**
 * Triggers browser download of a sample JSON template.
 */
export function downloadJsonTemplate(): void {
  const sample = {
    emails: [
      'alex.morgan@example.com',
      'sam.wilson@example.com',
      'priya.sharma@example.com',
    ],
  };
  triggerDownload(JSON.stringify(sample, null, 2), 'arcade_event_invites_template.json', 'application/json');
}

function triggerDownload(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
