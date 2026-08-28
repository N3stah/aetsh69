export interface WorkExperience {
  id: string;
  badge: string;
  title: string;
  organisation: string;
  period: string;
  description: string;
  tags: string[];
}

export const WORK_EXPERIENCE: WorkExperience[] = [
  {
    id: 'spin-mobile',
    badge: 'Internship',
    title: 'Software Engineering Intern',
    organisation: 'Spin Mobile LLC',
    period: 'August 2026 – November 2026 (12 weeks)',
    description: '12-week full-stack engineering internship at Spin Mobile\'s Upperhill offices. Covers Python, Django, PostgreSQL, and Git under senior engineer mentorship. Weekly graded assignments (CLI tooling, data validation, automated testing) evaluated on code quality, daily discipline, and a capstone project defense.',
    tags: ['Python', 'Django', 'PostgreSQL', 'Git/GitHub', 'PyCharm', 'Linux']
  },
  {
    id: 'smartshamba-cto',
    badge: 'Leadership',
    title: 'Co-Founder & CTO',
    organisation: 'SmartShamba',
    period: 'April 2025 – Present', // TODO: Replace with actual SmartShamba start date
    description: 'Co-founded and lead technical development of SmartShamba, a production agri-tech platform digitizing maize trading across 9+ counties in Kenya. Own the full engineering lifecycle: architecture, API design, USSD flows, admin and farmer UIs, payment integration, and production monitoring.',
    tags: ['Next.js 16', 'TypeScript', 'Supabase', 'Prisma', 'USSD', 'M-Pesa', 'PostGIS', 'Sentry']
  }
];
