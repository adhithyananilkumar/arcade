/**
 * AjceScene — layout-only component.
 * Animation is driven externally by IntroScreen's imperative timeline.
 * Wrap with a ref and animate via useAnimate in IntroScreen.
 */
export function AjceScene() {
  return (
    <>
      <img
        src="/amaljyothi-logo.svg"
        alt="Amal Jyothi College of Engineering"
        style={{
          width: 92,
          height: 92,
          objectFit: "contain",
          display: "block",
          filter: "drop-shadow(0 6px 24px rgba(0,0,0,0.07))",
        }}
      />
      <img
        src="/amaljyothi-typo.svg"
        alt="Amal Jyothi"
        style={{
          width: "min(460px, 84vw)",
          height: "auto",
          objectFit: "contain",
          display: "block",
          filter: "drop-shadow(0 2px 12px rgba(0,0,0,0.04))",
        }}
      />
    </>
  );
}
