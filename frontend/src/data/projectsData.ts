export interface Project {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  longDescription: string;
  category: 'Flagship' | 'AI' | 'Cybersecurity' | 'Systems/CLI';
  techStack: string[];
  githubUrl: string;
  liveUrl?: string;
  featured: boolean;
  bentoSpan: string; 
  metrics?: string;
}

export const PROJECTS_DATA: Project[] = [
  {
    id: 'smartshamba',
    title: 'SmartShamba',
    subtitle: 'Agri-Tech Transaction Platform (Next.js)',
    description: 'Production agri-tech platform digitizing maize trading across 9+ counties in Kenya. Synchronizes feature-phone farmers (USSD *384*53374#) with institutional buyers (Web) on a unified Supabase PostgreSQL ledger. Core systems include a Buyer–Produce Matching Algorithm, Transaction State Machine, Group Selling Aggregation Engine, AI Market Intelligence (Gemini + NVIDIA models), GIS Spatial Query Engine (PostGIS), M-Pesa Settlement Ledger with audit trail, and Event-Driven Integration Architecture. Production error monitoring via Sentry.',
    longDescription: 'Reduces middleman exploitation by enabling pre-confirmed buyer pricing, group selling, and transaction dispute resolution across Rift Valley and Western Kenya.',
    category: 'Flagship',
    techStack: ['Next.js 16', 'TypeScript', 'TailwindCSS', 'Prisma ORM', 'Supabase PostgreSQL', 'Africa\'s Talking USSD', 'M-Pesa Daraja'],
    githubUrl: 'https://github.com/N3stah/smartshamba',
    liveUrl: 'https://smartshamba.vercel.app/',
    featured: true,
    bentoSpan: 'col-span-1 md:col-span-2',
    metrics: 'Serves 9+ Counties in Kenya'
  },
  {
    id: 'aetsh69',
    title: 'AETSH-69: FastAPI & React AI Platform',
    subtitle: 'RAG Architecture with pgvector & Claude API',
    description: 'A full-stack personal platform powered by a FastAPI backend, pgvector semantic search, Redis caching, and Celery workers. Features a React/TypeScript frontend and JWT-authenticated multi-tenant architecture.',
    longDescription: 'Engineered as a unified digital ecosystem featuring automated content ingestion, semantic vector retrieval, security guardrails, M-Pesa payment gateways, and role-based knowledge routing.',
    category: 'AI',
    techStack: ['FastAPI', 'Python 3.12', 'PostgreSQL 16', 'pgvector', 'Redis 7', 'Celery', 'React', 'TypeScript', 'Docker'],
    githubUrl: 'https://github.com/N3stah/aetsh69',
    liveUrl: 'https://www.aetsh69.duckdns.org/',
    featured: true,
    bentoSpan: 'col-span-1 md:col-span-2',
    metrics: 'Sub-second Semantic Vector Search'
  },
  {
    id: 'deep-trio-scanner',
    title: 'DEEP-TRIO: ML Malware Detection Scanner',
    subtitle: 'Scikit-Learn Threat Classification & Quarantine',
    description: 'A cybersecurity scanner utilizing trained Scikit-Learn classifier models (.pkl) to detect malicious payloads. Features automated quarantine, deletion isolation workflows, and heuristic file inspection.',
    longDescription: 'Includes Jupyter analysis notebooks and an interactive web interface for real-time security auditing.',
    category: 'Cybersecurity',
    techStack: ['Python', 'Jupyter Notebooks', 'Scikit-Learn', 'Threat Detection', 'HTML5/CSS3'],
    githubUrl: 'https://github.com/N3stah/DEEP-TRIO-Scanner',
    featured: false,
    bentoSpan: 'col-span-1',
    metrics: 'Automated Quarantine Pipeline'
  },
  {
    id: 'mark-python-projects',
    title: 'Python Mastery: 22-Project Engineering Suite',
    subtitle: 'Python & AI Development Portfolio',
    description: 'A 22-project repository demonstrating the full Python development lifecycle—from procedural ciphers and web scrapers to Tkinter GUIs and persistent SQLite AI chat bots.',
    longDescription: 'Includes Google GenAI SDK integrations (Gemini 2.5), Tkinter desktop applications, wave audio synthesis, and financial calculator utilities.',
    category: 'AI',
    techStack: ['Python 3.14', 'Google GenAI SDK', 'Tkinter GUI', 'SQLite', 'BeautifulSoup4', 'Requests API'],
    githubUrl: 'https://github.com/N3stah/Mark_Python_Projects',
    featured: false,
    bentoSpan: 'col-span-1',
    metrics: '22 Executable Projects'
  },
  {
    id: 'spendy',
    title: 'Spendy CLI Tracker',
    subtitle: 'Decoupled Financial Expense Tracker',
    description: 'A modular Python CLI spending tracker built with functional architecture separating data logic from I/O. Backed by Pytest unit test coverage and CSV persistence. Built under a professional engineering mentorship with strict no-AI implementation rules — completed independently to simulate real assessment conditions.',
    longDescription: 'Features categorical expense filtering, interactive terminal menus, automated timestamping, and pure function separation for robust test verification.',
    category: 'Systems/CLI',
    techStack: ['Python 3.6+', 'Pytest', 'CSV I/O', 'Functional Architecture', 'Linux CLI'],
    githubUrl: 'https://github.com/N3stah/spendy',
    featured: false,
    bentoSpan: 'col-span-1',
    metrics: '100% Pure Function Test Coverage'
  },
  {
    id: 'task-manager',
    title: 'Java CLI Task Manager',
    subtitle: 'DAO Pattern & SQLite Task Management',
    description: 'An enterprise-structured Java command-line application built using the Data Access Object (DAO) design pattern, persistent SQLite JDBC drivers, and Maven Shade packaging.',
    longDescription: 'Demonstrates clean object-oriented architecture, JDBC database management, automated table initialization, and cross-platform JAR executable builds.',
    category: 'Systems/CLI',
    techStack: ['Java', 'SQLite (JDBC)', 'DAO Architecture', 'Maven Shade Plugin'],
    githubUrl: 'https://github.com/N3stah/task-manager',
    featured: false,
    bentoSpan: 'col-span-1',
    metrics: 'DAO Pattern & JDBC SQLite Driver'
  }
];
