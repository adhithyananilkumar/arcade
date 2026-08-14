export interface Contributor {
  id: string;
  name: string;
  role: string;
  avatar: string;
  color: string;
  github?: string;
  linkedin?: string;
  journey?: string;
  milestones?: string[];
}

const defaultJourney = "Joined the Arcade core team to bridge the gap between academic theory and real-world software delivery. Instrumental in shaping the platform's vision, architecture, and overall execution strategy to empower the next generation of student developers.";
const defaultMilestones = [
  "Architected Arcade's core services & modular platform engine",
  "Pioneered digital credential verification pipelines",
  "Led system scaling to support thousands of active student developers"
];

export const CONTRIBUTORS_DATA: Contributor[] = [
  {
    id: "contributor-1",
    name: "Fr. Rubin Tottupuram",
    role: "Visionary & Leader",
    avatar: "/team/fr_rubin.png?v=2",
    color: "bg-[#ef5350]", // Lighter Red
    journey: "Guided the overarching vision and philosophical direction of Arcade. Focused on integrating holistic educational frameworks into a modern, scalable digital platform for students.",
    milestones: [
      "Established the foundational vision for the Arcade platform",
      "Fostered partnerships and institutional support",
      "Directed the integration of pedagogical best practices"
    ]
  },
  {
    id: "contributor-2",
    name: "Lisha Varghese",
    role: "Project Manager",
    avatar: "/team/lisha_varghese.png?v=2",
    color: "bg-[#f0f0f0]", // Lighter Gray
    journey: "Spearheaded project planning and agile delivery across all Arcade engineering pods. Ensured seamless collaboration between design, development, and content teams.",
    milestones: [
      "Streamlined agile workflows reducing delivery cycles by 30%",
      "Managed cross-functional teams of 20+ contributors",
      "Orchestrated the successful Beta launch of the platform"
    ]
  },
  {
    id: "contributor-3",
    name: "Amal K Jose",
    role: "Lead Developer",
    avatar: "/team/amal_jose.png?v=2",
    color: "bg-[#ffca28]", // Lighter Yellow
    journey: defaultJourney,
    milestones: defaultMilestones
  },
  {
    id: "contributor-4",
    name: "Merin Chacko",
    role: "Core Contributor",
    avatar: "/team/anna_christina.png", // Temporary placeholder to ensure design renders
    color: "bg-[#64b5f6]", // Light Blue
    journey: defaultJourney,
    milestones: defaultMilestones
  }
];

export interface OtherContributor {
  id: string;
  name: string;
  role: string;
  avatar: string;
  github?: string;
  linkedin?: string;
  journey?: string;
  milestones?: string[];
}

export const OTHER_CONTRIBUTORS_DATA: OtherContributor[] = [
  {
    id: "other-1",
    name: "Aibal Anil",
    role: "Core Contributor",
    avatar: "/team/aibal_anil.png",
    github: "https://github.com",
    linkedin: "https://linkedin.com",
    journey: defaultJourney,
    milestones: defaultMilestones
  },

  {
    id: "other-3",
    name: "Neeraj V V",
    role: "Core Contributor",
    avatar: "/team/neeraj_vv.png",
    github: "https://github.com",
    linkedin: "https://linkedin.com",
    journey: defaultJourney,
    milestones: defaultMilestones
  },
  {
    id: "other-4",
    name: "Theresa Rose Mathew",
    role: "Core Contributor",
    avatar: "/team/theresa_mathew.png",
    github: "https://github.com",
    linkedin: "https://linkedin.com",
    journey: defaultJourney,
    milestones: defaultMilestones
  },
  {
    id: "other-5",
    name: "Ann Mary Mathew",
    role: "Core Contributor",
    avatar: "/team/ann_mary.png?v=3",
    github: "https://github.com",
    linkedin: "https://linkedin.com",
    journey: defaultJourney,
    milestones: defaultMilestones
  }
];
