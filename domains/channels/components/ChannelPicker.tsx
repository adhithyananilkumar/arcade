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
 * Content-creation channel picker — every course/roadmap/workshop must belong to exactly one
 * channel (see ContentItem's ownership docs). Only rendered when the caller has more than one
 * eligible channel; with exactly one, callers should auto-select it and skip showing this at all.
 */
export function ChannelPicker({ channels, value, onChange, label = 'Channel' }: ChannelPickerProps) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">
        {label} <span className="text-red-500">*</span>
      </label>
      <Select value={value} onValueChange={(v) => onChange(v ?? '')}>
        <SelectTrigger className="w-full">
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
