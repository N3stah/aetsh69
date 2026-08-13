import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, ExternalLink, LayoutGrid, List, Award, CheckCircle2, X, Download } from 'lucide-react';
import { CERTIFICATES_DATA } from '../../data/certificatesData';
import type { Certificate } from '../../data/certificatesData';

export default function CertificatesSection() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);

  const categories = ['All', 'AI & ML', 'Cybersecurity', 'Networking & IoT', 'Hackathons & Bootcamps'];

  const filteredCerts = activeFilter === 'All'
    ? CERTIFICATES_DATA
    : CERTIFICATES_DATA.filter((c) => c.category === activeFilter);

  return (
    <section id="certifications-section" className="space-y-10 pt-12 scroll-mt-24">
      
      {/* Header & Verified Badge */}
      <div className="space-y-4 max-w-3xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-mono text-[#D96B43]">
          <Award className="w-3.5 h-3.5 text-[#D96B43]"/>
          <span>VERIFIED CREDENTIALS // EDUCATION</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-serif font-bold text-zinc-100">
          Certifications & Achievements
        </h2>
        <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-[#D96B43]/10 border border-[#D96B43]/30 text-sm text-[#D96B43] font-mono">
          <CheckCircle2 className="w-4 h-4" />
          <span>Verified Professional Credentials & Academic Recognition</span>
        </div>
      </div>

      {/* Controls: Filters & View Switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div className="flex flex-wrap items-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all duration-200 ${
                activeFilter === cat
                  ? 'bg-[#C25932] text-white font-semibold'
                  : 'bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
              }`}
            >
              {cat} {cat === 'All' ? `(${CERTIFICATES_DATA.length})` : ''}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 bg-zinc-900/80 border border-zinc-800 rounded-lg p-1">
          <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-md ${viewMode === 'grid' ? 'bg-[#C25932] text-white' : 'text-zinc-400 hover:text-zinc-200'}`} aria-label="Grid View">
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-md ${viewMode === 'list' ? 'bg-[#C25932] text-white' : 'text-zinc-400 hover:text-zinc-200'}`} aria-label="List View">
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content Area */}
      <AnimatePresence mode="wait">
        {viewMode === 'grid' ? (
          <motion.div key="grid-view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCerts.map((cert) => (
              <div key={cert.id} className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 hover:border-[#D96B43]/50 transition-all duration-300 flex flex-col justify-between min-h-[260px]">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-[#D96B43]" />
                    <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-[10px] font-mono tracking-widest text-[#D96B43] uppercase border border-zinc-700/50">
                      {cert.category}
                    </span>
                  </div>
                  <h3 className="text-lg font-serif font-bold text-zinc-100 leading-tight">{cert.title}</h3>
                  <p className="text-xs text-zinc-400 font-mono">{cert.issuer}</p>
                  <p className="text-xs text-zinc-500">Issued: {cert.date}</p>
                </div>
                <div className="flex items-center justify-between pt-4 mt-4 border-t border-zinc-800/60">
                  <button onClick={() => setSelectedCert(cert)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#C25932] hover:bg-[#d96b43] text-white font-mono text-xs transition-colors shadow-sm">
                    <ExternalLink className="w-3.5 h-3.5"/><span>View Certificate</span>
                  </button>
                  {cert.verificationUrl && (
                    <a href={cert.verificationUrl} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-md bg-zinc-800/60 text-zinc-400 hover:text-white">
                      <CheckCircle2 className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </motion.div>
        ) : (
          <motion.div key="list-view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-2">
            {filteredCerts.map((cert) => (
              <div key={cert.id} className="flex items-center justify-between p-4 rounded-xl bg-zinc-900/40 hover:bg-zinc-900/80 border border-zinc-800/60 transition-all duration-200 gap-4 flex-wrap">
                <div className="flex items-center gap-3 flex-1 min-w-[200px]">
                  <FileText className="w-4 h-4 text-[#D96B43] flex-shrink-0" />
                  <span className="font-medium text-zinc-100 text-sm">{cert.title}</span>
                </div>
                <span className="text-xs text-zinc-400 font-mono hidden md:block">{cert.issuer}</span>
                <span className="text-xs text-zinc-500 font-mono hidden sm:block">{cert.date}</span>
                <button onClick={() => setSelectedCert(cert)} className="p-1.5 rounded-md bg-[#C25932] hover:bg-[#d96b43] text-white">
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Document Viewer Modal */}
      <AnimatePresence>
        {selectedCert && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            onClick={() => setSelectedCert(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-3xl h-[85vh] flex flex-col overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b border-zinc-800">
                <div>
                  <h3 className="text-lg font-bold text-zinc-100">{selectedCert.title}</h3>
                  <p className="text-xs text-zinc-400">{selectedCert.issuer} — {selectedCert.date}</p>
                </div>
                <button onClick={() => setSelectedCert(null)} className="text-zinc-400 hover:text-white p-2 rounded-lg hover:bg-zinc-800">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex-1 overflow-auto bg-zinc-950 p-4">
                {selectedCert.format === 'PDF' ? (
                  <iframe src={selectedCert.filePath} className="w-full h-full border-0" title={selectedCert.title}></iframe>
                ) : (
                  <img src={selectedCert.filePath} alt={selectedCert.title} className="w-full h-full object-contain" />
                )}
              </div>

              <div className="flex items-center justify-between p-4 border-t border-zinc-800">
                {selectedCert.credentialId ? (
                  <span className="text-xs font-mono text-zinc-500">Credential ID: {selectedCert.credentialId}</span>
                ) : (
                  <span className="text-xs font-mono text-zinc-600">Certificate Copy Available Upon Request</span>
                )}
                <a href={selectedCert.filePath} download target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#C25932] hover:bg-[#d96b43] text-white font-mono text-xs">
                  <Download className="w-4 h-4" /> Download
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </section>
  );
}
