/**
 * ArcadeScene — layout-only component.
 * Animation is driven externally by IntroScreen's imperative timeline.
 */
export function ArcadeScene({
  tagline = "Empowering Innovation. Building Communities.",
}: {
  tagline?: string;
}) {
  return (
    <>
      <img
        src="/arcade.svg"
        alt="Arcade"
        style={{
          width: "min(270px, 62vw)",
          height: "auto",
          objectFit: "contain",
          display: "block",
          filter: "drop-shadow(0 8px 32px rgba(0,0,0,0.08))",
        }}
      />
      <p
        style={{
          fontSize: 9.5,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: "#b8b8b8",
          fontFamily:
            "var(--font-geist-sans), system-ui, -apple-system, sans-serif",
          fontWeight: 400,
          margin: 0,
        }}
      >
        {tagline}
      </p>
    </>
  );
}
