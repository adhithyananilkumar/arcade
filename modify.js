
const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "app/(authenticated)/dashboard/[courseId]/page.tsx");
let code = fs.readFileSync(filePath, "utf8");

// Remove HeroNav completely
code = code.replace(/\/\* \-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\- \*\/\r?\n\/\*  Nav                                                                \*\/\r?\n\/\* \-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\- \*\/\r?\n\r?\nfunction HeroNav\(\) \{[\s\S]*?\}\s*(?=\/\* \-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\- \*\/)/, "");

// Imports
code = code.replace(
  /import \{ useState \} from "react"/,
  `import { useState, useEffect, createContext, useContext } from "react"\nimport { useParams } from "next/navigation"\nimport { api } from "@/lib/api"\nimport { CourseResponse } from "@/types/api"`
);

// Context
code = code.replace(
  /\/\* \-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\- \*\/\r?\n\/\*  Data                                                               \*\//,
  `/* ------------------------------------------------------------------ */\n/*  Context                                                            */\n/* ------------------------------------------------------------------ */\n\nconst CourseContext = createContext<CourseResponse | null>(null);\n\n/* ------------------------------------------------------------------ */\n/*  Data                                                               */`
);

// CoursePreviewPage
code = code.replace(
  /export default function CoursePreviewPage\(\) \{\r?\n  return \(\r?\n    <main className="min-h-screen bg-paper text-ink">\r?\n      <HeroNav \/>/,
  `export default function CoursePreviewPage() {
  const params = useParams();
  const [course, setCourse] = useState<CourseResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.courseId) {
      api.get<CourseResponse>(\`/api/v1/public/courses/\${params.courseId}\`)
         .then(setCourse)
         .catch(console.error)
         .finally(() => setLoading(false));
    }
  }, [params.courseId]);

  if (loading) return <div className="p-12 text-center text-ink h-screen flex items-center justify-center bg-paper">Loading...</div>;
  if (!course) return <div className="p-12 text-center text-ink h-screen flex items-center justify-center bg-paper">Course not found.</div>;

  return (
    <CourseContext.Provider value={course}>
    <main className="min-h-screen bg-paper text-ink">`
);

// Close Provider
code = code.replace(
  /<\/main>\r?\n  \)\r?\n\}\r?\n?$/,
  `    </main>\n    </CourseContext.Provider>\n  )\n}\n`
);

// Breadcrumb
code = code.replace(
  /function Breadcrumb\(\) \{\r?\n  const crumbs = \[\r?\n    \{ label: "Explore", href: "\/explore" \},\r?\n    \{ label: CATEGORY, href: "\/explore" \}\r?\n  \]/,
  `function Breadcrumb() {\n  const course = useContext(CourseContext)!;\n  const crumbs = [\n    { label: "Courses", href: "/dashboard" }\n  ]`
);
code = code.replace(/\{COURSE_TITLE\}/g, `{course.title}`);

// CourseHero
code = code.replace(
  /function CourseHero\(\) \{\r?\n  const \[saved, setSaved\] = useState\(false\)/,
  `function CourseHero() {\n  const course = useContext(CourseContext)!;\n  const [saved, setSaved] = useState(false)`
);
code = code.replace(/Design interfaces\r?\n            <br \/>\r?\n            people actually\{" "\}/, `{course.title}`);

// CourseTabs
code = code.replace(
  /function CourseTabs\(\) \{/,
  `function CourseTabs() {\n  const course = useContext(CourseContext)!;\n  const TOTAL_LESSONS = course.modules?.reduce((sum, m) => sum + (m.lessons?.length || 0), 0) || 0;`
);

// SyllabusSection
code = code.replace(
  /function SyllabusSection\(\) \{/,
  `function SyllabusSection() {\n  const course = useContext(CourseContext)!;`
);

// EnrollCta
code = code.replace(
  /function EnrollCta\(\) \{/,
  `function EnrollCta() {\n  const course = useContext(CourseContext)!;`
);

// Replace MODULES map in SyllabusSection
code = code.replace(
  /MODULES\.map\(\(mod, i\) => \(/,
  `(course.modules || []).map((mod, i) => (`
);

// Replace mod.duration in SyllabusSection
code = code.replace(
  /mod\.duration/g,
  `"1h"`
);

// Replace mod.accent in SyllabusSection
code = code.replace(
  /mod\.accent/g,
  `"var(--color-blue)"`
);

fs.writeFileSync(filePath, code);
console.log("Modifications complete");

