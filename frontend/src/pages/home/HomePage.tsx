import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  Code2, 
  Brain, 
  Wifi,
  Camera, 
  ShoppingBag, 
  Users, 
  Heart,
  MapPin,
  Terminal,
  Briefcase,
  GraduationCap,
  CircleDot
} from 'lucide-react';

// Reordered: Portfolio → Services → AETSH-69 → Shop → Membership → Hobbies
const sections = [
  { 
    icon: Code2, 
    title: 'Portfolio', 
    desc: 'Engineering projects and case studies', 
    path: '/portfolio', 
    color: 'text-rust' 
  },
  { 
    icon: Wifi, 
    title: 'Services', 
    desc: 'Engineering and IT consultancy', 
    path: '/services', 
    color: 'text-rust' 
  },
  { 
    icon: Brain, 
    title: 'AETSH-69 AI', 
    desc: 'My AI concierge — ask me anything', 
    path: '/ai', 
    color: 'text-rust' 
  },
  { 
    icon: ShoppingBag, 
    title: 'Shop', 
    desc: 'Tools, kits and service packages', 
    path: '/shop', 
    color: 'text-rust' 
  },
  { 
    icon: Users, 
    title: 'Membership', 
    desc: 'Join the ecosystem — Builder tier', 
    path: '/membership', 
    color: 'text-rust' 
  },
  { 
    icon: Camera, 
    title: 'Hobbies', 
    desc: 'Photography, cooking, arcade games', 
    path: '/hobbies', 
    color: 'text-rust' 
  },
];

const timeline = [
  {
    icon: Briefcase,
    period: 'Aug 2026 – Nov 2026',
    title: 'Software Engineering Intern',
    org: 'Spin Mobile LLC · Upperhill, Nairobi',
    detail: 'Python · Django · PostgreSQL · Git/GitHub · PyCharm',
  },
  {
    icon: Code2,
    period: 'April 2025 – Present', // TODO: Replace with actual SmartShamba start date
    title: 'Co-Founder & CTO',
    org: 'SmartShamba · Nairobi',
    detail: 'Next.js 16 · TypeScript · Prisma · Supabase · USSD · M-Pesa · 9+ Counties',
  },
  {
    icon: GraduationCap,
    period: 'May 2024 – Sep 2026',
    title: 'Diploma in Computer Science (Level 6)',
    org: 'The Nairobi National Polytechnic',
    detail: 'CBET: Programming, Networking, Web Design, Databases, AI/ML, Information Systems',
  },
];

