import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// SVG Blueprint Tech Sketch Component
const TechSketch = ({ 
  d, 
  className, 
  delay, 
  highlight, 
  label 
}: { 
  d: string; 
  className: string; 
  delay: number; 
  highlight?: boolean;
  label?: string;
}) => (
  <div className={`absolute hidden sm:flex flex-col items-center gap-1 ${className}`}>
    <svg width="70" height="70" viewBox="0 0 24 24" fill="none" stroke={highlight ? "#D96B43" : "#3F3F46"} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="transition-colors duration-500">
      <motion.path
        d={d}
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: highlight ? 1 : 0.6 }}
        transition={{ duration: 1.2, delay, ease: "easeInOut" }}
      />
    </svg>
    {label && (
      <motion.span 
        initial={{ opacity: 0 }}
        animate={{ opacity: highlight ? 0.8 : 0.3 }}
        className="font-mono text-[9px] tracking-widest text-[#A1A1AA] uppercase"
      >
        {label}
      </motion.span>
    )}
  </div>
);

// CAD Corner Crosshair Marker
const CADCorner = ({ position }: { position: string }) => (
  <div className={`absolute hidden sm:block ${position} pointer-events-none p-4 flex items-center justify-center text-[#3F3F46]`}>
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1">
      <line x1="8" y1="0" x2="8" y2="16" />
      <line x1="0" y1="8" x2="16" y2="8" />
    </svg>
  </div>
);

