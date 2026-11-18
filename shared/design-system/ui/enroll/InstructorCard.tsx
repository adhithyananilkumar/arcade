'use client';

import type { ComponentType, CSSProperties, ReactNode } from 'react';
import { Briefcase } from 'lucide-react';
import { getAvatarUrl } from '@/shared/utils/avatar';
import { ChannelAvatar } from '../cards';

export interface InstructorStat {
  icon: ComponentType<{ size?: number; style?: CSSProperties }>;
  value: string | number;
  label: string;
  /** CSS colour for the icon. */
  color: string;
}

export interface InstructorCardProps {
  name: string;
  avatarUrl?: string | null;
  /** Job title or the person's role on this content ("Author", "Co-instructor", "Speaker"). */
  role?: string | null;
  username?: string | null;
  /** The channel that publishes the content; shown as a pill with its own icon. */
  channel?: { name: string; iconUrl?: string | null } | null;
  bio?: string | null;
  tags?: readonly string[];
  stats?: readonly InstructorStat[];
  /** A follow / view-profile button, supplied by the page that knows what it does. */
  action?: ReactNode;
}

function initialsOf(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

/** The person-and-channel card used on every enroll page's instructor / speaker tab. */
export function InstructorCard({
  name,
  avatarUrl,
  role,
  username,
  channel,
  bio,
  tags = [],
  stats = [],
  action,
}: InstructorCardProps) {
  const resolved = getAvatarUrl(avatarUrl);
  const channelIcon = channel ? (getAvatarUrl(channel.iconUrl) ?? channel.iconUrl) : null;
  const meta = [role, username ? `@${username}` : null].filter(Boolean) as string[];

  return (
    <div className="mx-auto w-full max-w-3xl rounded-3xl border border-line bg-paper p-6 sm:p-8">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-6">
        {resolved ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={resolved}
            alt={name}
            className="size-[72px] shrink-0 rounded-full border border-line object-cover"
          />
        ) : (
          <div
            aria-hidden="true"
            className="grid size-[72px] shrink-0 place-items-center rounded-full bg-blue text-2xl font-semibold text-white"
          >
            {initialsOf(name) || '?'}
          </div>
        )}

        <div className="min-w-0 flex-1">
          {channel?.name && (
            <div className="mb-2 inline-flex max-w-full items-center gap-1.5 rounded-full bg-purple/10 py-1 pl-1 pr-2.5 text-[12px] font-medium text-purple">
              <ChannelAvatar name={channel.name} iconUrl={channelIcon} size={18} />
              <span className="truncate">{channel.name}</span>
            </div>
          )}
          <h3 className="font-serif text-2xl font-light text-ink">{name}</h3>
          {meta.length > 0 && (
            <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-subtle">
              {meta.map((m, i) => (
                <span key={`${m}-${i}`} className="inline-flex items-center gap-1.5">
                  {i === 0 && <Briefcase size={13} />}
                  {m}
                  {i < meta.length - 1 && <span className="ml-1 text-subtle/40">·</span>}
                </span>
              ))}
            </p>
          )}
        </div>

        {action && <div className="shrink-0">{action}</div>}
      </div>

      {bio ? (
        <p className="mt-6 text-[15px] leading-relaxed text-subtle">{bio}</p>
      ) : (
        <p className="mt-6 text-sm italic text-subtle/70">{`${name} hasn't added a bio yet.`}</p>
      )}

      {tags.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          {tags.map((t) => (
            <span
              key={t}
              className="rounded-full border border-line bg-mist px-3 py-1.5 text-[12px] font-medium text-ink"
            >
              {t}
            </span>
          ))}
        </div>
      )}

      {stats.length > 0 && (
        <div className="mt-7 grid grid-cols-2 gap-3 border-t border-line pt-6 sm:grid-cols-4">
          {stats.map(({ icon: Icon, value, label, color }) => (
            <div key={label}>
              <Icon size={16} style={{ color }} />
              <p className="mt-2 font-serif text-xl font-medium text-ink">{value}</p>
              <p className="text-[12px] text-subtle">{label}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
