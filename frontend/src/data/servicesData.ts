export interface SubService {
  id: string;
  name: string;
  description: string;
  price: number; // KSh
  estimateType: string;
}

export interface ServiceCategory {
  id: string;
  title: string;
  overview: string;
  icon: string; // Lucide icon name
  subServices: SubService[];
}

export const SERVICES_DATA: ServiceCategory[] = [
  {
    id: 'smart-tv',
    title: 'Smart TV & Entertainment Setup',
    overview: 'Complete home streaming configuration, app sideloading, and hardware setup.',
    icon: 'Tv',
    subServices: [
      { id: 'stv-1', name: 'FireStick Hardware Purchase', description: 'New Amazon FireStick unit, excluding setup fee.', price: 7000, estimateType: 'Fixed' },
      { id: 'stv-2', name: 'Stremio & Torrentio Setup', description: 'Configuration with community add-ons for high-speed streaming.', price: 400, estimateType: 'Fixed' },
      { id: 'stv-3', name: 'IPTV / Sports Streaming Configuration', description: 'Custom playlist loading and live sports channel configuration.', price: 350, estimateType: 'Fixed' },
      { id: 'stv-4', name: 'Smart TV App Sideloading & OS Optimization', description: 'Sideloading restricted apps and clearing TV cache for speed.', price: 250, estimateType: 'Fixed' }
    ]
  },
  {
    id: 'cctv',
    title: 'CCTV & Home Security',
    overview: 'Security camera setup, DVR/NVR network configuration, and remote mobile monitoring.',
    icon: 'Camera',
    subServices: [
      { id: 'cctv-1', name: 'IP Camera / DVR / NVR Setup', description: 'Physical mounting alignment, channels configuration, and storage setup.', price: 1500, estimateType: 'Starting' },
      { id: 'cctv-2', name: 'Remote Viewing Mobile Configuration', description: 'Configuring mobile app access for live streaming away from home.', price: 1000, estimateType: 'Fixed' },
      { id: 'cctv-3', name: 'Security System Diagnostics & Cable Repair', description: 'Troubleshooting offline channels, signal loss, and power feeds.', price: 1200, estimateType: 'Starting' }
    ]
  },
  {
    id: 'network',
    title: 'Network Optimisation',
    overview: 'High-speed local network setup, Wi-Fi dead-zone elimination, and physical cabling.',
    icon: 'Wifi',
    subServices: [
      { id: 'net-1', name: 'Remote Router & Access Point Configuration', description: 'SSID isolation, band steering, and secure WPA3 configuration.', price: 500, estimateType: 'Fixed' },
      { id: 'net-2', name: 'Wi-Fi Signal Optimization & Channel Tuning', description: 'Eliminating dead zones, adjusting spectrum channels, and DNS tweaks.', price: 500, estimateType: 'Fixed' },
      { id: 'net-3', name: 'On-Site LAN Cabling & RJ45 Termination', description: 'Physical ethernet cable drops, trunking, and patch panel crimping.', price: 1500, estimateType: 'Per Drop' },
      { id: 'net-4', name: 'On-Site Network Troubleshooting & ISP Diagnostics', description: 'Resolving IP conflicts, bandwidth bottlenecks, and gateway errors.', price: 1500, estimateType: 'Starting' }
    ]
  },
  {
    id: 'maintenance',
    title: 'Computer Maintenance',
    overview: 'Complete hardware diagnostics, software cleaning, OS upgrades, and speed tuning.',
    icon: 'Laptop',
    subServices: [
      { id: 'mnt-1', name: 'OS Installation & Clean Upgrade', description: 'Fresh install of Ubuntu Linux or Windows 11 with driver updates.', price: 1000, estimateType: 'Fixed' },
      { id: 'mnt-2', name: 'Deep Virus & Malware Removal', description: 'Rootkit cleaning, ransomware mitigation, and system remediation.', price: 1000, estimateType: 'Fixed' },
      { id: 'mnt-3', name: 'System Performance Optimization', description: 'Disk cleanup, startup bloat removal, and background optimization.', price: 500, estimateType: 'Fixed' },
      { id: 'mnt-4', name: 'Hardware Diagnostics & Upgrade Consultation', description: 'RAM / SSD compatibility checks and physical installation.', price: 500, estimateType: 'Starting' }
    ]
  },
  {
    id: 'cyber',
    title: 'Cyber Services (eCitizen & Portals)',
    overview: 'Fast, accurate processing of government and statutory portal submissions.',
    icon: 'FileText',
    subServices: [
      { id: 'cyb-1', name: 'KRA Individual Tax Returns (Nil / Employed)', description: 'Filing annual returns and P9 processing.', price: 200, estimateType: 'Fixed' },
      { id: 'cyb-2', name: 'eCitizen & Business Name Registration', description: 'Business name reservation and registration assistance.', price: 1500, estimateType: 'Starting' },
      { id: 'cyb-3', name: 'Company Business Registration & CR12 Assistance', description: 'Full statutory company registration filing support.', price: 4000, estimateType: 'Starting' },
      { id: 'cyb-4', name: 'SHA / NSSF / Statutory Portal Updates', description: 'Member registration, card linking, and account updates.', price: 300, estimateType: 'Fixed' }
    ]
  },
  {
    id: 'documents',
    title: 'Professional Documents',
    overview: 'High-impact technical documentation, graphic assets, and business proposals.',
    icon: 'Briefcase',
    subServices: [
      { id: 'doc-1', name: 'ATS-Optimized CV & Cover Letter', description: 'Modern technical CV formatting for tech and entry-level roles.', price: 800, estimateType: 'Fixed' },
      { id: 'doc-2', name: 'Comprehensive Business Plan & Pitch Deck', description: 'Detailed financial projections, market analysis, and slide deck design.', price: 7500, estimateType: 'Starting' },
      { id: 'doc-3', name: 'Professional Graphic Design & Logo Package', description: 'Vector logo creation, social media branding, and typography.', price: 2500, estimateType: 'Fixed' },
      { id: 'doc-4', name: 'Custom Invoice / Quotation Templates', description: 'Branded PDF templates built for small businesses.', price: 500, estimateType: 'Fixed' }
    ]
  },
  {
    id: 'consultation',
    title: 'IT Consultation',
    overview: '1-on-1 technical advisory session for project strategy, stack selection, and system design.',
    icon: 'Code2',
    subServices: [
      { id: 'con-1', name: '30-Min Tech Consultation', description: 'Deductible from total project bill if hired for full project execution.', price: 500, estimateType: 'Fixed' },
      { id: 'con-2', name: '60-Min In-Depth System Architecture Session', description: 'Deep dive into tech stacks, system design, and project planning.', price: 1000, estimateType: 'Fixed' }
    ]
  }
];