export default function HomePage() {
  return (
    <div className="space-y-20 pb-16 max-w-7xl mx-auto px-6">
      
      {/* HERO SECTION: 2-COLUMN GRID */}
      <section className="relative pt-6 lg:pt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Bio & Hero Text */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Location Tag */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900/80 border border-zinc-800 text-xs font-mono text-[#D96B43]">
              <MapPin className="w-3.5 h-3.5 text-[#D96B43]"/>
              <span>Nairobi, Kenya</span>
            </div>

            {/* Name Heading */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-serif font-bold tracking-tight text-zinc-100 leading-none">
              Mark Manoti <br />
              <span className="text-zinc-200">Ndege</span>
            </h1>

            {/* Subtitle / Tagline */}
            <p className="text-lg sm:text-xl text-zinc-300 max-w-2xl leading-relaxed font-medium">
              Software Engineering Intern @ Spin Mobile · Co-Founder & CTO @ SmartShamba · Systems Builder
            </p>
            <p className="text-sm text-zinc-500 font-mono">
              Building production systems from Nairobi, Kenya
            </p>

            {/* Status Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/30 text-sm text-green-400 font-mono">
              <CircleDot className="w-3.5 h-3.5 text-green-400 animate-pulse" />
              <span>Currently: Interning @ Spin Mobile</span>
            </div>

            {/* Main About / Summary Paragraphs */}
            <div className="space-y-4 max-w-2xl text-zinc-400 text-base leading-relaxed">
              <p>
                I'm Mark — a software engineer and Computer Science diploma student at The Nairobi National Polytechnic, graduating September 2026.
              </p>
              <p>
                I don't just study tech — I build it for real users. As Co-Founder & CTO of SmartShamba, I architected and shipped a production agri-tech platform now live across 9+ counties in Kenya, connecting feature-phone farmers (via Africa's Talking USSD *384*53374#) with institutional grain buyers (via web) on a unified Supabase PostgreSQL ledger — with M-Pesa payments, dispute resolution, group selling aggregation, GIS spatial queries, and an AI market intelligence engine backed by Gemini and NVIDIA models.
              </p>
              <p>
                Alongside that, I'm a Software Engineering Intern at Spin Mobile LLC, Upperhill Nairobi — writing Python, Django, and PostgreSQL under senior engineer mentorship, with weekly graded assessments and a capstone defense.
              </p>
              <p>
                My personal builds include AETSH-69 (a full-stack RAG AI platform with sub-second pgvector semantic search, FastAPI, and the Claude API — the system powering this site's AI concierge), DEEP-TRIO (a Scikit-learn malware scanner with an automated quarantine pipeline), and a 22-project Python engineering suite.
              </p>
              <p>
                I hold 8 professional certifications in AI/ML, Cybersecurity, Blockchain, IoT, and Cisco Networking. I also offer IT services in Nairobi covering networks, CCTV, computer maintenance, and hardware setup.
              </p>
              <p className="text-zinc-300 font-medium">
                Open to software engineering, full-stack development, AI/ML, cybersecurity, and IT support roles.
              </p>
            </div>

            {/* CTA Buttons & Support Badge */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link className="inline-flex items-center gap-2 px-6 py-3.5 rounded-lg bg-[#C25932] hover:bg-[#d96b43] text-white font-medium shadow-lg shadow-[#C25932]/20 transition-all duration-200" to="/portfolio">
                View Portfolio
                <ArrowRight className="w-4 h-4"/>
              </Link>

              <Link className="inline-flex items-center gap-2 px-6 py-3.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 font-medium transition-all duration-200" to="/services">
                My Services
              </Link>

              <div className="inline-flex items-center gap-2 px-4 py-3 rounded-lg bg-zinc-900/60 border border-zinc-800/80 text-xs font-mono text-zinc-400">
                <Heart className="w-3.5 h-3.5 text-red-400 fill-red-400/20"/>
                <span>Support my work</span>
              </div>
            </div>

          </div>

          {/* Right Column: Glass-Neumorphic Portrait Frame */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="relative group w-full max-w-md">
              
              {/* Soft Ambient Background Glow */}
              <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-[#D96B43]/30 to-amber-600/20 blur-2xl opacity-70 group-hover:opacity-100 transition duration-500" />

              {/* Neumorphic Extrusive Glass Shell */}
              <div className="relative p-3 rounded-3xl bg-zinc-900/60 backdrop-blur-xl border border-white/10 shadow-[16px_16px_36px_rgba(0,0,0,0.85),-8px_-8px_24px_rgba(255,255,255,0.03)] transition-all duration-300 group-hover:border-[#D96B43]/40">
                
                {/* CAD Corner Ticks */}
                <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-[#D96B43]/60" />
                <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-[#D96B43]/60" />
                <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-[#D96B43]/60" />
                <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-[#D96B43]/60" />

                {/* Inner Image Container */}
                <div className="relative overflow-hidden rounded-2xl aspect-[3/4] bg-zinc-950">
                  <img
                    src="/mark-homepage-image1.jpeg"
                    alt="Mark Manoti Ndege"
                    className="w-full h-full object-cover object-center grayscale hover:grayscale-0 transition-all duration-700 scale-105 group-hover:scale-100"
                  />
                  
                  {/* Subtle Gradient Vignette Over Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent pointer-events-none" />
                </div>

                {/* Simplified Floating Architectural Badge */}
                <div className="absolute bottom-4 left-4 right-4 p-2.5 rounded-xl bg-zinc-950/80 backdrop-blur-md border border-white/10 flex items-center justify-center gap-2">
                  <Terminal className="w-4 h-4 text-[#D96B43]"/>
                  <span className="font-mono text-xs font-medium text-zinc-200 tracking-wider">MARK MANOTI</span>
                </div>

              </div>

            </div>
          </div>

        </div>
      </section>

      {/* EXPERIENCE TIMELINE SECTION */}
      <section className="space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-mono text-[#D96B43]">
          <Terminal className="w-3.5 h-3.5 text-[#D96B43]"/>
          <span>EXPERIENCE // TIMELINE</span>
        </div>
        
        <div className="space-y-4">
          {timeline.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="flex items-start gap-4 p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 hover:border-[#D96B43]/30 transition-all duration-200">
                <div className="p-2.5 rounded-lg bg-zinc-800/50 flex-none">
                  <Icon className="w-5 h-5 text-[#D96B43]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-zinc-500">{item.period}</span>
                  </div>
                  <h3 className="text-base font-serif font-semibold text-zinc-100">{item.title}</h3>
                  <p className="text-sm text-zinc-400">{item.org}</p>
                  <p className="text-xs font-mono text-zinc-500 mt-1">{item.detail}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 6-SECTION NAVIGATION GRID (Reordered) */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sections.map((section, idx) => {
          const Icon = section.icon;
          const CardContent = (
            <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 hover:border-[#D96B43]/50 backdrop-blur-sm transition-all duration-200 group h-full flex flex-col justify-between">
              <div className="space-y-4">
                <div className="p-3 rounded-xl bg-zinc-800/50 w-fit group-hover:bg-[#D96B43]/10 transition-colors">
                  <Icon className="w-6 h-6 text-[#D96B43]"/>
                </div>
                <h3 className="text-xl font-serif font-semibold text-zinc-100">{section.title}</h3>
                <p className="text-sm text-zinc-400">{section.desc}</p>
              </div>
              <div className="pt-4 flex items-center gap-1 text-xs font-mono text-[#D96B43] group-hover:translate-x-1 transition-transform">
                <span>Explore</span>
                <ArrowRight className="w-3.5 h-3.5"/>
              </div>
            </div>
          );

          return section.path ? (
            <Link key={idx} to={section.path}>
              {CardContent}
            </Link>
          ) : (
            <div key={idx} className="cursor-pointer">
              {CardContent}
            </div>
          );
        })}
      </section>

      {/* CALL TO ACTION BANNER */}
      <section className="p-8 rounded-2xl bg-gradient-to-r from-zinc-900 via-zinc-900 to-[#C25932]/20 border border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center sm:text-left">
          <h2 className="text-2xl font-serif font-bold text-zinc-100">Join the ecosystem</h2>
          <p className="text-sm text-zinc-400">Get exclusive tutorials, priority AI access, and direct collaboration.</p>
        </div>
        <Link className="px-6 py-3 rounded-lg bg-[#C25932] hover:bg-[#d96b43] text-white font-medium text-sm whitespace-nowrap transition-colors" to="/membership">
          View membership plans &rarr;
        </Link>
      </section>

    </div>
  );
}
