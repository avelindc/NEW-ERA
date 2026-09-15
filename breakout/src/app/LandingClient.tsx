"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, useAnimation, useInView } from "framer-motion";
import { ArrowRight, Play, X, Menu, Sparkles, CheckCircle2, ChevronRight, Music, Disc3, ShieldCheck, Zap, Globe, Layers, BarChart3, TrendingUp, Instagram, Headphones, Youtube } from "lucide-react";

export function AnimatedSection({ children, className = "", delay = 0 }: { children: React.ReactNode, className?: string, delay?: number }) {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const controls = useAnimation();

  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }
  }, [isInView, controls]);

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={{
        hidden: { opacity: 0, y: 40 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] } }
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function AnimatedCounter({ value, duration = 2 }: { value: number, duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      let start = 0;
      const end = value;
      const totalSteps = 60 * duration;
      const step = end / totalSteps;
      let currentStep = 0;

      const timer = setInterval(() => {
        start += step;
        currentStep++;
        if (currentStep >= totalSteps) {
          setCount(end);
          clearInterval(timer);
        } else {
          setCount(Math.floor(start));
        }
      }, 1000 / 60);

      return () => clearInterval(timer);
    }
  }, [isInView, value, duration]);

  return <span ref={ref}>{count.toLocaleString("id-ID")}</span>;
}

export function NeonArrowButton({ href = "/register", text = "LEARN MORE", size = "normal" }: { href?: string, text?: string, size?: "small" | "normal" | "large" }) {
  const sizeClasses = size === "small" 
    ? "px-4 py-2 text-xs" 
    : size === "large" 
    ? "px-8 py-4 text-base tracking-wider" 
    : "px-6 py-2.5 text-xs tracking-wider";

  const arrowSize = size === "small" ? "w-5 h-5 text-[10px]" : size === "large" ? "w-8 h-8 text-sm" : "w-6 h-6 text-xs";

  return (
    <Link 
      href={href} 
      className={`btn-neon-lime uppercase font-black ${sizeClasses} group inline-flex items-center gap-2`}
    >
      <span>{text}</span>
      <span className={`btn-arrow-circle ${arrowSize}`}>
        <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
      </span>
    </Link>
  );
}

export function RoundArrowBadge({ href = "/register" }: { href?: string }) {
  return (
    <Link 
      href={href}
      className="w-11 h-11 rounded-full bg-[#D4FF00] hover:bg-[#e2ff4d] text-black flex items-center justify-center shadow-[0_0_20px_rgba(212,255,0,0.35)] hover:scale-110 active:scale-95 transition-all duration-200"
    >
      <ArrowRight className="w-5 h-5 stroke-[2.5]" />
    </Link>
  );
}

export function Navbar({ cms }: { cms: any }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={`sticky top-0 z-50 w-full transition-all duration-300 ${
      scrolled 
        ? 'bg-[#0E091B]/95 backdrop-blur-xl border-b border-white/10 shadow-[0_10px_35px_rgba(0,0,0,0.5)]' 
        : 'bg-[#0E091B]/70 backdrop-blur-md border-b border-white/5'
    }`}>
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex items-center">
            <span className="font-display text-3xl sm:text-4xl text-white tracking-wider leading-none">
              BREAK<span className="text-[#D4FF00]">OUT</span>
            </span>
          </div>
        </Link>
        
        {/* Nav Links */}
        <div className="hidden lg:flex items-center gap-7 text-[12px] font-extrabold uppercase tracking-widest text-gray-300">
          <Link href="#about" className="hover:text-[#D4FF00] transition-colors">ABOUT</Link>
          <Link href="#distribution" className="hover:text-[#D4FF00] transition-colors">DISTRIBUTION</Link>
          <Link href="#features" className="hover:text-[#D4FF00] transition-colors">WHY US</Link>
          
          <Link href="#releases" className="hover:text-[#D4FF00] transition-colors">CATALOG</Link>
          <Link href="#partners" className="hover:text-[#D4FF00] transition-colors">PARTNERS</Link>
          <Link href="#contact" className="hover:text-[#D4FF00] transition-colors">CONTACT</Link>
        </div>
        
        {/* Right CTA */}
        <div className="hidden sm:flex items-center gap-4">
          <Link href="/login" className="text-xs font-bold uppercase tracking-wider text-gray-300 hover:text-white px-3 py-2 transition">
            LOGIN
          </Link>
          <Link 
            href={cms?.hero?.ctaLink || "/register"} 
            className="btn-neon-lime text-xs tracking-wider uppercase px-5 py-2.5 shadow-[0_0_20px_rgba(212,255,0,0.3)]"
          >
            <span>{cms?.hero?.ctaText || "START DISTRIBUTING"}</span>
            <span className="btn-arrow-circle w-5 h-5 text-[10px]">
              <ArrowRight className="w-3 h-3 stroke-[3]" />
            </span>
          </Link>
        </div>

        {/* Mobile menu trigger */}
        <button 
          className="lg:hidden text-white p-2 rounded-xl bg-white/5 hover:bg-white/10"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="w-6 h-6 text-[#D4FF00]" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:hidden max-w-7xl mx-auto mt-2 p-6 rounded-3xl bg-[#150D27]/98 backdrop-blur-2xl border border-white/10 shadow-2xl flex flex-col gap-4"
        >
          <Link href="#about" onClick={() => setMobileMenuOpen(false)} className="text-sm font-bold tracking-wider uppercase text-gray-200 hover:text-[#D4FF00]">ABOUT</Link>
          <Link href="#distribution" onClick={() => setMobileMenuOpen(false)} className="text-sm font-bold tracking-wider uppercase text-gray-200 hover:text-[#D4FF00]">DISTRIBUTION</Link>
          <Link href="#features" onClick={() => setMobileMenuOpen(false)} className="text-sm font-bold tracking-wider uppercase text-gray-200 hover:text-[#D4FF00]">WHY US</Link>
          
          <Link href="#artists" onClick={() => setMobileMenuOpen(false)} className="text-sm font-bold tracking-wider uppercase text-gray-200 hover:text-[#D4FF00]">ARTISTS</Link>
          <Link href="#partners" onClick={() => setMobileMenuOpen(false)} className="text-sm font-bold tracking-wider uppercase text-gray-200 hover:text-[#D4FF00]">OUR PARTNERS</Link>
          <div className="pt-4 border-t border-white/10 flex flex-col gap-3">
            <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="text-center py-2.5 rounded-full border border-white/20 text-white font-bold text-xs uppercase tracking-wider">LOGIN</Link>
            <Link href="/register" onClick={() => setMobileMenuOpen(false)} className="btn-neon-lime py-3 text-center text-xs uppercase tracking-wider">START DISTRIBUTING</Link>
          </div>
        </motion.div>
      )}
    </header>
  );
}

