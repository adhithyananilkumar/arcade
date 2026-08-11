'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Check,
  Plus,
  TicketPercent,
  LayoutTemplate,
  Download,
  Pencil,
} from 'lucide-react';
import { notFound } from 'next/navigation';
import { useAuthStore } from '@/infrastructure/auth/auth.store';
import { AuthorizationService } from '@/infrastructure/auth/authorization.service';
import {
  couponService,
  CouponBatch,
  BatchStatus,
  Coupon,
} from '@/domains/coupons/services/couponService';
import { CouponVisualCard } from '@/components/coupons/CouponVisualCard';
import { IssueCouponToUser } from '@/components/coupons/IssueCouponToUser';
import {
  CouponTheme,
  COUPON_THEME_PRESETS,
  DEFAULT_COUPON_THEME,
  resolveCouponTheme,
} from '@/domains/coupons/theme';

type DiscountType = 'PERCENTAGE' | 'FLAT_AMOUNT';
type ConsoleTab = 'CREATE' | 'TEMPLATES';

type CouponTemplate = {
  id: string;
  name: string;
  description: string;
  discountType: DiscountType;
  discountValue: number;
  codePrefix: string;
  theme: CouponTheme;
  builtin?: boolean;
};

const DEFAULT_TEMPLATES: CouponTemplate[] = [
  {
    id: 'tpl-summer-percent',
    name: 'Summer Sale 15%',
    description: 'Percentage discount for seasonal campaigns',
    discountType: 'PERCENTAGE',
    discountValue: 15,
    codePrefix: 'SUMMER',
    theme: COUPON_THEME_PRESETS[0].theme,
    builtin: true,
  },
  {
    id: 'tpl-flat-welcome',
    name: 'Welcome $10 Off',
    description: 'Flat amount welcome offer for new users',
    discountType: 'FLAT_AMOUNT',
    discountValue: 10,
    codePrefix: 'WELCOME',
    theme: COUPON_THEME_PRESETS[1].theme,
    builtin: true,
  },
];

const TEMPLATES_STORAGE_KEY = 'arcade.console.couponTemplates.v2';

function normalizeTemplate(raw: Partial<CouponTemplate> & { id: string; name: string }): CouponTemplate {
  return {
    id: raw.id,
    name: raw.name,
    description: raw.description ?? '',
    discountType: raw.discountType ?? 'PERCENTAGE',
    discountValue: raw.discountValue ?? 10,
    codePrefix: raw.codePrefix ?? 'PROMO',
    theme: resolveCouponTheme(raw.theme),
    builtin: raw.builtin,
  };
}

function loadTemplates(): CouponTemplate[] {
  if (typeof window === 'undefined') return DEFAULT_TEMPLATES;
  try {
    const raw = localStorage.getItem(TEMPLATES_STORAGE_KEY);
    if (!raw) return DEFAULT_TEMPLATES;
    const custom = JSON.parse(raw) as Partial<CouponTemplate>[];
    if (!Array.isArray(custom)) return DEFAULT_TEMPLATES;
    const builtinIds = new Set(DEFAULT_TEMPLATES.map((t) => t.id));
    const normalizedCustom = custom
      .filter((t): t is Partial<CouponTemplate> & { id: string; name: string } => !!t?.id && !!t?.name)
      .filter((t) => !builtinIds.has(t.id))
      .map((t) => normalizeTemplate(t));
    return [...DEFAULT_TEMPLATES, ...normalizedCustom];
  } catch {
    return DEFAULT_TEMPLATES;
  }
}

function saveCustomTemplates(all: CouponTemplate[]) {
  const custom = all.filter((t) => !t.builtin).map((t) => ({ ...t, theme: resolveCouponTheme(t.theme) }));
  localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(custom));
}

