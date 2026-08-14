import { redirect } from "next/navigation";

// "My Events" has been fully removed as a product concept — its
// per-item event management functionality (stats, registrations,
// collaborators, publishing history) now lives at
// /studio/content/event/{id}. This route survives only as a legacy
// bookmark/link redirect, with no UI, business logic, or data fetching.
export default function MyEventsLegacyRedirect() {
  redirect("/studio");
}
