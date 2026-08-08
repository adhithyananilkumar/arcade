export interface Founder {
  id: string;
  name: string;
  role: string;
  tagline: string;
  image: string;
  bio: string;
  extendedBio: string;
  quote: string;
  achievements: string[];
  skills: string[];
  social: {
    linkedin?: string;
    github?: string;
    twitter?: string;
    email?: string;
  };
}

export interface Milestone {
  year: string;
  title: string;
  subtitle: string;
  description: string;
  badge: string;
  iconName: "spark" | "code" | "rocket" | "globe";
}

export const FOUNDERS_DATA: Founder[] = [
  {
    id: "founder-1",
    name: "Alex Varghese",
    role: "Founder & Lead Architect",
    tagline: "Building scalable academic technology for the next generation of engineers.",
    image: "/founders/founder_1.png",
    bio: "Passionate software architect and engineering lead at AJCE who spearheaded the core system design of Arcade.",
    extendedBio: "Alex conceived Arcade after observing the fragmentations in modern campus learning tools. With a strong foundation in full-stack architecture, distributed systems, and modern UI engineering, Alex engineered Arcade's core modular architecture, ensuring sub-second page performance, verifiable certification pipelines, and real-time collaborative workshops.",
    quote: "Education shouldn't just be delivered; it should inspire curiosity, reward execution, and be built on transparent, verifiable trust.",
    achievements: [
      "Architected the micro-services & modular component engine powering Arcade",
      "Pioneered the digital credential verification pipeline at AJCE",
      "Led the initial technical blueprint and 0-to-1 platform launch"
    ],
    skills: ["System Architecture", "Next.js & React", "Cloud Infrastructure", "DevOps", "EdTech Innovation"],
    social: {
      linkedin: "https://linkedin.com",
      github: "https://github.com",
      twitter: "https://twitter.com",
      email: "alex@arcade.ajce.in"
    }
  },
  {
    id: "founder-2",
    name: "Dr. Maya Kurian",
    role: "Co-Founder & Academic Lead",
    tagline: "Bridging institutional academic standards with modern interactive learning experiences.",
    image: "/founders/founder_2.png",
    bio: "Senior educator & academic strategist focused on digital curriculum transformation and student engagement.",
    extendedBio: "Dr. Maya brings over 12 years of academic leadership and curriculum development experience at Amal Jyothi College of Engineering. She championed the pedagogical framework behind Arcade, ensuring that every workshop, hackathon, and certified course aligns with NAAC A+ standards and KIRF top-ranking excellence.",
    quote: "When students are given intuitive tools that mirror real industry workflows, learning becomes an empowering adventure rather than a requirement.",
    achievements: [
      "Designed Arcade's outcome-based learning rubrics and certification criteria",
      "Facilitated accreditation alignment with NAAC A+ & NBA standards",
      "Mentored over 50+ student creator projects and faculty innovators"
    ],
    skills: ["Academic Strategy", "Curriculum Architecture", "NAAC & NBA Accreditation", "Mentorship", "Research"],
    social: {
      linkedin: "https://linkedin.com",
      email: "maya@arcade.ajce.in"
    }
  },
  {
    id: "founder-3",
    name: "Rohan Thomas",
    role: "Co-Founder & Head of Product Design",
    tagline: "Crafting beautiful, accessible, and delightful digital interfaces.",
    image: "/founders/founder_3.png",
    bio: "Product designer and UX strategist obsessed with creating polished, micro-animated user journeys.",
    extendedBio: "Rohan oversees product experience, aesthetic identity, and design systems across Arcade. He believes educational tools deserve the same elegance, fluid animations, and visual delight as top consumer tech products. Rohan designed Arcade's signature typography scale, ambient glassmorphism aesthetics, and responsive layout foundations.",
    quote: "Great design turns complex learning workflows into effortless, delightful moments of growth.",
    achievements: [
      "Created the complete Arcade Design System (Typography, Glassmorphism, Micro-interactions)",
      "Streamlined workshop registration and user onboarding conversion by 300%",
      "Directed the UI/UX strategy across all student and instructor touchpoints"
    ],
    skills: ["UI/UX Design", "Design Systems", "Framer Motion", "User Research", "Brand Identity"],
    social: {
      linkedin: "https://linkedin.com",
      github: "https://github.com",
      twitter: "https://twitter.com",
      email: "rohan@arcade.ajce.in"
    }
  }
];

