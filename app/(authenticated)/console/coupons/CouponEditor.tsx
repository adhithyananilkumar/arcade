'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  Download,
  FileImage,
  Loader2,
  Plus,
  Ticket,
  Upload,
  UserPlus,
  X,
} from 'lucide-react';
import {
  CouponService,
  type CouponDto,
  type CouponTemplateDto,
  type UserCouponDto,
} from '@/domains/learning/coupons/api/coupon.service';
import {
  CouponTicket,
  formatOfferValue,
} from '@/domains/learning/coupons/components/CouponTicket';
import { resolveQrUrl } from '@/domains/learning/coupons/components/CouponRedeemCard';
import { UserService } from '@/domains/identity';
import { useAuthStore } from '@/infrastructure/auth/auth.store';

type UserOption = { id: string; fullName?: string; email?: string; username?: string };

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';

function resolveFileUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${API_BASE}${url.startsWith('/') ? '' : '/'}${url}`;
}

function toIsoEndOfDay(dateStr: string): string {
  // Treat local date input as end-of-day local, send as ISO for backend OffsetDateTime
  const d = new Date(`${dateStr}T23:59:59`);
  return d.toISOString();
}

async function createDefaultTemplateFile(): Promise<File> {
  const w = 840;
  const h = 480;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const g = canvas.getContext('2d');
  if (!g) throw new Error('Canvas unavailable');

  g.fillStyle = '#ffffff';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#00baf2';
  g.fillRect(0, 0, 18, h);
  g.fillRect(0, h - 64, w, 64);

  g.fillStyle = '#14142b';
  g.font = 'bold 42px sans-serif';
  g.fillText('arcade.', 48, 78);
  g.font = 'bold 28px sans-serif';
  g.fillText('Default coupon ticket', 48, 140);

  g.fillStyle = '#64748b';
  g.font = '18px sans-serif';
  g.fillText('Scan the QR to unlock your offer', 48, 178);

  g.fillStyle = '#e2e8f0';
  g.fillRect(48, 220, 160, 36);
  g.fillRect(220, 220, 120, 36);
  g.fillStyle = '#475569';
  g.font = 'bold 14px sans-serif';
  g.fillText('TEMPLATE', 68, 244);
  g.fillText('PNG', 258, 244);

  g.fillStyle = '#ffffff';
  g.font = 'bold 18px sans-serif';
  g.fillText('Your destination for exclusive offers!', 48, h - 28);
  g.fillText('arcade.', w - 130, h - 28);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Failed to build PNG'))), 'image/png');
  });
  return new File([blob], 'default-ticket.png', { type: 'image/png' });
}

export function CouponEditor() {
  const router = useRouter();
  const currentUser = useAuthStore((s) => s.user);

  const [coupons, setCoupons] = useState<CouponDto[]>([]);
  const [templates, setTemplates] = useState<CouponTemplateDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [issued, setIssued] = useState<UserCouponDto[]>([]);
  const [issuedLoading, setIssuedLoading] = useState(false);
  const [users, setUsers] = useState<UserOption[]>([]);

  const [createOpen, setCreateOpen] = useState(false);
  const [templateOpen, setTemplateOpen] = useState(false);
  const [issueOpen, setIssueOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: '',
    description: '',
    discountType: 'PERCENT' as 'PERCENT' | 'FIXED',
    discountValue: '10',
    currency: 'USD',
    templateId: '',
    expiresAt: '',
    quantity: '1',
  });
  const [templateName, setTemplateName] = useState('');
  const [templateFile, setTemplateFile] = useState<File | null>(null);
  const [recipientId, setRecipientId] = useState('');
  const [issueQuantity, setIssueQuantity] = useState('1');

  const fetchCoupons = useCallback(async () => {
    try {
      setLoading(true);
      const [list, initialTpls] = await Promise.all([
        CouponService.listAll(),
        CouponService.listTemplates(),
      ]);
      let tpls = initialTpls;
      if (tpls.length === 0) {
        try {
          const file = await createDefaultTemplateFile();
          await CouponService.uploadTemplate(file, 'Default ticket');
          tpls = await CouponService.listTemplates();
        } catch {
          // Backend bootstrap may still seed on next restart
        }
      }
      setCoupons(list);
      setTemplates(tpls);
      setSelectedId((prev) => prev ?? (list[0]?.id ?? null));
      setForm((f) => ({
        ...f,
        templateId: f.templateId || tpls[0]?.id || '',
      }));
    } catch {
      toast.error('Failed to load coupons');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchIssued = useCallback(async (couponId: string) => {
    try {
      setIssuedLoading(true);
      setIssued(await CouponService.listIssued(couponId));
    } catch {
      toast.error('Failed to load issued coupons');
      setIssued([]);
    } finally {
      setIssuedLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCoupons();
    UserService.getAllUsers()
      .then((list) => setUsers(list as UserOption[]))
      .catch(() => setUsers([]));
  }, [fetchCoupons]);

  useEffect(() => {
    if (selectedId) fetchIssued(selectedId);
  }, [selectedId, fetchIssued]);

  useEffect(() => {
    setCreateOpen(false);
    setTemplateOpen(false);
    setIssueOpen(false);
  }, [selectedId]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setCreateOpen(false);
        setTemplateOpen(false);
        setIssueOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (currentUser?.id && !recipientId) setRecipientId(currentUser.id);
  }, [currentUser, recipientId]);

  const selected = coupons.find((c) => c.id === selectedId) ?? null;

  const handleUploadTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!templateFile) {
      toast.error('Choose a PNG, JPG, or PDF file');
      return;
    }
    try {
      setSaving(true);
      const created = await CouponService.uploadTemplate(templateFile, templateName || undefined);
      toast.success('Template added');
      setTemplateOpen(false);
      setTemplateFile(null);
      setTemplateName('');
      const tpls = await CouponService.listTemplates();
      setTemplates(tpls);
      setForm((f) => ({ ...f, templateId: created.id }));
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setSaving(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.templateId) {
      toast.error('Select a template');
      return;
    }
    if (!form.expiresAt) {
      toast.error('Set an expiry date');
      return;
    }
    const quantity = Math.min(100, Math.max(1, Number(form.quantity) || 1));
    try {
      setSaving(true);
      const created = await CouponService.create({
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        discountType: form.discountType,
        discountValue: Number(form.discountValue),
        currency: form.currency.trim() || 'USD',
        templateId: form.templateId,
        expiresAt: toIsoEndOfDay(form.expiresAt),
        quantity,
      });
      toast.success(
        quantity === 1
          ? `Coupon created with QR (${created[0]?.couponCode})`
          : `Created ${created.length} coupons with unique codes and QR`,
      );
      setCreateOpen(false);
      setForm({
        name: '',
        description: '',
        discountType: 'PERCENT',
        discountValue: '10',
        currency: 'USD',
        templateId: form.templateId,
        expiresAt: '',
        quantity: '1',
      });
      await fetchCoupons();
      setSelectedId(created[0]?.couponId ?? null);
      if (created.length === 1) {
        router.push(`/console/coupons/issued/${created[0].id}`);
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to create coupon');
    } finally {
      setSaving(false);
    }
  };

  const handleIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId || !recipientId) return;
    const quantity = Math.min(100, Math.max(1, Number(issueQuantity) || 1));
    try {
      setSaving(true);
      const issuedList = await CouponService.issue(selectedId, recipientId, quantity);
      toast.success(
        quantity === 1
          ? 'Coupon generated with QR — you can download the PNG'
          : `Generated ${issuedList.length} coupons with QR codes`,
      );
      setIssueOpen(false);
      setIssueQuantity('1');
      await fetchCoupons();
      if (selectedId) await fetchIssued(selectedId);
      if (issuedList.length === 1) {
        router.push(`/console/coupons/issued/${issuedList[0].id}`);
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to issue coupon');
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadPng = async (userCouponId: string) => {
    try {
      setBusyId(userCouponId);
      await CouponService.downloadQr(userCouponId);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Download failed');
    } finally {
      setBusyId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Loader2 className="animate-spin" size={16} /> Loading…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-[#14142b]">Coupon</h1>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setTemplateOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-[#14142b] hover:bg-slate-50"
          >
            <Upload size={16} /> Add template
          </button>
          <button
            type="button"
            onClick={() => {
              setForm((f) => ({
                ...f,
                templateId: f.templateId || templates[0]?.id || '',
              }));
              setCreateOpen(true);
            }}
            className="inline-flex items-center gap-2 rounded-lg bg-[#14142b] px-4 py-2 text-sm font-medium text-white hover:bg-[#232735]"
          >
            <Plus size={16} /> Create coupon
          </button>
        </div>
      </div>

      {templates.length > 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Templates ({templates.length})
          </p>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {templates.map((t) => {
              const url = resolveFileUrl(t.fileUrl);
              const isImage = t.contentType.startsWith('image/');
              return (
                <div
                  key={t.id}
                  className="w-28 shrink-0 overflow-hidden rounded-xl border border-slate-100 bg-slate-50"
                >
                  <div className="flex aspect-square items-center justify-center bg-slate-100">
                    {isImage && url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={url} alt={t.name} className="size-full object-cover" />
                    ) : (
                      <FileImage className="text-slate-400" size={28} />
                    )}
                  </div>
                  <p className="truncate px-2 py-1.5 text-[11px] font-medium text-slate-600">
                    {t.name}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white/80 px-4 py-6 text-center text-sm text-slate-400">
          No templates yet — click <span className="font-semibold">Add template</span> to upload a
          PNG or PDF.
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
        <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
          <p className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Coupons ({coupons.length})
          </p>
          {coupons.length === 0 ? (
            <p className="px-2 py-6 text-center text-sm text-slate-400">No coupons yet.</p>
          ) : (
            <ul className="space-y-1">
              {coupons.map((c) => {
                const active = c.id === selectedId;
                return (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(c.id)}
                      className={`flex w-full items-start gap-2 rounded-xl px-3 py-2.5 text-left transition-colors ${
                        active
                          ? 'bg-[#14142b] text-white'
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <Ticket size={16} className="mt-0.5 shrink-0" />
                      <span className="min-w-0">
                        <span className="block truncate text-[13px] font-semibold">{c.name}</span>
                        <span
                          className={`block truncate font-mono text-[11px] ${
                            active ? 'text-white/70' : 'text-slate-400'
                          }`}
                        >
                          {c.code}
                          {c.expiresAt
                            ? ` · exp ${new Date(c.expiresAt).toLocaleDateString()}`
                            : ''}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="space-y-4">
          {selected ? (
            <>
              <CouponTicket
                title={selected.name}
                code={selected.code}
                tags={[
                  selected.discountType,
                  selected.currency,
                  selected.expiresAt
                    ? `Expires ${new Date(selected.expiresAt).toLocaleDateString()}`
                    : 'No expiry',
                ]}
                subtitle={selected.description || 'Coupon ticket'}
                offerLabel="Discount"
                offerValue={formatOfferValue(
                  selected.discountType,
                  selected.discountValue,
                  selected.currency,
                )}
                secondaryLabel="Code"
                secondaryValue={selected.code}
                referenceId={selected.id.slice(0, 8).toUpperCase()}
                qrImageUrl={
                  issued.find((i) => i.qrImageUrl)
                    ? resolveQrUrl(issued.find((i) => i.qrImageUrl)!.qrImageUrl)
                    : null
                }
                scanHint="SCAN QR CODE TO REDEEM"
              />

              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-sm text-slate-600">
                  Issue to generate a QR. After generation, download the coupon as PNG.
                </p>
                <button
                  type="button"
                  onClick={() => setIssueOpen(true)}
                  className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-[#00BAF2] px-3.5 py-2 text-sm font-semibold text-white hover:bg-[#00a5d8]"
                >
                  <UserPlus size={16} /> Issue &amp; generate
                </button>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="mb-4 text-sm font-bold text-[#14142b]">
                  Generated coupons ({issued.length})
                </h3>
                {issuedLoading ? (
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Loader2 className="animate-spin" size={14} /> Loading…
                  </div>
                ) : issued.length === 0 ? (
                  <p className="text-sm text-slate-400">None generated yet.</p>
                ) : (
                  <ul className="divide-y divide-slate-100">
                    {issued.map((uc) => (
                      <li
                        key={uc.id}
                        className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                      >
                        <button
                          type="button"
                          onClick={() => router.push(`/console/coupons/issued/${uc.id}`)}
                          className="min-w-0 text-left"
                        >
                          <p className="truncate text-sm font-semibold text-slate-800">
                            {uc.id.slice(0, 8).toUpperCase()} · {uc.status}
                          </p>
                          <p className="truncate text-xs text-slate-400">
                            {uc.qrImageUrl ? 'PNG ready' : 'QR pending'}
                            {uc.expiresAt
                              ? ` · expires ${new Date(uc.expiresAt).toLocaleDateString()}`
                              : ''}
                          </p>
                        </button>
                        {uc.qrImageUrl ? (
                          <button
                            type="button"
                            disabled={busyId === uc.id}
                            onClick={() => handleDownloadPng(uc.id)}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-[#14142b] px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-[#232735] disabled:opacity-50"
                          >
                            {busyId === uc.id ? (
                              <Loader2 className="animate-spin" size={12} />
                            ) : (
                              <Download size={12} />
                            )}
                            Download PNG
                          </button>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white/70 px-6 py-16 text-center text-sm text-slate-400">
              Create a coupon to get started.
            </div>
          )}
        </div>
      </div>

      {templateOpen ? (
        <Modal title="Add template" onClose={() => setTemplateOpen(false)}>
          <form onSubmit={handleUploadTemplate} className="space-y-4">
            <Field label="Template name">
              <input
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                className={inputCls}
                placeholder="Summer banner"
              />
            </Field>
            <Field label="File (PNG, JPG, WEBP, GIF, or PDF)">
              <input
                required
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif,application/pdf"
                onChange={(e) => setTemplateFile(e.target.files?.[0] ?? null)}
                className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-[#14142b]"
              />
            </Field>
            <p className="text-xs text-slate-500">You can add multiple templates and reuse them.</p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setTemplateOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving || !templateFile}
                className="inline-flex items-center gap-2 rounded-lg bg-[#14142b] px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
              >
                {saving ? <Loader2 className="animate-spin" size={14} /> : <Upload size={14} />}
                Upload
              </button>
            </div>
          </form>
        </Modal>
      ) : null}

      {createOpen ? (
        <Modal title="Create coupon" onClose={() => setCreateOpen(false)}>
          <form onSubmit={handleCreate} className="space-y-4">
            <Field label="Template">
              <select
                required
                value={form.templateId}
                onChange={(e) => setForm((f) => ({ ...f, templateId: e.target.value }))}
                className={inputCls}
              >
                <option value="">Select template…</option>
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.contentType.split('/')[1] || t.contentType})
                  </option>
                ))}
              </select>
            </Field>
            {templates.length === 0 ? (
              <p className="text-xs text-amber-600">
                Upload a template first with <strong>Add template</strong>.
              </p>
            ) : null}
            <Field label="Name">
              <input
                required
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className={inputCls}
                placeholder="Summer discount"
              />
            </Field>
            <Field label="Description">
              <textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                className={inputCls}
                rows={2}
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Type">
                <select
                  value={form.discountType}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      discountType: e.target.value as 'PERCENT' | 'FIXED',
                    }))
                  }
                  className={inputCls}
                >
                  <option value="PERCENT">Percent</option>
                  <option value="FIXED">Fixed amount</option>
                </select>
              </Field>
              <Field label="Value">
                <input
                  required
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.discountValue}
                  onChange={(e) => setForm((f) => ({ ...f, discountValue: e.target.value }))}
                  className={inputCls}
                />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Currency">
                <input
                  value={form.currency}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, currency: e.target.value.toUpperCase() }))
                  }
                  className={inputCls}
                  maxLength={3}
                />
              </Field>
              <Field label="Valid until (expires)">
                <input
                  required
                  type="date"
                  value={form.expiresAt}
                  min={new Date().toISOString().slice(0, 10)}
                  onChange={(e) => setForm((f) => ({ ...f, expiresAt: e.target.value }))}
                  className={inputCls}
                />
              </Field>
            </div>
            <Field label="Quantity">
              <input
                required
                type="number"
                min={1}
                max={100}
                value={form.quantity}
                onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))}
                className={inputCls}
              />
              <p className="mt-1 text-[11px] text-slate-400">
                Each coupon gets a unique code automatically (e.g. ARC-K7M2P9QX).
              </p>
            </Field>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCreateOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving || templates.length === 0}
                className="inline-flex items-center gap-2 rounded-lg bg-[#14142b] px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
              >
                {saving ? <Loader2 className="animate-spin" size={14} /> : null}
                {Number(form.quantity) > 1
                  ? `Create ${form.quantity} coupons`
                  : 'Create coupon'}
              </button>
            </div>
          </form>
        </Modal>
      ) : null}

      {issueOpen && selected ? (
        <Modal title={`Issue “${selected.name}”`} onClose={() => setIssueOpen(false)}>
          <form onSubmit={handleIssue} className="space-y-4">
            <Field label="Recipient">
              <select
                required
                value={recipientId}
                onChange={(e) => setRecipientId(e.target.value)}
                className={inputCls}
              >
                <option value="">Select user…</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.fullName || u.username || u.email || u.id}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Quantity">
              <input
                required
                type="number"
                min={1}
                max={100}
                value={issueQuantity}
                onChange={(e) => setIssueQuantity(e.target.value)}
                className={inputCls}
              />
              <p className="mt-1 text-[11px] text-slate-400">
                Issues this many coupons — each gets a unique code and QR.
              </p>
            </Field>
            <p className="text-xs text-slate-500">
              You can download each coupon as PNG from the generated list.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIssueOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving || !recipientId}
                className="inline-flex items-center gap-2 rounded-lg bg-[#00BAF2] px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
              >
                {saving ? <Loader2 className="animate-spin" size={14} /> : null}
                {Number(issueQuantity) > 1
                  ? `Generate ${issueQuantity} coupons`
                  : 'Generate coupon'}
              </button>
            </div>
          </form>
        </Modal>
      ) : null}
    </div>
  );
}

const inputCls =
  'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-[#14142b] focus:ring-2 focus:ring-[#14142b]/10';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-semibold text-slate-500">{label}</span>
      {children}
    </label>
  );
}

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close dialog"
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />
      <div className="relative z-10 max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-5 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-bold text-[#14142b]">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
