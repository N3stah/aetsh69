import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Code2, ExternalLink, Terminal, Award, Download, Briefcase} from 'lucide-react';
import { PROJECTS_DATA } from '../../data/projectsData';
import { WORK_EXPERIENCE } from '../../data/workExperienceData';
import CertificatesSection from '../../components/portfolio/CertificatesSection';

export default function PortfolioPage() {
  const [activeFilter, setActiveFilter] = useState<string>('All');
  const [activeSection, setActiveSection] = useState<string>('projects-section');

  const categories = ['All', 'Flagship', 'AI', 'Cybersecurity', 'Systems/CLI'];

  const filteredProjects = activeFilter === 'All'
    ? PROJECTS_DATA
    : PROJECTS_DATA.filter((p) => p.category === activeFilter);

  // Scroll Spy Logic
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: '-30% 0px -60% 0px' }
    );

    const projectsSec = document.getElementById('projects-section');
    const certsSec = document.getElementById('certifications-section');
    if (projectsSec) observer.observe(projectsSec);
    if (certsSec) observer.observe(certsSec);

    return () => {
      if (projectsSec) observer.unobserve(projectsSec);
      if (certsSec) observer.unobserve(certsSec);
    };
  }, []);

  const handleNavClick = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="space-y-12 pb-20 pt-6 max-w-7xl mx-auto px-6">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row items-start justify-between gap-6">
        <div className="space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-mono text-[#D96B43]">
            <Terminal className="w-3.5 h-3.5 text-[#D96B43]"/>
            <span>ENGINEERING // REPOSITORIES</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-serif font-bold text-zinc-100">
            Projects & Codebases
          </h1>
          <p className="text-zinc-400 text-base sm:text-lg leading-relaxed">
            Full-stack web applications, AI RAG systems, machine learning scanners, and system-level tooling engineered by Mark Manoti Ndege from Nairobi, Kenya.
          </p>
        </div>
        <a 
          href="/assets_achieved/CV/Mark_Ndege_CV.pdf" 
          target="_blank" 
          rel="noreferrer"
          download
          className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-[#C25932] hover:bg-[#d96b43] text-white font-mono text-sm transition-colors shadow-md shadow-[#C25932]/20 whitespace-nowrap mt-2 md:mt-0"
        >
          <Download className="w-4 h-4" /> Download CV
        </a>
      </div>

      {/* Top Section Jump-Nav */}
      <div className="sticky top-16 z-40 bg-zinc-950/80 backdrop-blur-xl py-3 border-y border-zinc-800/60">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => handleNavClick('projects-section')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono transition-all ${
              activeSection === 'projects-section' ? 'bg-[#C25932] text-white shadow-md shadow-[#C25932]/20' : 'bg-zinc-900/80 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" /> Projects & Codebases (6)
          </button>
          <button 
            onClick={() => handleNavClick('certifications-section')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono transition-all ${
              activeSection === 'certifications-section' ? 'bg-[#C25932] text-white shadow-md shadow-[#C25932]/20' : 'bg-zinc-900/80 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
            }`}
          >
            <Award className="w-3.5 h-3.5" /> Certifications & Achievements (8)
          </button>
          <button 
            onClick={() => handleNavClick('experience-section')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono transition-all ${
              activeSection === 'experience-section' ? 'bg-[#C25932] text-white shadow-md shadow-[#C25932]/20' : 'bg-zinc-900/80 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" /> Work Experience (2)
          </button>
        </div>
      </div>

      {/* Projects Section */}
      <section id="projects-section" className="space-y-10 scroll-mt-32">
        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 border-b border-zinc-800 pb-4">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              className={`px-4 py-2 rounded-lg text-xs font-mono transition-all duration-200 ${
                activeFilter === cat
                  ? 'bg-[#C25932] text-white font-semibold shadow-md shadow-[#C25932]/20'
                  : 'bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
              }`}
            >
              {cat} {cat === 'All' ? `(${PROJECTS_DATA.length})` : ''}
            </button>
          ))}
        </div>

        {/* Bento Grid Matrix */}
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredProjects.map((project) => (
              <motion.div
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                key={project.id}
                className={`group relative p-6 rounded-2xl bg-zinc-900/50 backdrop-blur-xl border border-zinc-800/80 hover:border-[#D96B43]/50 transition-all duration-300 flex flex-col justify-between min-h-[320px] h-auto overflow-hidden ${
                  project.id === 'smartshamba' ? 'md:col-span-2 border-[#D96B43]/30 bg-gradient-to-br from-zinc-900/90 via-zinc-900/60 to-[#C25932]/10' : ''
                } ${project.id === 'aetsh69' ? 'md:col-span-2' : ''}`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-1 rounded-full bg-zinc-800/80 text-[10px] font-mono tracking-widest text-[#D96B43] uppercase border border-zinc-700/50">
                      {project.category}
                    </span>
                    {project.metrics && (
                      <span className="text-[11px] font-mono text-zinc-500 hidden sm:block">{project.metrics}</span>
                    )}
                  </div>
                  <div>
                    <h3 className="text-2xl font-serif font-bold text-zinc-100 group-hover:text-[#D96B43] transition-colors">{project.title}</h3>
                    <p className="text-xs font-mono text-zinc-400 mt-1">{project.subtitle}</p>
                  </div>
                  <p className="text-sm text-zinc-300 leading-relaxed">{project.description}</p>
                </div>

                <div className="space-y-6 pt-6 mt-auto">
                  <div className="flex flex-wrap gap-1.5">
                    {project.techStack.map((tech) => (
                      <span key={tech} className="px-2.5 py-1 rounded-md bg-zinc-950/80 text-zinc-300 font-mono text-[11px] border border-zinc-800">{tech}</span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-zinc-800/60 gap-2 flex-wrap">
                    <a href={project.githubUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-300 hover:text-white transition-colors bg-zinc-800/60 px-3 py-1.5 rounded-lg">
                      <Code2 className="w-4 h-4"/><span>Source Code</span>
                    </a>
                    {project.liveUrl && (
                      <a href={project.liveUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#C25932] hover:bg-[#d96b43] text-white font-mono text-xs transition-colors shadow-sm">
                        <ExternalLink className="w-3.5 h-3.5"/><span>Live App</span>
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </section>

      {/* Visual Divider */}
      <hr className="border-zinc-800/60" />

      {/* Certifications Section */}
      <CertificatesSection />

      {/* Work Experience Section */}
      <section id="experience-section" className="space-y-10 pt-12 scroll-mt-32">
        <div className="space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-mono text-[#D96B43]">
            <Briefcase className="w-3.5 h-3.5 text-[#D96B43]"/>
            <span>WORK EXPERIENCE // PROFESSIONAL ROLES</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-zinc-100">
            Work Experience
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {WORK_EXPERIENCE.map((job) => (
            <div key={job.id} className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 hover:border-[#D96B43]/50 transition-all duration-300 flex flex-col justify-between min-h-[280px]">
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2.5 py-1 rounded-full bg-[#D96B43]/10 text-[10px] font-mono tracking-widest text-[#D96B43] uppercase border border-[#D96B43]/30">
                    {job.badge}
                  </span>
                  <span className="text-[11px] font-mono text-zinc-500">
                    {job.period}
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-serif font-bold text-zinc-100">{job.title}</h3>
                  <p className="text-sm text-zinc-400 font-mono mt-1">{job.organisation}</p>
                </div>
                <p className="text-sm text-zinc-400 leading-relaxed">{job.description}</p>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-4 mt-auto">
                {job.tags.map(tag => (
                  <span key={tag} className="px-2.5 py-1 rounded-md bg-zinc-950/80 text-zinc-300 font-mono text-[11px] border border-zinc-800">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