export interface WebDevTier {
  id: string;
  type: string;
  priceRange: string;
  timeframe: string;
  deliverables: string;
}

export const WEB_DEV_TIERS: WebDevTier[] = [
  { id: 'web-1', type: 'Landing Page / One-Page Site', priceRange: 'KSh 15,000 – KSh 30,000', timeframe: '2 – 5 Days', deliverables: 'Single scrolling page, lead capture form, WhatsApp click-to-chat' },
  { id: 'web-2', type: 'SME Business Portfolio', priceRange: 'KSh 35,000 – KSh 70,000', timeframe: '1 – 2 Weeks', deliverables: '5–10 Pages, basic SEO, administrative dashboard, contact forms' },
  { id: 'web-3', type: 'Standard E-Commerce Store', priceRange: 'KSh 60,000 – KSh 120,000', timeframe: '2 – 4 Weeks', deliverables: 'Product catalogs, cart, automated Safaricom M-Pesa Daraja API, order notifications' },
  { id: 'web-4', type: 'Real Estate Listing Portal', priceRange: 'KSh 80,000 – KSh 180,000', timeframe: '3 – 5 Weeks', deliverables: 'Property upload panel, map pins, dynamic filters, agent profile dashboards' },
  { id: 'web-5', type: 'Job Board / Directory Platform', priceRange: 'KSh 90,000 – KSh 200,000', timeframe: '3 – 6 Weeks', deliverables: 'Resume uploads, search functionality, M-Pesa paywall for featured listings' },
  { id: 'web-6', type: 'SaaS / Web App MVP', priceRange: 'KSh 150,000 – KSh 350,000+', timeframe: '1 – 3 Months', deliverables: 'Custom MVP (SACCO portal, client billing, school management), database, auth, APIs' }
];
