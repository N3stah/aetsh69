export interface Project {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  longDescription: string;
  category: 'Flagship' | 'AI' | 'Web' | 'Cybersecurity' | 'Systems/CLI';
  techStack: string[];
  githubUrl: string;
  liveUrl?: string;
  featured: boolean;
  bentoSpan: string; // Tailwind grid span classes
  metrics?: string;
  featuredImage?: string;
}

export const PROJECTS_DATA: Project[] = [
  {
    id: 'smartshamba',
    title: 'SmartShamba',
    subtitle: 'Flagship Agri-Tech Transaction Platform',
    description: 'Production-ready agri-tech platform digitizing maize trading in Kenya. Synchronizes feature-phone farmers (via USSD *384*53374#) with institutional buyers (via Web) on a unified database ledger.',
    longDescription: 'SmartShamba reduces middleman exploitation by enabling pre-confirmed buyer pricing, group selling, transaction dispute resolution, and regional market intelligence across Rift Valley and Western Kenya.',
    category: 'Flagship',
    techStack: ['Next.js 16', 'TypeScript', 'TailwindCSS', 'Prisma ORM', 'Supabase PostgreSQL', 'Africa\'s Talking USSD/SMS', 'M-Pesa Daraja', 'Sentry'],
    githubUrl: 'https://github.com/N3stah/smartshamba',
    liveUrl: 'https://smartshamba.vercel.app/',
    featured: true,
    bentoSpan: 'col-span-1 lg:col-span-2 row-span-2',
    metrics: 'Serves 9+ Counties in Western Kenya & Rift Valley'
  },
  {
    id: 'aetsh69',
    title: 'AETSH-69 Personal Ecosystem OS',
    subtitle: 'Adaptive AI Engine & Personal Tech Operating System',
    description: 'A full-stack personal platform powered by a FastAPI backend, vector search (pgvector), Redis caching, Celery workers, and a multi-tenant Claude 3.5/GPT-4o RAG AI concierge.',
    longDescription: 'Engineered as a unified digital ecosystem featuring automated content ingestion, semantic vector retrieval, security guardrails, M-Pesa/Stripe payment gateways, and role-based knowledge routing.',
    category: 'AI',
    techStack: ['FastAPI', 'Python 3.12', 'PostgreSQL 16', 'pgvector', 'Redis 7', 'Celery', 'React', 'TypeScript', 'Docker', 'Claude 3.5 / GPT-4o'],
    githubUrl: 'https://github.com/N3stah/aetsh69',
    liveUrl: 'https://aetsh69.vercel.app/',
    featured: true,
    bentoSpan: 'col-span-1 lg:col-span-2 row-span-1',
    metrics: 'Sub-second Semantic Vector Search & AI RAG'
  },
  {
    id: 'deep-trio-scanner',
    title: 'DEEP-TRIO-Scanner (Sentinel AI)',
    subtitle: 'Machine Learning Malware & Threat Detector',
    description: 'A cybersecurity scanner utilizing trained Machine Learning classifier models (.pkl) to detect malicious payloads with automated quarantine and deletion isolation workflows.',
    longDescription: 'Features deep heuristic file inspection, automated threat quarantine mechanisms, Jupyter analysis notebooks, and an interactive web interface for real-time security auditing.',
    category: 'Cybersecurity',
    techStack: ['Python', 'Jupyter Notebooks', 'Scikit-Learn', 'Threat Detection', 'HTML5/CSS3'],
    githubUrl: 'https://github.com/N3stah/DEEP-TRIO-Scanner',
    featured: false,
    bentoSpan: 'col-span-1 lg:col-span-1 row-span-1',
    metrics: 'Automated Quarantine & Deletion Pipeline'
  },
  {
    id: 'mark-python-projects',
    title: 'Python Mastery: 22-Project Engineering Suite',
    subtitle: 'Comprehensive Python & AI Development Portfolio',
    description: 'A 22-project engineering repository demonstrating the full Python development lifecycle—from procedural ciphers and web scrapers to Tkinter GUIs and persistent SQLite AI chat bots.',
    longDescription: 'Includes persistent Google GenAI SDK integrations (Gemini 2.5), Tkinter desktop applications, wave audio synthesis, substitution ciphers, and financial calculator utilities.',
    category: 'AI',
    techStack: ['Python 3.14', 'Google GenAI SDK', 'Tkinter GUI', 'SQLite', 'BeautifulSoup4', 'Requests API'],
    githubUrl: 'https://github.com/N3stah/Mark_Python_Projects',
    featured: false,
    bentoSpan: 'col-span-1 lg:col-span-1 row-span-1',
    metrics: '22 Executable Engineering Projects'
  },
  {
    id: 'spendy',
    title: 'Spendy CLI Tracker',
    subtitle: 'Decoupled Financial Expense Tracker & Test Pipeline',
    description: 'A modular Python CLI spending tracker built with functional architecture separating data logic from I/O, backed by Pytest unit test coverage and CSV persistence.',
    longDescription: 'Features categorical expense filtering, interactive terminal menus, automated timestamping, and pure function separation for robust test verification.',
    category: 'Systems/CLI',
    techStack: ['Python 3.6+', 'Pytest', 'CSV I/O', 'Functional Architecture', 'Linux CLI'],
    githubUrl: 'https://github.com/N3stah/spendy',
    featured: false,
    bentoSpan: 'col-span-1 lg:col-span-1 row-span-1',
    metrics: '100% Pure Function Test Coverage'
  },
  {
    id: 'task-manager',
    title: 'Java CLI Task Manager',
    subtitle: 'DAO Pattern & SQLite Task Management Architecture',
    description: 'An enterprise-structured Java command-line application built using the Data Access Object (DAO) design pattern, persistent SQLite database drivers, and Maven Shade packaging.',
    longDescription: 'Demonstrates clean object-oriented architecture, JDBC database management, automated table initialization, and cross-platform JAR executable builds.',
    category: 'Systems/CLI',
    techStack: ['Java', 'SQLite (JDBC)', 'DAO Architecture', 'Maven Shade Plugin'],
    githubUrl: 'https://github.com/N3stah/task-manager',
    featured: false,
    bentoSpan: 'col-span-1 lg:col-span-1 row-span-1',
    metrics: 'DAO Pattern & JDBC SQLite Driver'
  }
];
