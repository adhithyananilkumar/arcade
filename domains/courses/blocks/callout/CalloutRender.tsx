import type { BlockRenderProps } from "../types";
import { CALLOUT_ICON, CALLOUT_STYLE, toCalloutVariant } from "./shared";

export function CalloutRender({ node, children }: BlockRenderProps) {
  const variant = toCalloutVariant(node.attrs?.variant);
  const style = CALLOUT_STYLE[variant];
  const Icon = CALLOUT_ICON[variant];

  return (
    <div className={`mb-4 flex items-start gap-2.5 rounded-lg border px-4 py-3 ${style.wrap}`}>
      <Icon size={18} className={`mt-0.5 shrink-0 ${style.icon}`} />
      <div className="min-w-0 flex-1 text-sm text-gray-800 [&>p:last-child]:mb-0">{children}</div>
    </div>
  );
}