function ThemePalettePicker({
  theme,
  onChange,
}: {
  theme: CouponTheme;
  onChange: (theme: CouponTheme) => void;
}) {
  const resolved = resolveCouponTheme(theme);

  return (
    <div className="space-y-3">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
        Color palette
      </p>
      <div className="flex flex-wrap gap-2">
        {COUPON_THEME_PRESETS.map((preset) => {
          const active =
            resolved.backgroundFrom === preset.theme.backgroundFrom &&
            resolved.accent === preset.theme.accent;
          return (
            <button
              key={preset.id}
              type="button"
              title={preset.name}
              onClick={() => onChange(preset.theme)}
              className={`h-9 w-9 overflow-hidden rounded-full border-2 transition ${
                active ? 'border-[#14142b] scale-110' : 'border-white shadow-sm hover:scale-105'
              }`}
              style={{
                background: `linear-gradient(135deg, ${preset.theme.backgroundFrom}, ${preset.theme.backgroundTo})`,
              }}
            />
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {(
          [
            ['backgroundFrom', 'Background A'],
            ['backgroundTo', 'Background B'],
            ['accent', 'Accent'],
            ['textColor', 'Text'],
          ] as const
        ).map(([key, label]) => (
          <label key={key} className="block text-[11px] font-semibold text-slate-500">
            {label}
            <input
              type="color"
              value={resolved[key]}
              onChange={(e) => onChange({ ...resolved, [key]: e.target.value })}
              className="mt-1 h-10 w-full cursor-pointer rounded-lg border border-slate-200 bg-white p-1"
            />
          </label>
        ))}
      </div>
    </div>
  );
}

export default function ConsoleCouponsPage() {
  const { user } = useAuthStore();

  if (!AuthorizationService.canAccessConsole(user)) {
    notFound();
  }

  const [tab, setTab] = useState<ConsoleTab>('CREATE');
  const [templates, setTemplates] = useState<CouponTemplate[]>(DEFAULT_TEMPLATES);
  const [selectedTemplateId, setSelectedTemplateId] = useState(DEFAULT_TEMPLATES[0].id);
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);

  const [draftName, setDraftName] = useState('');
  const [draftDescription, setDraftDescription] = useState('');
  const [draftDiscountType, setDraftDiscountType] = useState<DiscountType>('PERCENTAGE');
  const [draftDiscountValue, setDraftDiscountValue] = useState(20);
  const [draftPrefix, setDraftPrefix] = useState('');
  const [draftTheme, setDraftTheme] = useState<CouponTheme>(DEFAULT_COUPON_THEME);

  const [count, setCount] = useState(10);
  const [discountType, setDiscountType] = useState<DiscountType>('PERCENTAGE');
  const [discountValue, setDiscountValue] = useState(15);
  const [codePrefix, setCodePrefix] = useState('SUMMER');
  const [merchantId, setMerchantId] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [activeTheme, setActiveTheme] = useState<CouponTheme>(DEFAULT_TEMPLATES[0].theme);

  const [loading, setLoading] = useState(false);
  const [activeBatchId, setActiveBatchId] = useState<string | null>(null);
  const [batchStatus, setBatchStatus] = useState<BatchStatus | null>(null);
  const [batchData, setBatchData] = useState<CouponBatch | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setTemplates(loadTemplates());
  }, []);

  const selectedTemplate = useMemo(
    () => templates.find((t) => t.id === selectedTemplateId) ?? templates[0],
    [templates, selectedTemplateId],
  );

  useEffect(() => {
    if (!selectedTemplate) return;
    setDiscountType(selectedTemplate.discountType);
    setDiscountValue(selectedTemplate.discountValue);
    setCodePrefix(selectedTemplate.codePrefix);
    setActiveTheme(resolveCouponTheme(selectedTemplate.theme));
  }, [selectedTemplate]);

  useEffect(() => {
    if (!activeBatchId) return;
    let timeoutId: ReturnType<typeof setTimeout>;

    const checkStatus = async () => {
      try {
        const status = await couponService.getBatchStatus(activeBatchId);
        setBatchStatus(status);
        if (status.status === 'COMPLETED') {
          const details = await couponService.getBatchDetails(activeBatchId);
          setBatchData(details);
          setLoading(false);
        } else if (status.status === 'FAILED') {
          setError('Batch generation failed.');
          setLoading(false);
        } else {
          timeoutId = setTimeout(checkStatus, 1500);
        }
      } catch {
        setError('Failed to fetch batch status.');
        setLoading(false);
      }
    };

    void checkStatus();
    return () => clearTimeout(timeoutId);
  }, [activeBatchId]);

  const openCreateTemplate = () => {
    setEditingTemplateId(null);
    setDraftName('');
    setDraftDescription('');
    setDraftDiscountType('PERCENTAGE');
    setDraftDiscountValue(20);
    setDraftPrefix('');
    setDraftTheme(DEFAULT_COUPON_THEME);
    setTab('TEMPLATES');
  };

  const openEditTemplate = (tpl: CouponTemplate) => {
    setEditingTemplateId(tpl.id);
    setDraftName(tpl.name);
    setDraftDescription(tpl.description);
    setDraftDiscountType(tpl.discountType);
    setDraftDiscountValue(tpl.discountValue);
    setDraftPrefix(tpl.codePrefix);
    setDraftTheme(resolveCouponTheme(tpl.theme));
    setTab('TEMPLATES');
  };

  const handleSaveTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draftName.trim()) return;

    const editing = editingTemplateId
      ? templates.find((t) => t.id === editingTemplateId)
      : undefined;

    // Editing a builtin creates a custom clone so defaults stay intact.
    const id =
      !editingTemplateId || editing?.builtin
        ? `tpl-custom-${Date.now()}`
        : editingTemplateId;

    const payload: CouponTemplate = {
      id,
      name: draftName.trim(),
      description: draftDescription.trim() || 'Custom template',
      discountType: draftDiscountType,
      discountValue: draftDiscountValue,
      codePrefix: draftPrefix.trim().toUpperCase() || 'PROMO',
      theme: resolveCouponTheme(draftTheme),
      builtin: false,
    };

    const next =
      editing && !editing.builtin
        ? templates.map((t) => (t.id === editingTemplateId ? payload : t))
        : [...templates.filter((t) => t.id !== payload.id), payload];

    setTemplates(next);
    saveCustomTemplates(next);
    setSelectedTemplateId(payload.id);
    setEditingTemplateId(null);
    setTab('CREATE');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setBatchData(null);
    setBatchStatus(null);
    setActiveBatchId(null);

    try {
      const themeSnapshot = resolveCouponTheme(activeTheme);
      const res = await couponService.createBulk({
        count,
        discountType,
        discountValue,
        codePrefix: codePrefix || undefined,
        merchantId: merchantId.trim() || undefined,
        expiresAt: expiresAt ? new Date(expiresAt).toISOString() : undefined,
        theme: themeSnapshot,
      });

      if ('batchId' in res) {
        setActiveBatchId(res.batchId);
        setBatchStatus(res);
      } else {
        setBatchData(res);
        setLoading(false);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to create coupons.');
      setLoading(false);
    }
  };

  const previewTheme = tab === 'TEMPLATES' ? draftTheme : activeTheme;
  const previewDiscountType = tab === 'TEMPLATES' ? draftDiscountType : discountType;
  const previewDiscountValue = tab === 'TEMPLATES' ? draftDiscountValue : discountValue;
  const previewCode =
    tab === 'TEMPLATES'
      ? `${(draftPrefix || 'PROMO').toUpperCase()}-A3K9P2`
      : `${(codePrefix || 'PROMO').toUpperCase()}-A3K9P2`;

  return (
    <div className="w-full space-y-5">
      <div className="flex flex-wrap gap-1 rounded-full border border-slate-200/80 bg-white/90 p-1 shadow-[0_4px_14px_rgba(20,20,43,0.04)]">
        <button
          type="button"
          onClick={() => setTab('CREATE')}
          className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[12px] font-semibold transition-all ${
            tab === 'CREATE'
              ? 'bg-[#14142b] text-white shadow-sm'
              : 'text-slate-500 hover:bg-slate-50 hover:text-[#14142b]'
          }`}
        >
          <TicketPercent size={14} />
          Create
        </button>
        <button
          type="button"
          onClick={() => openCreateTemplate()}
          className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[12px] font-semibold transition-all ${
            tab === 'TEMPLATES'
              ? 'bg-[#14142b] text-white shadow-sm'
              : 'text-slate-500 hover:bg-slate-50 hover:text-[#14142b]'
          }`}
        >
          <LayoutTemplate size={14} />
          Templates
        </button>
      </div>

      {tab === 'CREATE' && (
        <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-5 shadow-[0_4px_14px_rgba(20,20,43,0.04)] sm:p-6">
          <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-[#14142b]">Coupon creation</h1>
              <p className="mt-1 text-[13px] text-slate-500">
                Pick a template, then generate one-time QR coupons. Theme colors are snapshotted onto
                each coupon at generation time.
              </p>
            </div>
            <button
              type="button"
              onClick={openCreateTemplate}
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[12px] font-semibold text-[#14142b] hover:bg-slate-50"
            >
              <Plus size={14} />
              Add template
            </button>
          </div>

          <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {templates.map((tpl) => {
              const active = selectedTemplateId === tpl.id;
              const theme = resolveCouponTheme(tpl.theme);
              return (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => setSelectedTemplateId(tpl.id)}
                  className={`rounded-xl border p-4 text-left transition-all ${
                    active
                      ? 'border-[#14142b] shadow-[0_8px_18px_rgba(20,20,43,0.12)]'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div
                    className="mb-3 h-2 w-full rounded-full"
                    style={{
                      background: `linear-gradient(90deg, ${theme.backgroundFrom}, ${theme.backgroundTo})`,
                    }}
                  />
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-[14px] font-semibold text-[#14142b]">{tpl.name}</p>
                      <p className="mt-1 text-[12px] text-slate-500">{tpl.description}</p>
                    </div>
                    {active && (
                      <span className="grid size-6 place-items-center rounded-full bg-[#14142b] text-white">
                        <Check size={14} />
                      </span>
                    )}
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <p className="text-[12px] font-mono text-slate-600">
                      {tpl.discountType === 'PERCENTAGE'
                        ? `${tpl.discountValue}%`
                        : `$${tpl.discountValue}`}{' '}
                      · {tpl.codePrefix}-XXXXXX
                    </p>
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditTemplate(tpl);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.stopPropagation();
                          openEditTemplate(tpl);
                        }
                      }}
                      className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-2 py-1 text-[10px] font-semibold text-slate-500 hover:bg-white"
                    >
                      <Pencil size={10} />
                      Edit
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mb-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
            <ThemePalettePicker theme={activeTheme} onChange={setActiveTheme} />
            <CouponVisualCard
              code={previewCode}
              discountType={previewDiscountType}
              discountValue={previewDiscountValue}
              theme={previewTheme}
              merchantId={merchantId || undefined}
              expiresAt={expiresAt ? new Date(expiresAt).toISOString() : undefined}
              compact
            />
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Count
              </label>
              <input
                type="number"
                min={1}
                max={5000}
                required
                value={count}
                onChange={(e) => setCount(parseInt(e.target.value) || 1)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-[13px] outline-none focus:border-[#14142b]"
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Discount type
              </label>
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value as DiscountType)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-[13px] outline-none focus:border-[#14142b]"
              >
                <option value="PERCENTAGE">Percentage (%)</option>
                <option value="FLAT_AMOUNT">Flat amount ($)</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Discount value
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={discountValue}
                onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-[13px] outline-none focus:border-[#14142b]"
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Code prefix
              </label>
              <input
                value={codePrefix}
                onChange={(e) => setCodePrefix(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-[13px] outline-none focus:border-[#14142b]"
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Merchant ID (optional)
              </label>
              <input
                value={merchantId}
                onChange={(e) => setMerchantId(e.target.value)}
                placeholder="UUID"
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-[13px] outline-none focus:border-[#14142b]"
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Expiry (optional)
              </label>
              <input
                type="datetime-local"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-[13px] outline-none focus:border-[#14142b]"
              />
            </div>

            <div className="sm:col-span-2 lg:col-span-3">
              <button
                type="submit"
                disabled={loading}
                className="mt-1 rounded-full bg-[#14142b] px-5 py-2.5 text-[13px] font-semibold text-white shadow-[0_8px_18px_rgba(20,20,43,0.16)] disabled:opacity-50"
              >
                {loading ? 'Generating…' : `Generate ${count} coupons`}
              </button>
            </div>
          </form>

          {error && (
            <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-[13px] text-rose-700">
              {error}
            </div>
          )}

          {loading && batchStatus && (
            <div className="mt-4 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-[13px] text-indigo-800">
              Generating… {batchStatus.generatedCount}/{batchStatus.requestedCount} (
              {batchStatus.status})
            </div>
          )}
        </div>
      )}

      {tab === 'TEMPLATES' && (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <form
            onSubmit={handleSaveTemplate}
            className="rounded-2xl border border-slate-200/80 bg-white/90 p-5 shadow-[0_4px_14px_rgba(20,20,43,0.04)] sm:p-6 space-y-4"
          >
            <h2 className="text-lg font-bold text-[#14142b]">
              {editingTemplateId ? 'Edit template' : 'Add template'}
            </h2>
            <input
              required
              value={draftName}
              onChange={(e) => setDraftName(e.target.value)}
              placeholder="Template name"
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-[13px] outline-none focus:border-[#14142b]"
            />
            <input
              value={draftDescription}
              onChange={(e) => setDraftDescription(e.target.value)}
              placeholder="Short description"
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-[13px] outline-none focus:border-[#14142b]"
            />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <select
                value={draftDiscountType}
                onChange={(e) => setDraftDiscountType(e.target.value as DiscountType)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-[13px] outline-none focus:border-[#14142b]"
              >
                <option value="PERCENTAGE">Percentage (%)</option>
                <option value="FLAT_AMOUNT">Flat amount ($)</option>
              </select>
              <input
                type="number"
                step="0.01"
                required
                value={draftDiscountValue}
                onChange={(e) => setDraftDiscountValue(parseFloat(e.target.value) || 0)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-[13px] outline-none focus:border-[#14142b]"
              />
              <input
                value={draftPrefix}
                onChange={(e) => setDraftPrefix(e.target.value)}
                placeholder="Prefix"
                className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-[13px] outline-none focus:border-[#14142b]"
              />
            </div>

            <ThemePalettePicker theme={draftTheme} onChange={setDraftTheme} />

            <div className="flex gap-2 pt-1">
              <button
                type="submit"
                className="rounded-full bg-[#14142b] px-4 py-2 text-[12px] font-semibold text-white"
              >
                Save template
              </button>
              <button
                type="button"
                onClick={() => setTab('CREATE')}
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-[12px] font-semibold text-slate-600"
              >
                Cancel
              </button>
            </div>
          </form>

          <div>
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Live preview
            </p>
            <CouponVisualCard
              code={previewCode}
              discountType={previewDiscountType}
              discountValue={previewDiscountValue}
              theme={previewTheme}
            />
          </div>
        </div>
      )}

      {batchData && (
        <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-5 shadow-[0_4px_14px_rgba(20,20,43,0.04)] sm:p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-[#14142b]">Batch results</h2>
              <p className="text-[12px] font-mono text-slate-500">
                {batchData.id} · {batchData.coupons?.length ?? 0} coupons
              </p>
            </div>
            <a
              href={couponService.getExportUrl(batchData.id)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-2 text-[12px] font-semibold text-[#14142b] hover:bg-slate-50"
            >
              <Download size={14} />
              Export CSV
            </a>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {batchData.coupons?.map((coupon: Coupon) => (
              <div key={coupon.id} className="space-y-2">
                <CouponVisualCard
                  code={coupon.code}
                  discountType={coupon.discountType}
                  discountValue={Number(coupon.discountValue)}
                  qrImageUrl={coupon.qrImageUrl}
                  qrToken={coupon.qrToken}
                  theme={coupon.theme ?? activeTheme}
                  merchantId={coupon.merchantId}
                  expiresAt={coupon.expiresAt}
                  redeemed={coupon.redeemed}
                  compact
                />
                <IssueCouponToUser
                  couponCode={coupon.code}
                  issuedToLabel={coupon.issuedToLabel}
                  disabled={coupon.redeemed}
                  onIssued={(label, userId) => {
                    setBatchData((prev) => {
                      if (!prev?.coupons) return prev;
                      return {
                        ...prev,
                        coupons: prev.coupons.map((c) =>
                          c.id === coupon.id
                            ? {
                                ...c,
                                issuedToUserId: userId,
                                issuedToLabel: label,
                                issuedAt: new Date().toISOString(),
                              }
                            : c,
                        ),
                      };
                    });
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
