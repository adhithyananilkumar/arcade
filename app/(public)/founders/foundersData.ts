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
    name: "Adhithyan Anilkumar",
    role: "Founder & Chief Architect",
    tagline: "Architecting decentralized, verifiable learning engines for modern technical education.",
    image: "/founders/clean_founder_1.jpg",
    bio: "Software architect and lead engineer who spearheaded Arcade's core platform architecture at AJCE.",
    extendedBio: "Adhithyan conceived Arcade to bridge the gap between academic theory and real-world software delivery. With expertise in Next.js, distributed microservices, and cryptographic credential validation, he built Arcade's core execution pipeline that powers student courses, workshops, and automated evaluations.",
    quote: "Education shouldn't just deliver content; it should reward execution and build verifiable trust.",
    achievements: [
      "Architected Arcade's core microservices & modular platform engine",
      "Pioneered digital credential verification pipeline at AJCE",
      "Led system scaling to 2,000+ active student developers"
    ],
    skills: ["System Architecture", "Next.js & React", "TypeScript", "DevOps & Cloud", "Cryptographic Verification"],
    social: {
      linkedin: "https://linkedin.com",
      github: "https://github.com",
      email: "adhithyan@arcade.ajce.in"
    }
  },
  {
    id: "founder-2",
    name: "Jagan Syam",
    role: "Co-Founder & Technical Lead",
    tagline: "Designing high-throughput backend services and real-time collaborative workshop spaces.",
    image: "/founders/clean_founder_2.jpg",
    bio: "Backend systems engineer passionate about real-time web engines, distributed state, and automated grading.",
    extendedBio: "Jagan engineered the real-time event streaming and live workspace engine inside Arcade. His work enables interactive coding sessions, live workshop leaderboards, and instant automated feedback for hundreds of concurrent campus participants.",
    quote: "High-performance software removes the friction between a student's curiosity and their mastery.",
    achievements: [
      "Built Arcade's real-time collaborative workshop engine",
      "Designed sub-50ms latency submission processing pipeline",
      "Implemented automated security sandboxing for code evaluation"
    ],
    skills: ["Node.js & Go", "Distributed Systems", "WebSockets", "Database Optimization", "Security Sandboxing"],
    social: {
      linkedin: "https://linkedin.com",
      github: "https://github.com",
      email: "jagan@arcade.ajce.in"
    }
  },
  {
    id: "founder-3",
    name: "Athira Biju",
    role: "Co-Founder & Academic Lead",
    tagline: "Bridging outcome-based academic standards with modern hands-on industry practices.",
    image: "/founders/clean_founder_3.jpg",
    bio: "Academic strategist and curriculum director aligning Arcade's learning paths with accredited engineering frameworks.",
    extendedBio: "Athira leads the curriculum strategy and pedagogical framework for Arcade. She ensures that every course track, lab exercise, and certification program strictly complies with NAAC A+ and NBA accreditation standards while delivering hands-on industry skills.",
    quote: "When academic rigor meets interactive software, student potential multiplies exponentially.",
    achievements: [
      "Designed Arcade's outcome-based education (OBE) rubrics",
      "Facilitated NAAC A+ & NBA accreditation alignment",
      "Mentored 40+ student research projects and faculty courses"
    ],
    skills: ["Academic Strategy", "Curriculum Design", "NAAC & NBA Standards", "Pedagogical Engineering", "Research"],
    social: {
      linkedin: "https://linkedin.com",
      email: "athira@arcade.ajce.in"
    }
  },
  {
    id: "founder-4",
    name: "Anandhu Pradeep",
    role: "Co-Founder & Head of Product Design",
    tagline: "Crafting fluid, glassmorphic interfaces and intuitive visual design systems.",
    image: "/founders/clean_founder_4.jpg",
    bio: "UI/UX director obsessed with high-fidelity visuals, micro-interactions, and accessible student experiences.",
    extendedBio: "Anandhu directs the design system, aesthetics, and user experience of Arcade. He introduced Arcade's signature editorial typography, dark/light ambient glassmorphism, and responsive motion frameworks to make learning feel modern and inspiring.",
    quote: "Great design turns complex learning tools into delightful, empowering moments of discovery.",
    achievements: [
      "Created the unified Arcade Design System",
      "Boosted platform user retention by 240% through UX redesign",
      "Directed visual identity across web, mobile, and certificate credentials"
    ],
    skills: ["UI/UX Design", "Figma", "Design Systems", "Framer Motion", "Brand Identity"],
    social: {
      linkedin: "https://linkedin.com",
      github: "https://github.com",
      email: "anandhu@arcade.ajce.in"
    }
  },
  {
    id: "founder-5",
    name: "Akash A",
    role: "Co-Founder & Engineering Lead",
    tagline: "Building robust full-stack infrastructure and student performance analytics.",
    image: "/founders/clean_founder_5.jpg",
    bio: "Full-stack engineer focusing on web performance, database architecture, and developer tooling.",
    extendedBio: "Akash leads frontend performance optimization and data integration across Arcade. He optimized asset delivery, bundle sizes, and state management, achieving lightning-fast load times and seamless offline resilience for campus users.",
    quote: "Speed and reliability in software build confidence and momentum for learners.",
    achievements: [
      "Optimized platform Core Web Vitals to 99+ Lighthouse score",
      "Engineered real-time student analytics dashboard",
      "Built automated CI/CD deployment pipelines"
    ],
    skills: ["React & Next.js", "State Management", "Web Vitals", "PostgreSQL", "CI/CD"],
    social: {
      linkedin: "https://linkedin.com",
      github: "https://github.com",
      email: "akash@arcade.ajce.in"
    }
  },
  {
    id: "founder-6",
    name: "Deepthi C D",
    role: "Co-Founder & Operations Lead",
    tagline: "Streamlining departmental workflows and empowering campus-wide creator programs.",
    image: "/founders/clean_founder_6.jpg",
    bio: "Operations lead managing institutional partnerships, workshop rollouts, and creator growth.",
    extendedBio: "Deepthi orchestrates Arcade's campus operations, creator programs, and departmental integrations. Under her operational leadership, Arcade expanded across multiple AJCE departments, hosting dozens of technical workshops and student hackathons.",
    quote: "Seamless execution behind the scenes is what turns ambitious visions into daily campus reality.",
    achievements: [
      "Managed campus-wide Arcade rollout across 8 engineering departments",
      "Onboarded 50+ faculty mentors and student creators",
      "Organized AJCE's largest virtual hackathon on Arcade"
    ],
    skills: ["Operations Strategy", "Program Management", "Community Growth", "Cross-functional Leadership", "Event Execution"],
    social: {
      linkedin: "https://linkedin.com",
      email: "deepthi@arcade.ajce.in"
    }
  },
  {
    id: "founder-7",
    name: "Anandhulal C V",
    role: "Co-Founder & Infrastructure Lead",
    tagline: "Scaling cloud infrastructure, Kubernetes clusters, and zero-downtime deployments.",
    image: "/founders/clean_founder_7.jpg",
    bio: "DevOps specialist managing serverless infrastructure, containerization, and platform monitoring.",
    extendedBio: "Anandhulal maintains Arcade's server architecture and cloud infrastructure. He engineered zero-downtime deployments, multi-region database replication, and automated scaling to support surge traffic during campus exams and live hackathons.",
    quote: "The best infrastructure is invisible—always fast, rock-solid, and ready to scale.",
    achievements: [
      "Implemented Kubernetes container orchestration for Arcade",
      "Maintained 99.99% uptime during peak campus hackathons",
      "Automated cloud backup and disaster recovery protocols"
    ],
    skills: ["Cloud Infrastructure", "Kubernetes & Docker", "Terraform", "Monitoring & Observability", "Security"],
    social: {
      linkedin: "https://linkedin.com",
      github: "https://github.com",
      email: "anandhulal@arcade.ajce.in"
    }
  },
  {
    id: "founder-8",
    name: "Kalyany S Nair",
    role: "Co-Founder & Community Lead",
    tagline: "Fostering vibrant student developer communities and peer mentorship networks.",
    image: "/founders/clean_founder_8.jpg",
    bio: "Community builder dedicated to empowering student creators, peer learning groups, and open-source culture.",
    extendedBio: "Kalyany leads Arcade's student ambassador program and community outreach. She built peer-to-peer mentorship clubs, organized campus coding sprints, and ensured every student has direct access to guidance and support.",
    quote: "Learning accelerates when students collaborate, share knowledge, and build together.",
    achievements: [
      "Founded the Arcade Student Ambassador Network with 100+ leads",
      "Increased active student community participation by 400%",
      "Spearheaded open-source contribution workshops at AJCE"
    ],
    skills: ["Community Management", "Developer Relations", "Student Advocacy", "Event Management", "Public Speaking"],
    social: {
      linkedin: "https://linkedin.com",
      email: "kalyany@arcade.ajce.in"
    }
  },
  {
    id: "founder-9",
    name: "Aloshy Antony",
    role: "Co-Founder & Security Architect",
    tagline: "Securing student data, credential authenticity, and platform integrity.",
    image: "/founders/clean_founder_9.jpg",
    bio: "Cybersecurity engineer specializing in auth protocols, encryption, and vulnerability assessment.",
    extendedBio: "Aloshy oversees security architecture across Arcade. He designed the OAuth2 authentication flows, encrypted data storage, and tamper-proof hash signatures that guarantee the validity of Arcade digital certificates.",
    quote: "Trust is the foundation of academic credentials, and security is how we guarantee it.",
    achievements: [
      "Architected zero-trust security model for student evaluation data",
      "Pioneered tamper-proof hash certificates using RSA cryptography",
      "Conducted continuous security audits and vulnerability patching"
    ],
    skills: ["Cybersecurity", "Cryptography", "OAuth2 & JWT", "Penetration Testing", "Security Auditing"],
    social: {
      linkedin: "https://linkedin.com",
      github: "https://github.com",
      email: "aloshy@arcade.ajce.in"
    }
  },
  {
    id: "founder-10",
    name: "Anjali",
    role: "Co-Founder & Educational Strategist",
    tagline: "Pioneering interactive learning methodologies and gamified course dynamics.",
    image: "/founders/clean_founder_10.jpg",
    bio: "EdTech researcher developing adaptive learning pathways and student progress metrics.",
    extendedBio: "Anjali focuses on gamification and interactive learning methodologies. She designed Arcade's skill trees, achievement badges, and adaptive difficulty algorithms that keep students motivated throughout their technical coursework.",
    quote: "Gamifying skill mastery transforms routine studying into a rewarding journey.",
    achievements: [
      "Designed Arcade's skill tree badge & achievement engine",
      "Published research on gamified technical education",
      "Improved course completion rates by 65%"
    ],
    skills: ["EdTech Gamification", "Instructional Design", "Adaptive Learning", "Data Analytics", "User Engagement"],
    social: {
      linkedin: "https://linkedin.com",
      email: "anjali@arcade.ajce.in"
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
