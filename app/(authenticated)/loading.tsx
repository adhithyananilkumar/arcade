import { PageLoader } from "@/shared/design-system/ui/loader";

// The signed-in app's default while a page is on its way. Pages with a recognisable shape keep a
// skeleton of their own (home, explore, profiles); everything else waits on the same loader.
export default function AuthenticatedLoading() {
  return <PageLoader />;
}
