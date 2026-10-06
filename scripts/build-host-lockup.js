/**
 * Builds the host institution's lockup — the Amal Jyothi crest beside its name lettering — that
 * every certificate prints at the top right. Sources (in ui/public):
 *   - amaljyothi-logo.svg   the crest
 *   - amaljyothi-typo.svg   the lettering: AMAL JYOTHI / COLLEGE OF ENGINEERING / AUTONOMOUS / KANJIRAPPALLY
 * The lettering is cleaned for the certificate: the rule under AUTONOMOUS is dropped and
 * KANJIRAPPALLY is moved up to close the gap it left. Writes the result for both renderers:
 *   - backend/src/main/resources/pdf/brand/host-lockup.svg
 *   - ui/public/credentials/host-lockup.svg
 *
 * Run:  node ui/scripts/build-host-lockup.js
 */
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..", "..");
const read = (name) => fs.readFileSync(path.join(root, "ui", "public", name), "utf8");
/** The drawing inside an SVG file, without the XML prolog and the outer <svg> element. */
const inner = (svg) =>
  svg
    .replace(/<\?xml[^>]*\?>/, "")
    .replace(/<svg[^>]*>/, "")
    .replace(/<\/svg>\s*$/, "")
    // The sources carry 8 decimals; 2 is far below a printed dot at this size.
    .replace(/(\d+\.\d\d)\d+/g, "$1")
    .trim();

// The crest is drawn on a 2953-unit square.
const crest = inner(read("amaljyothi-logo.svg"));
const CREST = 2953;

// The lettering: drop the grey rule (the 4th path) and lift the grey KANJIRAPPALLY letters by 50.
let i = 0;
const lettering = inner(read("amaljyothi-typo.svg")).replace(/<path([^>]*)\/>/g, (all, attrs) => {
  const index = i++;
  if (index === 3) return "";
  return /fill="#5F5F61"/.test(attrs) ? `<g transform="translate(0 -50)">${all}</g>` : all;
});
// The lettering's ink, after the changes above, spans x 262–2692, y 222–1142 of its canvas.
const TEXT = { x: 262, y: 222, w: 2430, h: 920 };

// Compose on a 1000-unit-high canvas: the crest as a 1000 square, a gap, then the lettering at
// 80% of the crest's height, centred beside it — the crest leads. Whole units: the PDF renderer
// only accepts integer viewBoxes.
const H = 1000, GAP = 80, TEXT_HEIGHT = 800;
const textScale = TEXT_HEIGHT / TEXT.h;
const W = Math.ceil(H + GAP + TEXT.w * textScale);
const svg =
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}">` +
  `<g transform="scale(${H / CREST})">${crest}</g>` +
  `<g transform="translate(${H + GAP} ${(H - TEXT_HEIGHT) / 2}) scale(${textScale.toFixed(5)}) translate(${-TEXT.x} ${-TEXT.y})">${lettering}</g>` +
  `</svg>\n`;

for (const target of [
  path.join(root, "backend", "src", "main", "resources", "pdf", "brand", "host-lockup.svg"),
  path.join(root, "ui", "public", "credentials", "host-lockup.svg"),
]) {
  fs.writeFileSync(target, svg);
  console.log(`${path.relative(root, target)}  ${W}×${H}  ${(svg.length / 1024).toFixed(0)} KB`);
}
