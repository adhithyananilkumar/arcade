// We use /search for the internal (authenticated) Explore Hub because Next.js App Router 
// does not allow two route groups to resolve to the same path (e.g. /explore in public and authenticated).
// Thus, the internal Explore feature maps to the /search URL to avoid route collisions.
import ExploreHubPage from "@/app/(public)/explore/page";

export default function ExplorePage() {
  return <ExploreHubPage />;
}
