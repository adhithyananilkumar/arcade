// We use /search for the internal (authenticated) Explore Hub because Next.js App Router 
// does not allow two route groups to resolve to the same path (e.g. /explore in public and authenticated).
// Thus, the internal Explore feature maps to the /search URL to avoid route collisions.
import ExploreHub from "@/apps/core/components/ExploreHub";

export default function ExplorePage() {
  return <ExploreHub />;
}