export function PlayerModal({ 
  isOpen, 
  onClose, 
  url, 
  type 
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  url: string, 
  type: "youtube" | "spotify" 
}) {
  if (!isOpen) return null;

  const getEmbedUrl = () => {
    if (type === "youtube") {
      try {
        const urlObj = new URL(url);
        let videoId = "";
        if (urlObj.hostname.includes("youtube.com")) videoId = urlObj.searchParams.get("v") || "";
        if (urlObj.hostname.includes("youtu.be")) videoId = urlObj.pathname.slice(1);
        return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
      } catch (e) {
        return url;
      }
    }
    if (type === "spotify") {
      try {
        const urlObj = new URL(url);
        const path = urlObj.pathname;
        return `https://open.spotify.com/embed${path}?utm_source=generator`;
      } catch (e) {
        return url;
      }
    }
    return url;
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="absolute inset-0" onClick={onClose} />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-4xl bg-[#110B22] rounded-3xl overflow-hidden border border-white/20 shadow-[0_0_60px_rgba(212,255,0,0.2)]"
      >
        <button onClick={onClose} className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/70 hover:bg-black text-white rounded-full flex items-center justify-center transition backdrop-blur border border-white/20">
          <X className="w-5 h-5 text-[#D4FF00]" />
        </button>
        <div className="w-full aspect-video">
          <iframe 
            src={getEmbedUrl()} 
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowFullScreen
          />
        </div>
      </motion.div>
    </div>
  );
}

export function FeaturedReleaseCard({ release }: { release: any }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="relative rounded-[28px] overflow-hidden bg-[#180F2E] border border-white/10 group hover:border-[#D4FF00]/50 transition-all duration-300 shadow-xl flex flex-col">
        <div className="relative aspect-square overflow-hidden">
          <img 
            src={release.coverUrl} 
            alt={release.title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#180F2E] via-transparent to-transparent opacity-80" />
          
          {/* Play Trigger */}
          <button 
            onClick={() => setIsModalOpen(true)}
            className="absolute bottom-4 right-4 w-12 h-12 rounded-full bg-[#D4FF00] hover:bg-white text-black flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 active:scale-95"
          >
            <Play className="w-5 h-5 ml-0.5 fill-black" />
          </button>
        </div>
        
        <div className="p-5 flex-1 flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-[#D4FF00] block mb-1">
              OFFICIAL RELEASE
            </span>
            <h3 className="text-xl font-bold text-white leading-snug line-clamp-1">{release.title}</h3>
            <p className="text-gray-400 text-sm mt-0.5">{release.artist}</p>
          </div>
        </div>
      </div>

      <PlayerModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        url={release.playerUrl} 
        type={release.playerType} 
      />
    </>
  );
}
