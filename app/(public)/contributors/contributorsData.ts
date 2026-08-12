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
    color: "bg-[#ef5350]" // Lighter Red
  },
  {
    id: "contributor-2",
    name: "Lisha Varghese",
    role: "Project Manager",
    avatar: "/team/lisha_varghese.png",
    color: "bg-[#f0f0f0]" // Lighter Gray
  },
  {
    id: "contributor-3",
    name: "Amal K Jose",
    role: "Lead Developer",
    avatar: "/team/amal_jose.png",
    color: "bg-[#ffca28]" // Lighter Yellow
  }
];

export interface OtherContributor {
  id: string;
  name: string;
  role: string;
  avatar: string;
  github?: string;
  linkedin?: string;
}

export const OTHER_CONTRIBUTORS_DATA: OtherContributor[] = [
  {
    id: "other-1",
    name: "Aibal Anil",
    role: "Core Contributor",
    avatar: "/team/aibal_anil.png",
    github: "https://github.com",
    linkedin: "https://linkedin.com"
  },
  {
    id: "other-2",
    name: "Anna Christina Jhony",
    role: "Core Contributor",
    avatar: "/team/anna_christina.png",
    github: "https://github.com",
    linkedin: "https://linkedin.com"
  },
  {
    id: "other-3",
    name: "Neeraj V V",
    role: "Core Contributor",
    avatar: "/team/neeraj_vv.png",
    github: "https://github.com",
    linkedin: "https://linkedin.com"
  },
  {
    id: "other-4",
    name: "Theresa Rose Mathew",
    role: "Core Contributor",
    avatar: "/team/theresa_mathew.png",
    github: "https://github.com",
    linkedin: "https://linkedin.com"
  },
  {
    id: "other-5",
    name: "Ann Mary Mathew",
    role: "Core Contributor",
    avatar: "/team/ann_mary.png",
    github: "https://github.com",
    linkedin: "https://linkedin.com"
  }
];
