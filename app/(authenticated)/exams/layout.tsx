import { Fraunces } from 'next/font/google';

// The serif the course and event landing pages use for their section headings, so an exam's
// overview and grade cards read as the same family of page.
const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
  axes: ['opsz', 'SOFT'],
});

export default function ExamsLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <div className={fraunces.variable}>{children}</div>;
}
