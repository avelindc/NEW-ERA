import Link from "next/link";
import { 
  Sparkles, 
  Play, 
  CheckCircle2, 
  ArrowRight, 
  Headphones, 
  Music, 
  Music2, 
  Radio, 
  Quote, 
  Disc3, 
  ShieldCheck, 
  Layers, 
  Zap, 
  Globe,
  Video
} from "lucide-react";
import { getLandingPageCMS } from "@/app/actions/cms";
import { getLandingStats } from "@/app/actions/landingStats";
import { Metadata } from "next";
import { 
  AnimatedSection, 
  AnimatedCounter, 
  Navbar, 
  FeaturedReleaseCard, 
  NeonArrowButton, 
  RoundArrowBadge 
} from "./LandingClient";
import FAQSection from "@/components/FAQSection";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  const cms = await getLandingPageCMS();
  return {
    title: cms.seo.title || "BREAKOUT - Modern Music Distribution",
    description: cms.seo.description || "Distribute your music worldwide to 150+ platforms.",
    keywords: cms.seo.keywords,
  };
}

export default async function LandingPage() {
  const cms = await getLandingPageCMS();
  const dbStats = await getLandingStats();

  const totalArtists = cms.stats.autoFromDb ? dbStats.artistCount : (cms.stats.totalArtists || 120);
  const totalReleases = cms.stats.autoFromDb ? dbStats.releaseCount : (cms.stats.totalReleases || 480);
  const totalStreams = cms.stats.autoFromDb ? dbStats.streamCount : (cms.stats.totalStreams || 1500000);

  // High quality curated stock visuals for editorial music-tech feel
  const HERO_BG = cms.hero.backgroundUrl || "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=2000&auto=format&fit=crop";
  const ABOUT_IMG = cms.aboutLabel.imageUrl || cms.about.imageUrl || "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=1200&auto=format&fit=crop";
  const CARD_BG_1 = "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=1000&auto=format&fit=crop";
  const CARD_BG_3 = "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=1000&auto=format&fit=crop";
  const CITY_IMG = "https://images.unsplash.com/photo-1506157786151-b8491531f063?q=80&w=1200&auto=format&fit=crop";
  const STAGE_IMG = "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1200&auto=format&fit=crop";

  return (
    <main className="min-h-screen bg-[#07040E] text-white selection:bg-[#D4FF00] selection:text-black py-4 sm:py-8 px-2 sm:px-4">
      
      {/* Editorial Frame Container */}
      <div className="editorial-frame relative">
        
        {/* Navigation */}
        <Navbar cms={cms} />

        {/* ========================================================================= */}
        {/* HERO SECTION (Grand Display + Sunset Atmosphere) */}
        {/* ========================================================================= */}
        <section className="relative min-h-[85vh] lg:min-h-[92vh] flex flex-col justify-between p-6 sm:p-12 lg:p-16 rounded-[36px] overflow-hidden m-2 sm:m-4 bg-gradient-to-b from-purple-950/40 via-purple-900/20 to-[#0E091B]">
          
          {/* Hero Background Image with Rich Color Grade */}
          <div className="absolute inset-0 z-0 pointer-events-none">
            <img 
              src={HERO_BG} 
              alt="Breakout Music" 
              className="w-full h-full object-cover object-center opacity-45 mix-blend-screen scale-105" 
            />
            {/* Sunset Violet/Pink/Cyan Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0E091B] via-[#0E091B]/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#120526]/90 via-[#120526]/40 to-transparent" />
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-[#FF007A]/25 via-[#7000FF]/20 to-transparent rounded-full blur-[140px]" />
          </div>

          {/* Top Label */}
          <div className="relative z-10">
            <AnimatedSection>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[#D4FF00] text-xs font-black tracking-widest uppercase mb-4">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{cms.hero.badge || "WELCOME TO BREAKOUT MUSIC"}</span>
              </div>
            </AnimatedSection>
          </div>

          {/* Center Main Headlines */}
          <div className="relative z-10 max-w-4xl my-auto pt-8 pb-12">
            <AnimatedSection delay={0.1}>
              <h1 className="font-display text-6xl sm:text-8xl lg:text-9xl tracking-tight text-white uppercase leading-[0.88] drop-shadow-2xl">
                {cms.hero.title1 || "YOUR MUSIC"}
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFFFFF] via-[#FF85C0] to-[#D4FF00]">
                  {cms.hero.title2 || "FOR EVERYONE"}
                </span>
              </h1>
            </AnimatedSection>

            <AnimatedSection delay={0.2}>
              <p className="mt-6 text-base sm:text-xl text-gray-300 max-w-2xl font-medium leading-relaxed drop-shadow">
                {cms.hero.subtitle || "A next-generation music distribution network. Release your tracks to Spotify, Apple Music, TikTok, YouTube Music and 150+ stores while keeping 100% control of your master."}
              </p>
            </AnimatedSection>

            {/* CTAs */}
            <AnimatedSection delay={0.3}>
              <div className="mt-8 flex flex-wrap items-center gap-4 sm:gap-6">
                <NeonArrowButton 
                  href={cms.hero.ctaLink || "/register"} 
                  text={cms.hero.ctaText || "START YOUR RELEASE"} 
                  size="large" 
                />

                <Link 
                  href="#about"
                  className="inline-flex items-center gap-3 px-6 py-4 rounded-full bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/20 text-white font-bold text-sm tracking-wider uppercase transition-all duration-200 group"
                >
                  <span className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center group-hover:scale-110 transition">
                    <Play className="w-4 h-4 fill-black ml-0.5" />
                  </span>
                  <span>EXPLORE BREAKOUT</span>
                </Link>
              </div>
            </AnimatedSection>
          </div>

          {/* Hero Bottom Stats Bar */}
          <div className="relative z-10 pt-6 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-6 items-center">
            <div>
              <div className="font-display text-3xl sm:text-4xl text-white">150+</div>
              <div className="text-[11px] font-extrabold uppercase tracking-widest text-[#D4FF00]">DSP Stores Worldwide</div>
            </div>
            <div>
              <div className="font-display text-3xl sm:text-4xl text-white"><AnimatedCounter value={totalArtists} />+</div>
              <div className="text-[11px] font-extrabold uppercase tracking-widest text-gray-400">Exclusive Creators</div>
            </div>
            <div>
              <div className="font-display text-3xl sm:text-4xl text-white"><AnimatedCounter value={totalReleases} />+</div>
              <div className="text-[11px] font-extrabold uppercase tracking-widest text-gray-400">Active Releases</div>
            </div>
            <div>
              <div className="font-display text-3xl sm:text-4xl text-white">100%</div>
              <div className="text-[11px] font-extrabold uppercase tracking-widest text-[#D4FF00]">Master Ownership</div>
            </div>
          </div>

        </section>

        {/* ========================================================================= */}
        {/* SECTION 2: THREE ASYMMETRIC VISUAL CARDS (Row 2 in Reference) */}
        {/* ========================================================================= */}
        <section id="distribution" className="p-4 sm:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            
            {/* Card 1: Distribute Everywhere (Image Card + Overlay + Lime Arrow) */}
            <div className="lg:col-span-4 relative rounded-[32px] overflow-hidden min-h-[340px] p-8 flex flex-col justify-between group border border-white/10 shadow-2xl">
              <img 
                src={CARD_BG_1} 
                alt="Distribute" 
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#14062B]/95 via-[#14062B]/60 to-[#7000FF]/30" />
              
              <div className="relative z-10">
                <h3 className="font-display text-3xl sm:text-4xl uppercase tracking-wide text-white leading-tight">
                  DISTRIBUTE<br />EVERYWHERE
                </h3>
                <p className="text-gray-300 text-xs sm:text-sm mt-2 max-w-xs">
                  Instant delivery to Spotify, Apple Music, TikTok, YouTube Music, and 150+ global stores.
                </p>
              </div>

              <div className="relative z-10 self-end">
                <RoundArrowBadge href="/register" />
              </div>
            </div>

            {/* Card 2: Keep Your Royalties (Clean Crisp White Card + Lime Button) */}
            <div className="lg:col-span-4 rounded-[32px] bg-white text-black p-8 sm:p-10 flex flex-col justify-between shadow-2xl">
              <div>
                <h3 className="font-display text-3xl sm:text-4xl uppercase tracking-tight text-gray-950 leading-tight">
                  KEEP YOUR<br />ROYALTIES
                </h3>
                <p className="text-gray-700 text-sm mt-3 leading-relaxed font-medium">
                  Transparent royalty tracking, daily stream analytics, automated split payments, and direct bank withdrawals.
                </p>
              </div>

              <div className="mt-8">
                <NeonArrowButton href="#pricing" text="LEARN MORE" size="normal" />
              </div>
            </div>

            {/* Card 3: Stay In Control (Purple/Violet Gradient Card + Lime Arrow) */}
            <div className="lg:col-span-4 relative rounded-[32px] overflow-hidden min-h-[340px] p-8 flex flex-col justify-between group border border-white/10 sunset-card-gradient shadow-2xl">
              <img 
                src={CARD_BG_3} 
                alt="Control" 
                className="absolute inset-0 w-full h-full object-cover opacity-25 mix-blend-overlay group-hover:scale-105 transition-transform duration-700" 
              />
              
              <div className="relative z-10">
                <h3 className="font-display text-3xl sm:text-4xl uppercase tracking-wide text-white leading-tight">
                  ENDLESS<br />POSSIBILITIES
                </h3>
                <p className="text-purple-200 text-xs sm:text-sm mt-2 max-w-xs">
                  Manage multiple artists, smart contracts, custom ISRC/UPC, and global marketing from one single dashboard.
                </p>
              </div>

              <div className="relative z-10 self-end">
                <RoundArrowBadge href="/register" />
              </div>
            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 3: ABOUT BREAKOUT (Asymmetric Split - Row 3 in Reference) */}
        {/* ========================================================================= */}
        <section id="about" className="p-4 sm:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            
            {/* Left Column: Editorial About Text */}
            <div className="lg:col-span-4 rounded-[32px] bg-[#140C26] border border-white/10 p-8 sm:p-10 flex flex-col justify-between shadow-2xl">
              <div>
                <span className="text-[11px] font-black uppercase tracking-widest text-[#D4FF00] block mb-2">
                  THE NEXT LEVEL
                </span>
                <h2 className="font-display text-4xl sm:text-5xl uppercase tracking-tight text-white mb-4 leading-none">
                  {cms.aboutLabel.title || "ABOUT BREAKOUT"}
                </h2>
                <p className="text-gray-300 text-sm leading-relaxed font-normal">
                  {cms.aboutLabel.description || "BREAKOUT is a premier music distribution ecosystem designed specifically for modern independent creators, record labels, and producers. We bridge the gap between creative freedom and global streaming reach."}
                </p>
                {cms.aboutLabel.vision && (
                  <p className="text-gray-400 text-xs mt-3 leading-relaxed">
                    {cms.aboutLabel.vision}
                  </p>
                )}
              </div>

              <div className="mt-8">
                <NeonArrowButton href="/register" text="DISCOVER MORE" size="normal" />
              </div>
            </div>

            {/* Right Column: Panoramic Cinematic Banner Card */}
            <div className="lg:col-span-8 relative rounded-[32px] overflow-hidden min-h-[380px] p-8 flex items-end justify-between group border border-white/10 shadow-2xl">
              <img 
                src={ABOUT_IMG} 
                alt="About Breakout" 
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0F071F]/90 via-[#0F071F]/30 to-transparent" />

              {/* Vertical / Accent Badge */}
              <div className="relative z-10">
                <span className="text-xs font-black uppercase tracking-widest text-[#D4FF00] px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 inline-block mb-2">
                  GLOBAL STAGE
                </span>
                <h3 className="font-display text-3xl sm:text-4xl text-white uppercase leading-none drop-shadow-lg">
                  EMPOWERING CREATORS WORLDWIDE
                </h3>
              </div>

              <div className="relative z-10">
                <RoundArrowBadge href="/register" />
              </div>
            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 4: WHY YOU'LL LOVE IT (Row 4 in Reference) */}
        {/* ========================================================================= */}
        <section id="features" className="p-4 sm:p-8">
          <div className="mb-6 px-2">
            <h2 className="font-display text-4xl sm:text-5xl uppercase tracking-tight text-white">
              WHY YOU'LL LOVE IT
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            
            {/* Left 3 Mini Cards Grid */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              {/* Feature 1 */}
              <div className="rounded-[28px] bg-white text-black p-6 flex flex-col justify-between shadow-xl">
                <div>
                  <div className="w-14 h-14 rounded-2xl overflow-hidden mb-4 shadow-md bg-[#7000FF] p-0.5">
                    <img src={CARD_BG_1} className="w-full h-full object-cover rounded-[14px]" alt="Vibrant" />
                  </div>
                  <h4 className="font-display text-xl uppercase tracking-tight text-gray-950 mb-2 leading-snug">
                    VIBRANT ECOSYSTEM
                  </h4>
                  <p className="text-gray-700 text-xs leading-relaxed font-medium">
                    A living, breathing music network full of reach, playlists, and global streaming opportunities.
                  </p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="rounded-[28px] bg-white text-black p-6 flex flex-col justify-between shadow-xl">
                <div>
                  <div className="w-14 h-14 rounded-2xl overflow-hidden mb-4 shadow-md bg-[#FF007A] p-0.5">
                    <img src={CITY_IMG} className="w-full h-full object-cover rounded-[14px]" alt="Direct" />
                  </div>
                  <h4 className="font-display text-xl uppercase tracking-tight text-gray-950 mb-2 leading-snug">
                    DIRECT PAYOUTS
                  </h4>
                  <p className="text-gray-700 text-xs leading-relaxed font-medium">
                    High-speed royalty settlements, transparent reports, and zero delay bank transfers.
                  </p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="rounded-[28px] bg-white text-black p-6 flex flex-col justify-between shadow-xl">
                <div>
                  <div className="w-14 h-14 rounded-2xl overflow-hidden mb-4 shadow-md bg-[#D4FF00] p-0.5">
                    <img src={STAGE_IMG} className="w-full h-full object-cover rounded-[14px]" alt="Catalog" />
                  </div>
                  <h4 className="font-display text-xl uppercase tracking-tight text-gray-950 mb-2 leading-snug">
                    NEW ERA CATALOG
                  </h4>
                  <p className="text-gray-700 text-xs leading-relaxed font-medium">
                    Next-gen music metadata management, automated ISRC/UPC generation and split control.
                  </p>
                </div>
              </div>

            </div>

            {/* Right 1 Large Scenic Card */}
            <div className="lg:col-span-5 relative rounded-[32px] overflow-hidden min-h-[280px] p-8 flex items-end justify-between group border border-white/10 shadow-2xl">
              <img 
                src={CITY_IMG} 
                alt="New Legacy" 
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0F071F]/95 via-[#0F071F]/40 to-transparent" />

              <div className="relative z-10">
                <h3 className="font-display text-3xl sm:text-4xl text-white uppercase leading-tight">
                  A NEW LEGACY<br />BEGINS
                </h3>
              </div>

              <div className="relative z-10">
                <RoundArrowBadge href="/register" />
              </div>
            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 5: WHAT ARTISTS SAY (Testimonials) */}
        {/* ========================================================================= */}
        {cms.testimonials && cms.testimonials.length > 0 && (
          <section className="p-4 sm:p-8">
            <div className="mb-6 px-2 flex justify-between items-end">
              <div>
                <span className="text-[11px] font-black uppercase tracking-widest text-[#D4FF00] block mb-1">REAL FEEDBACK</span>
                <h2 className="font-display text-4xl sm:text-5xl uppercase tracking-tight text-white">WHAT ARTISTS SAY</h2>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {cms.testimonials.map((testi, i) => (
                <div key={testi.id || i} className="rounded-[28px] bg-[#140C26] border border-white/10 p-6 flex flex-col justify-between shadow-xl group hover:border-[#D4FF00]/40 transition-all">
                  <div>
                    <Quote className="w-8 h-8 text-[#D4FF00]/40 mb-4" />
                    <p className="text-gray-300 text-sm leading-relaxed italic">"{testi.content}"</p>
                  </div>
                  <div className="flex items-center gap-3.5 mt-6 pt-4 border-t border-white/10">
                    {testi.avatarUrl && !testi.avatarUrl.includes("supabase.co") ? (
                      <img 
                        src={testi.avatarUrl} 
                        alt={testi.name} 
                        className="w-11 h-11 rounded-full object-cover ring-2 ring-[#D4FF00]/30" 
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#D4FF00]/20 to-purple-600/30 border border-[#D4FF00]/40 flex items-center justify-center font-black text-[#D4FF00] text-sm uppercase">
                        {testi.name?.substring(0, 2) || "AR"}
                      </div>
                    )}
                    <div>
                      <h4 className="font-bold text-white text-sm leading-tight">{testi.name}</h4>
                      <p className="text-[11px] font-bold text-[#D4FF00] tracking-wider uppercase mt-0.5">{testi.role || "Artist"}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ========================================================================= */}
        {/* SECTION 6: FEATURED RELEASES (Catalog Grid) */}
        {/* ========================================================================= */}
        {cms.featuredReleases && cms.featuredReleases.length > 0 && (
          <section id="releases" className="p-4 sm:p-8">
            <div className="mb-6 px-2 flex justify-between items-end">
              <div>
                <span className="text-[11px] font-black uppercase tracking-widest text-[#D4FF00] block mb-1">CATALOG HIGHLIGHTS</span>
                <h2 className="font-display text-4xl sm:text-5xl uppercase tracking-tight text-white">LATEST RELEASES</h2>
              </div>
              <Link href="/register" className="hidden sm:inline-flex text-xs font-black uppercase tracking-widest text-[#D4FF00] hover:underline items-center gap-1">
                VIEW ALL TRACKS <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {cms.featuredReleases.slice(0, 4).map((rel: any) => (
                <FeaturedReleaseCard key={rel.id} release={rel} />
              ))}
            </div>
          </section>
        )}

        {/* ========================================================================= */}
        {/* SECTION 7: PRICING SECTION (Simple. Transparent.) */}
        {/* ========================================================================= */}
        <section id="pricing" className="p-4 sm:p-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-[11px] font-black uppercase tracking-widest text-[#D4FF00] block mb-2">PLANS & PRICING</span>
            <h2 className="font-display text-4xl sm:text-6xl uppercase tracking-tight text-white leading-none">
              SIMPLE. TRANSPARENT.<br />BUILT FOR ARTISTS.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto items-stretch">
            
            {/* Basic Plan */}
            <div className="rounded-[32px] bg-[#140C26] border border-white/10 p-8 flex flex-col justify-between shadow-2xl">
              <div>
                <span className="text-xs font-black uppercase tracking-widest text-gray-400 block mb-1">STARTER</span>
                <h3 className="font-display text-3xl text-white">BASIC ARTIST</h3>
                <div className="my-6">
                  <span className="font-display text-5xl text-white">Rp 0</span>
                  <span className="text-gray-400 text-xs font-bold uppercase tracking-wider ml-1">/ LIFETIME</span>
                </div>
                <ul className="space-y-3 text-sm text-gray-300">
                  <li className="flex items-center gap-2.5"><CheckCircle2 className="w-4 h-4 text-[#D4FF00]" /> Distribusi ke 150+ Toko Musik</li>
                  <li className="flex items-center gap-2.5"><CheckCircle2 className="w-4 h-4 text-[#D4FF00]" /> Royalti Transparan 80%</li>
                  <li className="flex items-center gap-2.5"><CheckCircle2 className="w-4 h-4 text-[#D4FF00]" /> Dashboard Statistik</li>
                </ul>
              </div>
              <div className="mt-8">
                <Link href="/register" className="w-full py-3.5 rounded-full border border-white/20 hover:border-white text-white font-black text-xs uppercase tracking-wider text-center block transition">
                  GET STARTED FREE
                </Link>
              </div>
            </div>

            {/* Pro Plan (Highlighted Neon Tier) */}
            <div className="rounded-[32px] bg-white text-black p-8 flex flex-col justify-between shadow-2xl relative ring-4 ring-[#D4FF00]">
              <div className="absolute -top-3.5 right-8 px-4 py-1 rounded-full bg-[#D4FF00] text-black font-black text-[10px] tracking-widest uppercase shadow-md">
                RECOMMENDED
              </div>
              <div>
                <span className="text-xs font-black uppercase tracking-widest text-[#7000FF] block mb-1">EXCLUSIVE</span>
                <h3 className="font-display text-3xl text-gray-950">PRO ARTIST</h3>
                <div className="my-6">
                  <span className="font-display text-5xl text-gray-950">Rp 99K</span>
                  <span className="text-gray-600 text-xs font-bold uppercase tracking-wider ml-1">/ TAHUN</span>
                </div>
                <ul className="space-y-3 text-sm text-gray-800 font-medium">
                  <li className="flex items-center gap-2.5"><CheckCircle2 className="w-4 h-4 text-[#7000FF]" /> 100% Royalti Penuh Milik Anda</li>
                  <li className="flex items-center gap-2.5"><CheckCircle2 className="w-4 h-4 text-[#7000FF]" /> Unlimited Rilis Lagu & Cover</li>
                  <li className="flex items-center gap-2.5"><CheckCircle2 className="w-4 h-4 text-[#7000FF]" /> Prioritas Review 24-48 Jam</li>
                  <li className="flex items-center gap-2.5"><CheckCircle2 className="w-4 h-4 text-[#7000FF]" /> Gratis Kode ISRC & UPC Resmi</li>
                </ul>
              </div>
              <div className="mt-8">
                <NeonArrowButton href="/register" text="UPGRADE TO PRO" size="normal" />
              </div>
            </div>

            {/* Label Plan */}
            <div className="rounded-[32px] bg-[#140C26] border border-white/10 p-8 flex flex-col justify-between shadow-2xl">
              <div>
                <span className="text-xs font-black uppercase tracking-widest text-[#D4FF00] block mb-1">RECORD LABEL</span>
                <h3 className="font-display text-3xl text-white">LABEL & COLLECTIVE</h3>
                <div className="my-6">
                  <span className="font-display text-5xl text-white">Rp 299K</span>
                  <span className="text-gray-400 text-xs font-bold uppercase tracking-wider ml-1">/ TAHUN</span>
                </div>
                <ul className="space-y-3 text-sm text-gray-300">
                  <li className="flex items-center gap-2.5"><CheckCircle2 className="w-4 h-4 text-[#D4FF00]" /> Manajemen Multi-Artis Tanpa Batas</li>
                  <li className="flex items-center gap-2.5"><CheckCircle2 className="w-4 h-4 text-[#D4FF00]" /> Otomasi Split Pembayaran Artis</li>
                  <li className="flex items-center gap-2.5"><CheckCircle2 className="w-4 h-4 text-[#D4FF00]" /> Dedicated Account Manager</li>
                </ul>
              </div>
              <div className="mt-8">
                <Link href="/register" className="w-full py-3.5 rounded-full border border-white/20 hover:border-white text-white font-black text-xs uppercase tracking-wider text-center block transition">
                  REGISTER LABEL
                </Link>
              </div>
            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 8: FAQ ACCORDION */}
        {/* ========================================================================= */}
        <section className="p-4 sm:p-8">
          <FAQSection section={cms.faqSection} groups={cms.faqGroups} />
        </section>

        {/* ========================================================================= */}
        {/* SECTION 9: FINAL CTA BANNER (Row 5 in Reference) */}
        {/* ========================================================================= */}
        <section className="p-4 sm:p-8">
          <div className="relative rounded-[36px] overflow-hidden p-8 sm:p-14 sunset-card-gradient border border-white/15 flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl">
            
            {/* Big Watermark Typography */}
            <div className="relative z-10">
              <span className="text-[11px] font-black uppercase tracking-widest text-[#D4FF00] block mb-2">READY TO ELEVATE?</span>
              <h2 className="font-display text-5xl sm:text-7xl uppercase tracking-tight text-white leading-none">
                PUT YOUR MUSIC<br />WHERE THE WORLD LISTENS.
              </h2>
              <p className="text-purple-200 text-sm mt-3 max-w-lg">
                Join thousands of independent artists building their sustainable music career with BREAKOUT.
              </p>
            </div>

            <div className="relative z-10 flex-shrink-0">
              <NeonArrowButton 
                href="/register" 
                text="START YOUR RELEASE" 
                size="large" 
              />
            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 10: OUR PARTNERS & PLATFORM BADGES (Footer Platform Logos) */}
        {/* ========================================================================= */}
        <section id="partners" className="py-8 px-6 border-t border-white/10 bg-[#0B0616]">
          <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-center gap-8 sm:gap-14 opacity-75">
            <span className="font-display text-2xl text-white tracking-wider flex items-center gap-2">
              <Headphones className="w-5 h-5 text-[#1DB954]" /> SPOTIFY
            </span>
            <span className="font-display text-2xl text-white tracking-wider flex items-center gap-2">
              <Music className="w-5 h-5 text-[#FA243C]" /> APPLE MUSIC
            </span>
            <span className="font-display text-2xl text-white tracking-wider flex items-center gap-2">
              <Video className="w-5 h-5 text-[#FF0000]" /> YOUTUBE MUSIC
            </span>
            <span className="font-display text-2xl text-white tracking-wider flex items-center gap-2">
              <Music2 className="w-5 h-5 text-[#00F0FF]" /> TIKTOK
            </span>
            <span className="font-display text-2xl text-white tracking-wider flex items-center gap-2">
              <Radio className="w-5 h-5 text-[#FF7700]" /> DEEZER
            </span>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* FOOTER */}
        {/* ========================================================================= */}
        <footer id="contact" className="p-8 sm:p-12 bg-[#080410] border-t border-white/5">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
            <div className="md:col-span-2">
              <span className="font-display text-3xl text-white tracking-wider">
                BREAK<span className="text-[#D4FF00]">OUT</span>
              </span>
              <p className="text-gray-400 text-sm mt-3 max-w-sm leading-relaxed">
                {cms.footer.aboutText || "The premier modern music distribution platform. Empowering independent artists and labels worldwide."}
              </p>
            </div>

            <div>
              <h4 className="font-display text-lg text-white mb-4 tracking-wider">NAVIGATION</h4>
              <ul className="space-y-2 text-xs font-bold uppercase tracking-wider text-gray-400">
                <li><Link href="#about" className="hover:text-[#D4FF00] transition">About</Link></li>
                <li><Link href="#distribution" className="hover:text-[#D4FF00] transition">Distribution</Link></li>
                <li><Link href="#pricing" className="hover:text-[#D4FF00] transition">Pricing</Link></li>
                <li><Link href="/login" className="hover:text-[#D4FF00] transition">Artist Login</Link></li>
                <li><Link href="/register" className="hover:text-[#D4FF00] transition">Create Account</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-display text-lg text-white mb-4 tracking-wider">CONTACT</h4>
              <ul className="space-y-2 text-xs text-gray-400">
                <li>Email: support@breakoutmusicrecord.com</li>
                <li>WhatsApp: +62 812-3456-7890</li>
                <li>Jakarta, Indonesia</li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-600 gap-4">
            <p>{cms.footer.copyright || "© 2026 BREAKOUT Music Distribution. All rights reserved."}</p>
            <div className="flex gap-6">
              <Link href="#" className="hover:text-gray-400">Terms of Service</Link>
              <Link href="#" className="hover:text-gray-400">Privacy Policy</Link>
            </div>
          </div>
        </footer>

      </div>
    </main>
  );
}