export default function IntroLoader() {
  const [show, setShow] = useState(false);
  const [textIndex, setTextIndex] = useState(0);
  const [typedText, setTypedText] = useState("");
  const isMounted = useRef(false);

  const texts = [
    "[ INIT: MARK'S DIGITAL LAB ]",
    "Welcome to my digital space — where code, hardware, and architecture meet.",
    "Entering the Ecosystem..."
  ];

  // Typewriter Effect Logic
  useEffect(() => {
    isMounted.current = true;
    let currentText = texts[textIndex];
    let i = 0;
    setTypedText("");

    const typingInterval = setInterval(() => {
      if (i < currentText.length) {
        if (isMounted.current) {
          setTypedText((prev) => prev + currentText.charAt(i));
        }
        i++;
      } else {
        clearInterval(typingInterval);
      }
    }, 25);

    return () => {
      isMounted.current = false;
      clearInterval(typingInterval);
    };
  }, [textIndex]);

  useEffect(() => {
    const seen = sessionStorage.getItem('hasSeenIntro');
    if (!seen) {
      setShow(true);
      
      const timers = [
        setTimeout(() => setTextIndex(1), 1000),
        setTimeout(() => setTextIndex(2), 2600),
        setTimeout(() => {
          setShow(false);
          sessionStorage.setItem('hasSeenIntro', 'true');
        }, 3800)
      ];

      const handleKey = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          timers.forEach(clearTimeout);
          setShow(false);
          sessionStorage.setItem('hasSeenIntro', 'true');
        }
      };
      window.addEventListener('keydown', handleKey);

      return () => {
        timers.forEach(clearTimeout);
        window.removeEventListener('keydown', handleKey);
      };
    }
  }, []);

  const handleSkip = () => {
    setShow(false);
    sessionStorage.setItem('hasSeenIntro', 'true');
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div 
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#121212] overflow-hidden select-none"
          initial={{ opacity: 1 }}
          exit={{ 
            clipPath: 'inset(50% 0 50% 0)', 
            opacity: 0.9,
            transition: { duration: 0.75, ease: [0.77, 0, 0.175, 1] } 
          }}
        >
          {/* CAD Corner Registration Crosshairs */}
          <CADCorner position="top-4 left-4" />
          <CADCorner position="top-4 right-4" />
          <CADCorner position="bottom-4 left-4" />
          <CADCorner position="bottom-4 right-4" />

          {/* Architectural Telemetry Metadata */}
          <div className="absolute top-8 left-10 font-mono text-[10px] text-zinc-500 tracking-widest uppercase hidden lg:block">
            [ 01 // ARCH_GRID_SYS ]
          </div>
          <div className="absolute top-8 right-10 font-mono text-[10px] text-zinc-500 tracking-widest uppercase hidden lg:block">
            [ LOC: NBO_KENYA // 1.2863° S ]
          </div>
          <div className="absolute bottom-8 left-10 font-mono text-[10px] text-zinc-500 tracking-widest uppercase hidden lg:block">
            [ STATUS: OPERATIONAL ]
          </div>

          {/* Architectural Grid Lines */}
          <div className="absolute inset-0 pointer-events-none">
            <motion.div className="absolute top-1/4 left-0 right-0 h-px bg-[#27272A]/80" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.8, ease: 'easeInOut' }} style={{ transformOrigin: 'left' }} />
            <motion.div className="absolute bottom-1/4 left-0 right-0 h-px bg-[#27272A]/80" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.8, ease: 'easeInOut' }} style={{ transformOrigin: 'right' }} />
            <motion.div className="absolute left-1/4 top-0 bottom-0 w-px bg-[#27272A]/80" initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ duration: 0.8, ease: 'easeInOut' }} style={{ transformOrigin: 'top' }} />
            <motion.div className="absolute right-1/4 top-0 bottom-0 w-px bg-[#27272A]/80" initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ duration: 0.8, ease: 'easeInOut' }} style={{ transformOrigin: 'bottom' }} />
          </div>

          {/* Technical CAD Sketches at Grid Intersections */}
          <TechSketch 
            d="M 2 6 L 22 6 L 22 13 L 2 13 Z M 5 13 L 5 16 M 8 13 L 8 16 M 11 13 L 11 16 M 14 13 L 14 16 M 17 13 L 17 16 M 20 13 L 20 16" 
            className="top-[18%] left-[12%] xl:left-[18%]" 
            delay={0.2} 
            highlight={textIndex > 0} 
            label="RAM_DDR5"
          /> 
          
          <TechSketch 
            d="M 5 13 L 19 13 L 19 18 L 5 18 Z M 8 18 L 8 21 M 16 18 L 16 21 M 12 8 A 5 5 0 0 1 17 13 M 12 5 A 8 8 0 0 1 20 13" 
            className="top-[18%] right-[12%] xl:right-[18%]" 
            delay={0.3} 
            highlight={textIndex > 0} 
            label="NET_GATEWAY"
          /> 

          <TechSketch 
            d="M 6 4 L 18 4 L 18 12 L 14 12 L 14 20 L 10 20 L 10 12 L 6 12 Z M 9 4 L 9 8 M 12 4 L 12 8 M 15 4 L 15 8" 
            className="bottom-[18%] left-[12%] xl:left-[18%]" 
            delay={0.4} 
            highlight={textIndex > 0} 
            label="CAT6_RJ45"
          /> 

          <TechSketch 
            d="M 6 9 C 4 9 3 13 4 17 C 5 18 7 18 8 16 L 10 14 L 14 14 L 16 16 C 17 18 19 18 20 17 C 21 13 20 9 18 9 Z M 8 11 L 8 13 M 7 12 L 9 12 M 16 11 A 0.5 0.5 0 1 1 16 11.1 M 17.5 12.5 A 0.5 0.5 0 1 1 17.5 12.6" 
            className="bottom-[18%] right-[12%] xl:right-[18%]" 
            delay={0.5} 
            highlight={textIndex > 0} 
            label="ARCADE_PAD"
          />

          {/* Center Mascot Emblem + Dial Ring */}
          <div className="relative z-10 flex flex-col items-center gap-8">
            <div className="relative flex items-center justify-center">
              <motion.div 
                className="absolute -inset-4 rounded-full border border-dashed border-[#D96B43]/50 pointer-events-none"
                animate={{ rotate: 360 }}
                transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
              />
              <motion.div 
                className="absolute -inset-8 rounded-full border border-dotted border-[#3F3F46]/60 pointer-events-none"
                animate={{ rotate: -360 }}
                transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
              />

              <motion.div 
                className="relative w-28 h-28 rounded-full border border-[#3F3F46] bg-[#121212] flex items-center justify-center overflow-hidden p-1"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.6, ease: 'easeOut' }}
              >
                <motion.div 
                  className="absolute inset-0 rounded-full border-2 border-[#D96B43]"
                  animate={{ 
                    boxShadow: [
                      '0 0 0px rgba(217, 107, 67, 0)', 
                      '0 0 25px 6px rgba(217, 107, 67, 0.45)', 
                      '0 0 0px rgba(217, 107, 67, 0)'
                    ] 
                  }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                />
                <img 
                  src="/Aetshlogo.png" 
                  alt="AETSH Logo Mascot" 
                  className="w-full h-full object-cover rounded-full" 
                />
              </motion.div>
            </div>

            {/* Terminal Typewriter Narrative Bar */}
            <div className="h-16 flex items-center justify-center px-4 max-w-lg text-center">
              <p className={`font-mono text-sm sm:text-base tracking-wide ${textIndex === 0 ? 'text-[#D96B43] font-semibold' : 'text-[#FAFAFA]'}`}>
                {typedText}
                <motion.span
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                  className="inline-block ml-1 w-2 h-4 bg-[#D96B43] align-middle"
                />
              </p>
            </div>
          </div>

          {/* Skip Intro Button */}
          <button 
            onClick={handleSkip}
            className="absolute bottom-8 right-8 text-xs text-zinc-500 hover:text-white transition-colors font-mono uppercase tracking-widest flex items-center gap-2 border border-zinc-800 hover:border-zinc-600 px-3 py-1.5 rounded-sm bg-zinc-900/50 backdrop-blur-sm"
          >
            SKIP LOG [ESC]
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
