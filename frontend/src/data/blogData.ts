export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  category: string;
  tags: string[];
  excerpt: string;
  content: string;
  date: string;
  readingTime: string;
}

export const BLOG_POSTS: BlogPost[] = [
  {
    id: '1',
    title: 'Building DEEP-TRIO: Lessons from Creating an AI-Powered Malware Detection Scanner',
    slug: 'building-deep-trio-ml-malware-scanner',
    category: 'Machine Learning',
    tags: ['Machine Learning', 'Cybersecurity', 'Python', 'Scikit-Learn'],
    excerpt: "Moving beyond theoretical model training into model persistence, quarantine isolation pipelines, and end-to-end security utility design.",
    content: "As a Computer Science student, theory only becomes real when you build something end-to-end. DEEP-TRIO is my attempt to do exactly that — a machine learning-based malware detection scanner that inspects file structures, evaluates heuristics via a Scikit-Learn classifier, and isolates suspicious payloads into automated quarantine.\n\nKey Lessons Learned:\n1. Data Quality Over Algorithm Complexity: Clean feature extraction and dataset balance dictate real-world accuracy far more than model tweaking.\n2. Model Persistence (.pkl Serialization): Saving, versioning, and loading binary models is a production necessity that standard tutorials often overlook.\n3. User-Centric Security Tooling: Designing intuitive CLI and web interfaces teaches you how security analysts actually interact with system alerts.\n4. Project Completion Discipline: Shipping a fully functional pipeline builds deeper engineering resilience than starting five unfinished experiments.",
    date: 'Aug 10, 2026',
    readingTime: '4 min read'
  },
  {
    id: '2',
    title: "From 'It Works on My Machine' to Containers: My Experience with Docker, FastAPI, PostgreSQL, and Nginx",
    slug: 'containerizing-multi-service-apps-docker-fastapi',
    category: 'DevOps',
    tags: ['Docker', 'DevOps', 'FastAPI', 'Nginx', 'Systems Architecture'],
    excerpt: "Solving environment drift and service orchestrations by packaging FastAPI, PostgreSQL, pgvector, and Nginx reverse proxies with Docker Compose.",
    content: "Deploying multi-service architectures reliable across different environments led me straight to containerization. I packaged an end-to-end web stack consisting of FastAPI, PostgreSQL, Redis, and an Nginx reverse proxy.\n\nKey Lessons Learned:\n1. Environment Parity: Containers completely eliminate host-level dependency mismatches and configuration drift.\n2. Networking, Ports, and Volumes: Mastering internal container networks and persistent volume mounting is far more critical than memorizing CLI commands.\n3. System Design at Scale: Authoring clean docker-compose files acts as a blueprint for understanding microservices and service dependencies.\n4. Observability: Centralized container logging becomes your primary diagnostic asset when multi-tier networks fail.",
    date: 'Aug 8, 2026',
    readingTime: '5 min read'
  },
  {
    id: '3',
    title: 'Why I Still Care About Core Computer Science Fundamentals (Even in the AI Era)',
    slug: 'why-computer-science-fundamentals-matter',
    category: 'Computer Science',
    tags: ['Computer Science', 'Architecture', 'Algorithms', 'Database Design'],
    excerpt: "Why deep knowledge of Operating Systems, Memory, Networks, and Data Structures makes debugging modern frameworks and AI tools faster.",
    content: "In an era dominated by high-level frameworks, AI code generators, and low-code utilities, core Computer Science subjects are often unfairly labeled as academic background noise. My experience building production tools proves the opposite.\n\nCoursework in Operating Systems, Computer Architecture, Data Structures, and Networking repeatedly provides the exact diagnostic framework needed when abstraction layers fail:\n- When container networking drops, understanding socket states and TCP/IP isolates root causes instantly.\n- When database queries choke under load, knowledge of indexing algorithms and execution plans guides optimization.\n- Frameworks and trendy libraries cycle rapidly, but core computational principles remain permanent leverage.",
    date: 'Aug 5, 2026',
    readingTime: '3 min read'
  },
  {
    id: '4',
    title: "SmartShamba: Bridging Feature Phones and the Web with Africa's Talking USSD",
    slug: 'smartshamba-bridging-ussd-and-web-tech',
    category: 'AgriTech',
    tags: ['AgriTech', 'USSD', 'Next.js', "Africa's Talking", 'FinTech'],
    excerpt: "Connecting offline smallholder maize farmers on feature phones with institutional grain buyers on modern web dashboards via shared database ledgers.",
    content: "Building for real African market dynamics requires designing for inclusivity. SmartShamba bridges offline smallholder farmers using feature phones via Africa's Talking USSD (*384*53374#) with institutional grain buyers using a Next.js web application.\n\nKey Lessons Learned:\n1. Accessibility First: Designing exclusively for smartphones excludes millions of rural agricultural producers.\n2. Dual-Interface Synchronization: Maintaining real-time transactional consistency across offline USSD sessions and web dashboards on a single PostgreSQL database requires strict concurrency control.\n3. External API Resilience: Integrating telecommunication USSD gateways and M-Pesa Daraja STK push webhooks requires robust error handling and transaction retry logic.",
    date: 'Aug 1, 2026',
    readingTime: '4 min read'
  }
];