export const TIMELINE_MILESTONES: Milestone[] = [
  {
    year: "2024 - Q3",
    title: "The Genesis Spark",
    subtitle: "A vision born out of student passion & campus need",
    description: "During an annual tech symposium at Amal Jyothi College of Engineering, the founding team identified critical gaps in existing LMS platforms—lacking real-time interactivity, verifiable digital certificates, and modern creator tools.",
    badge: "Origin",
    iconName: "spark"
  },
  {
    year: "2024 - Q4",
    title: "Blueprint & System Architecture",
    subtitle: "Engineering an open, modern learning infrastructure",
    description: "The team established the core technical stack: Next.js App Router, Tailwind CSS with custom editorial design tokens, Framer Motion springs, and verifiable credential cryptography for certificates.",
    badge: "Architecture",
    iconName: "code"
  },
  {
    year: "2025 - Q2",
    title: "Campus Beta Rollout at AJCE",
    subtitle: "Real-world testing with students and faculty mentors",
    description: "Arcade launched its first closed beta across engineering departments. Over 1,200+ students and 40+ faculty members participated, running workshops, webinars, and coding challenges on the platform.",
    badge: "Beta Launch",
    iconName: "rocket"
  },
  {
    year: "2026 & Beyond",
    title: "The Arcade Ecosystem 2.0",
    subtitle: "Scaling institutional collaboration & AI creator hubs",
    description: "Today, Arcade is expanding into a comprehensive platform for multi-department learning, automated assessment, institutional ranking support, and creator empowerment across colleges.",
    badge: "Future Vision",
    iconName: "globe"
  }
];

export const ABOUT_ARCADE_HIGHLIGHTS = [
  {
    title: "Empowering AJCE Innovators",
    description: "Built at Amal Jyothi College of Engineering, Arcade acts as a catalyst for student-led innovation, hands-on workshops, and certified skill development.",
    stat: "#4 KIRF Rank Support",
    gradient: "from-blue-600 via-indigo-600 to-violet-600"
  },
  {
    title: "Verifiable Credentials",
    description: "Issuing cryptographic, tamper-proof digital certificates for workshops, courses, and hackathons that students can share with confidence.",
    stat: "100% Verified",
    gradient: "from-teal-500 via-cyan-600 to-blue-600"
  },
  {
    title: "Unified Creator Platform",
    description: "Providing faculty, alumni, and industry mentors with modern publishing tools to create rich multimedia learning tracks effortlessly.",
    stat: "Ecosystem First",
    gradient: "from-amber-500 via-orange-500 to-pink-600"
  }
];

export const PHILOSOPHY_CARDS = [
  {
    title: "Uncompromising Excellence",
    description: "Every feature, animation, and course on Arcade is crafted to institutional excellence standards.",
    icon: "ShieldCheck",
    color: "bg-blue-50 text-blue-600 border-blue-200"
  },
  {
    title: "Community & Collaboration",
    description: "Fostering peer-to-peer knowledge sharing between seniors, juniors, faculty, and industry leaders.",
    icon: "Users",
    color: "bg-emerald-50 text-emerald-600 border-emerald-200"
  },
  {
    title: "Transparent & Trustworthy",
    description: "Building open academic infrastructure with verifiable certificates and rigorous evaluation.",
    icon: "BadgeCheck",
    color: "bg-purple-50 text-purple-600 border-purple-200"
  },
  {
    title: "Continuous Evolution",
    description: "Iterating daily based on active feedback from AJCE students, creators, and academic advisors.",
    icon: "Zap",
    color: "bg-amber-50 text-amber-600 border-amber-200"
  }
];
