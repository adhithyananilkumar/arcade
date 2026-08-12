export interface Contributor {
  id: string;
  name: string;
  role: string;
  avatar: string;
  color: string;
  github?: string;
  linkedin?: string;
}

export const CONTRIBUTORS_DATA: Contributor[] = [
  {
    id: "contributor-1",
    name: "Fr. Rubin Tottupuram",
    role: "Visionary & Leader",
    avatar: "/team/fr_rubin.png",
    color: "bg-[#e53935]" // Red
  },
  {
    id: "contributor-2",
    name: "Lisha Varghese",
    role: "Project Manager",
    avatar: "/team/lisha_varghese.png",
    color: "bg-[#e0e0e0]" // Light Gray
  },
  {
    id: "contributor-3",
    name: "Amal K Jose",
    role: "Lead Developer",
    avatar: "/team/amal_jose.png",
    color: "bg-[#ffb300]" // Yellow
  }
];
