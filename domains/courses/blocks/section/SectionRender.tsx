import type { BlockRenderProps } from "../types";

export function SectionRender({ node, children }: BlockRenderProps) {
  const backgroundImage =
    typeof node.attrs?.backgroundImage === "string" ? node.attrs.backgroundImage : null;
  const overlayOpacity =
    typeof node.attrs?.overlayOpacity === "number" ? node.attrs.overlayOpacity : 0.35;
  const focalPoint = typeof node.attrs?.focalPoint === "string" ? node.attrs.focalPoint : "center";
  const minHeight = typeof node.attrs?.minHeight === "number" ? node.attrs.minHeight : 240;

  if (!backgroundImage) {
    return <div className="mb-4">{children}</div>;
  }

  return (
    <div
      className="relative mb-4 flex flex-col justify-center overflow-hidden rounded-lg bg-cover bg-gray-900 p-6"
      style={{
        minHeight,
        backgroundImage: `url(${backgroundImage})`,
        backgroundPosition: `center ${focalPoint}`,
      }}
    >
      <div className="pointer-events-none absolute inset-0 bg-black" style={{ opacity: overlayOpacity }} />
      <div className="relative z-[1] text-white [&_a]:text-white [&_a]:underline">{children}</div>
    </div>
  );
}
