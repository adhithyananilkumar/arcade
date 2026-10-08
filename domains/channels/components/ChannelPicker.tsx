'use client';

import { Channel } from '../api/channel.service';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/shared/design-system/ui/select';

interface ChannelPickerProps {
  channels: Channel[];
  value: string;
  onChange: (channelId: string) => void;
  label?: string;
}

/**
 * Content-creation channel picker — every course/workshop must belong to exactly one
 * channel (see ContentItem's ownership docs). Only rendered when the caller has more than one
 * eligible channel; with exactly one, callers should auto-select it and skip showing this at all.
 */
export function ChannelPicker({ channels, value, onChange, label = 'Channel' }: ChannelPickerProps) {
  return (
    <div>
      <label className="mb-1.5 block text-[13px] font-semibold text-ink">
        {label} <span className="text-red-500">*</span>
      </label>
      <Select value={value} onValueChange={(v) => onChange(v ?? '')}>
        {/* Sized like the text fields beside it, with a hover state and a clear chevron, so it reads
          as a dropdown rather than another text box (BUG-1033). */}
        <SelectTrigger className="h-auto w-full cursor-pointer rounded-xl border-slate-200 bg-slate-50/50 px-3.5 py-2.5 hover:border-slate-300 hover:bg-surface [&>svg]:size-[18px] [&>svg]:text-slate-500">
          {value ? (
            <span className="flex flex-1 text-left line-clamp-1">
              {(() => {
                const c = channels.find(ch => ch.id === value);
                return c ? (c.isPersonal ? 'Personal' : c.name) : value;
              })()}
            </span>
          ) : (
            <SelectValue placeholder="Select a channel..." />
          )}
        </SelectTrigger>
        <SelectContent>
          {channels.map((channel) => (
            <SelectItem key={channel.id} value={channel.id}>
              {channel.isPersonal ? 'Personal' : channel.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
