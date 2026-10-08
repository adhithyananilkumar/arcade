import { PageLoader } from "@/shared/design-system/ui/loader";

// The event editor is an immersive route with no navbar: a small corner label here read as a
// blank page while the editor loaded. Centred on the full area instead.
export default function EventsLoading() {
  return <PageLoader label="Opening event…" />;
}
