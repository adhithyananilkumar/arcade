import type { BlockRenderProps } from "../types";

export function ButtonRender({ node }: BlockRenderProps) {
  const label = typeof node.attrs?.label === "string" && node.attrs.label ? node.attrs.label : "Click me";
  const url = typeof node.attrs?.url === "string" ? node.attrs.url : "";
  const variant = node.attrs?.variant === "secondary" ? "secondary" : "primary";

  const className =
    variant === "primary"
      ? "inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700"
      : "inline-flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-800 shadow-sm transition-colors hover:bg-gray-50";

  if (!url) {
    return (
      <div className="mb-4">
        <span className={`${className} cursor-not-allowed opacity-60`}>{label}</span>
      </div>
    );
  }

  return (
    <div className="mb-4">
      <a href={url} target="_blank" rel="noopener noreferrer" className={className}>
        {label}
      </a>
    </div>
  );
}
