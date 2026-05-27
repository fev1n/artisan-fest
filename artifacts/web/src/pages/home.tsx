import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Menu, X, Instagram, Facebook, Mail } from "lucide-react";
import logoImg from "/sauga-logo.jpg";

const useReducedMotion = () => {
  const [pref, setPref] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPref(mq.matches);
    const h = (e: MediaQueryListEvent) => setPref(e.matches);
    mq.addEventListener("change", h);
    return () => mq.removeEventListener("change", h);
  }, []);
  return pref;
};

const useCountdown = () => {
  const [time, setTime] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  useEffect(() => {
    const target = new Date("August 22, 2026 12:00:00").getTime();
    const tick = () => {
      const d = target - Date.now();
      if (d < 0) return;
      setTime({ days: Math.floor(d / 86400000), hours: Math.floor((d % 86400000) / 3600000), minutes: Math.floor((d % 3600000) / 60000), seconds: Math.floor((d % 60000) / 1000) });
    };
    tick(); const id = setInterval(tick, 1000); return () => clearInterval(id);
  }, []);
  return time;
};

const scrollTo = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
  e.preventDefault();
  const el = document.getElementById(id);
  if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 80, behavior: "smooth" });
};

// ── Info card data ────────────────────────────────────────────────────────────

const infoItems = [
  { value: "AUGUST 22, 2026", key: "saf-info-date", defaultPos: { x: 12, y: 120 }, bg: "#fdb92e", color: "#3d0082", shadow: "#c9901a", rot: "-3deg" },
  { value: "12 PM – 8 PM",   key: "saf-info-time", defaultPos: { x: 12, y: 192 }, bg: "#e7572f", color: "#ffffff", shadow: "#a83a1a", rot: "2deg" },
  { value: "PORT CREDIT MEMORIAL PARK", key: "saf-info-loc", defaultPos: { x: 12, y: 264 }, bg: "#3d0082", color: "#fdb92e", shadow: "#1e0040", rot: "-1.5deg" },
];

// ── Shared visual components ──────────────────────────────────────────────────

const CountdownInner = ({ time }: { time: { days: number; hours: number; minutes: number; seconds: number } }) => (
  <div
    className="px-4 py-3 rounded-2xl flex gap-3"
    style={{
      background: "#fdb92e",
      boxShadow: "4px 4px 0px #c9901a",
      transform: "rotate(1.5deg)",
      fontFamily: "'Squada One', sans-serif",
    }}
  >
    {(["days", "hours", "minutes", "seconds"] as const).map(u => (
      <div key={u} className="flex flex-col items-center min-w-[38px]">
        <span className="text-xl text-[#3d0082] leading-none" style={{ letterSpacing: "0.08em" }}>{time[u]}</span>
        <span className="text-[9px] uppercase text-[#3d0082]/60" style={{ letterSpacing: "0.15em" }}>
          {{ days: "DAYS", hours: "HRS", minutes: "MIN", seconds: "SEC" }[u]}
        </span>
      </div>
    ))}
  </div>
);

// ── Reusable draggable widget (desktop only) ──────────────────────────────────

interface DraggableWidgetProps {
  storageKey: string;
  defaultPos: { x: number; y: number };
  bobAnimation?: boolean;
  children: React.ReactNode;
  className?: string;
  testId?: string;
}

const DraggableWidget = ({ storageKey, defaultPos, bobAnimation = false, children, className = "", testId }: DraggableWidgetProps) => {
  const noMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState(() => {
    try { const s = localStorage.getItem(storageKey); if (s) return JSON.parse(s); } catch {}
    return defaultPos;
  });
  const [drag, setDrag] = useState(false);
  const ds = useRef({ mx: 0, my: 0, px: 0, py: 0 });

  const onDown = (e: React.PointerEvent) => {
    setDrag(true);
    ds.current = { mx: e.pageX, my: e.pageY, px: pos.x, py: pos.y };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onMove = (e: React.PointerEvent) => {
    if (!drag || !ref.current) return;
    const { width, height } = ref.current.getBoundingClientRect();
    const maxX = document.documentElement.scrollWidth;
    const maxY = document.documentElement.scrollHeight;
    setPos({
      x: Math.max(0, Math.min(ds.current.px + e.pageX - ds.current.mx, maxX - width)),
      y: Math.max(80, Math.min(ds.current.py + e.pageY - ds.current.my, maxY - height)),
    });
  };
  const onUp = (e: React.PointerEvent) => {
    setDrag(false);
    localStorage.setItem(storageKey, JSON.stringify(pos));
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  return (
    <div
      ref={ref}
      data-testid={testId}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
      className={`z-40 select-none absolute ${drag ? "cursor-grabbing" : "cursor-grab"} ${bobAnimation && !drag && !noMotion ? "animate-[countdown-bob_4s_infinite_ease-in-out]" : ""} ${className}`}
      style={{ left: pos.x, top: pos.y, touchAction: "none" }}
    >
      {children}
    </div>
  );
};

// ── Draggable Countdown (desktop) ─────────────────────────────────────────────

const DraggableCountdown = () => {
  const time = useCountdown();
  const defaultX = typeof window !== "undefined" ? window.innerWidth - 280 : 700;

  return (
    <DraggableWidget storageKey="saf-countdown-pos" defaultPos={{ x: defaultX, y: 120 }} bobAnimation testId="countdown-widget">
      <CountdownInner time={time} />
    </DraggableWidget>
  );
};

// ── Draggable Info Cards (desktop) ────────────────────────────────────────────

const DraggableInfoCards = () => (
  <>
    {infoItems.map(item => (
      <DraggableWidget key={item.key} storageKey={item.key} defaultPos={item.defaultPos} bobAnimation>
        <div
          className="px-5 py-3 rounded-2xl"
          style={{
            background: item.bg,
            color: item.color,
            transform: `rotate(${item.rot})`,
            boxShadow: `4px 4px 0px ${item.shadow}`,
            fontFamily: "'Squada One', sans-serif",
            letterSpacing: "0.12em",
            fontSize: "0.8rem",
            textTransform: "uppercase",
            whiteSpace: "nowrap",
          }}
        >
          {item.value}
        </div>
      </DraggableWidget>
    ))}
  </>
);

// ── Mobile Info Bar (static, no drag) ────────────────────────────────────────

const MobileInfoBar = () => {
  const noMotion = useReducedMotion();
  const time = useCountdown();

  return (
    <div className="flex flex-col items-center gap-4 my-8">
      <div
        className={noMotion ? "" : "animate-[countdown-bob_4s_0s_infinite_ease-in-out]"}
      >
        <CountdownInner time={time} />
      </div>
      {infoItems.map((item, i) => (
        <div
          key={item.key}
          className={noMotion ? "" : "animate-[countdown-bob_4s_infinite_ease-in-out]"}
          style={{ animationDelay: `${(i + 1) * 0.6}s` }}
        >
          <div
            className="px-5 py-3 rounded-2xl"
            style={{
              background: item.bg,
              color: item.color,
              transform: `rotate(${item.rot})`,
              boxShadow: `4px 4px 0px ${item.shadow}`,
              fontFamily: "'Squada One', sans-serif",
              letterSpacing: "0.12em",
              fontSize: "0.85rem",
              textTransform: "uppercase",
              whiteSpace: "nowrap",
            }}
          >
            {item.value}
          </div>
        </div>
      ))}
    </div>
  );
};

// ── Floating Apply ────────────────────────────────────────────────────────────

const FloatingApply = () => {
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const h = () => setVis(window.scrollY > window.innerHeight * 0.5);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);
  return (
    <a href="/apply" data-testid="floating-apply-btn"
      className={`fixed bottom-6 right-6 z-40 bg-[#fdb92e] text-[#3d0082] font-bold font-sans rounded-full shadow-xl flex items-center justify-center transition-all duration-300 hover:scale-105 hover:bg-[#e7572f] hover:text-white ${vis ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8 pointer-events-none"}`}>
      <span className="hidden sm:block px-6 py-4">Apply as Vendor →</span>
      <span className="sm:hidden w-14 h-14 flex items-center justify-center text-2xl">✦</span>
    </a>
  );
};

// ── Navbar ────────────────────────────────────────────────────────────────────

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  const links = [
    { name: "About", href: "about" },
    { name: "Vendors", href: "vendors" },
    { name: "Vendor List", href: "vendor-list" },
    { name: "Location", href: "location" },
  ];

  return (
    <header data-testid="nav"
      className={`fixed top-0 left-0 w-full z-[60] transition-all duration-300 ${scrolled ? "bg-white/95 backdrop-blur-md shadow-md py-3" : "bg-white py-4"}`}>
      <div className="container mx-auto px-4 md:px-6 flex justify-between items-center">
        <a href="#">
          <img src={logoImg} alt="Sauga Artisan Festival" className="h-10 w-10 rounded-md object-cover" />
        </a>

        <nav className="hidden lg:flex items-center gap-7">
          {links.map(l => (
            <a key={l.name} href={`#${l.href}`} onClick={(e) => scrollTo(e, l.href)}
              className="text-sm font-sans font-semibold uppercase tracking-wide text-[#3d0082] hover:text-[#e7572f] transition-colors">
              {l.name}
            </a>
          ))}
          <a href="/apply"
            className="bg-[#e7572f] text-white px-5 py-2.5 rounded-full font-bold font-sans text-sm hover:bg-[#fdb92e] hover:text-[#3d0082] transition-all shadow-sm">
            Apply as Vendor
          </a>
        </nav>

        <button className="lg:hidden p-2 text-[#3d0082]" onClick={() => setOpen(!open)}>
          {open ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {open && (
        <div className="lg:hidden absolute top-full left-0 w-full bg-white border-t border-gray-100 shadow-xl flex flex-col p-5 gap-4">
          {links.map(l => (
            <a key={l.name} href={`#${l.href}`}
              onClick={(e) => { setOpen(false); scrollTo(e, l.href); }}
              className="text-base font-sans font-semibold text-[#3d0082] uppercase py-2 border-b border-gray-100">
              {l.name}
            </a>
          ))}
          <a href="/apply"
            className="bg-[#e7572f] text-white text-center px-5 py-3 rounded-full font-bold font-sans mt-1"
            onClick={() => setOpen(false)}>
            Apply as Vendor
          </a>
        </div>
      )}
    </header>
  );
};

// ── Hero ──────────────────────────────────────────────────────────────────────

const Hero = () => (
  <section id="hero" data-testid="hero-section"
    className="relative min-h-[100dvh] flex flex-col justify-center pt-20 overflow-hidden bg-white">

    <div className="container relative z-10 mx-auto px-4 md:px-6 flex-grow flex items-center py-16">
      <div className="w-full max-w-3xl mx-auto text-center">

        <div className="inline-flex items-center bg-[#fdb92e] text-[#3d0082] font-sans font-bold px-5 py-2 rounded-full text-sm tracking-widest uppercase mb-10 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-[#e7572f] mr-2 animate-[pulse-dot_2s_infinite]" />
          Free Entry · All Welcome
        </div>

        <h1 className="font-title leading-none mb-6 select-none">
          <span className="block text-7xl md:text-9xl lg:text-[10rem] text-[#fdb92e] tracking-tight">SAUGA</span>
          <span className="relative inline-block my-1 md:my-2">
            <span className="block bg-[#e7572f] text-white font-[Caveat] italic text-5xl md:text-7xl lg:text-8xl px-6 md:px-10 py-1 md:py-2 rounded-sm" style={{ fontStyle: "italic" }}>
              Artisan
            </span>
          </span>
          <span className="block text-7xl md:text-9xl lg:text-[10rem] text-[#fdb92e] tracking-tight">FESTIVAL</span>
        </h1>

        {/* Mobile-only static info cards with bobbing animation */}
        <div className="md:hidden">
          <MobileInfoBar />
        </div>

        <p className="text-xl md:text-2xl text-[#3d0082]/70 font-subtitle font-light mb-12 max-w-xl mx-auto leading-relaxed" style={{ fontWeight: 300 }}>
          A one-day celebration of local art, handmade goods, food, family activities, and creative small businesses in the heart of Port Credit.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 justify-center">
          <a href="/apply" data-testid="hero-apply-btn"
            className="w-full sm:w-auto bg-[#e7572f] text-white px-10 py-4 rounded-full font-bold font-sans text-lg hover:bg-[#fdb92e] hover:text-[#3d0082] transition-all shadow-lg text-center">
            Apply as Vendor
          </a>
          <a href="#about" onClick={(e) => scrollTo(e, "about")}
            className="w-full sm:w-auto border-2 border-[#3d0082] text-[#3d0082] hover:bg-[#3d0082] hover:text-white px-10 py-4 rounded-full font-bold font-sans text-lg transition-all text-center">
            Explore the Festival
          </a>
        </div>

        <div className="mt-8 font-[Caveat] text-xl text-[#3d0082]/40 animate-[countdown-bob_2.5s_infinite_ease-in-out]">↓ Scroll</div>
      </div>
    </div>

    <div className="w-full overflow-hidden bg-[#e7572f] py-3 flex">
      <div className="animate-[marquee-scroll_30s_linear_infinite] whitespace-nowrap flex font-[Caveat] text-2xl text-white">
        <span className="px-6">HANDMADE GOODS · LOCAL ARTISTS · ARTISAN FOOD · PORT CREDIT · AUG 22 2026 · FREE ENTRY · </span>
        <span className="px-6">HANDMADE GOODS · LOCAL ARTISTS · ARTISAN FOOD · PORT CREDIT · AUG 22 2026 · FREE ENTRY · </span>
      </div>
    </div>
  </section>
);

// ── About ─────────────────────────────────────────────────────────────────────

const About = () => {
  const noMotion = useReducedMotion();
  const anim = noMotion ? {} : { initial: { opacity: 0, y: 24 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.55 } };

  const cards = [
    { title: "Original Art", caption: "Paintings, prints & illustrations", bg: "#fdb92e", rot: "3deg" },
    { title: "Handmade Goods", caption: "Jewelry, pottery & crafts", bg: "#e7572f", rot: "-2deg" },
    { title: "Artisan Food", caption: "Local treats & sweets", bg: "#3d0082", rot: "2.5deg" },
  ];

  return (
    <section id="about" className="py-24 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          <motion.div {...anim} className="space-y-7">
            <h2 className="text-5xl md:text-6xl font-[Caveat] text-[#e7572f]">About the Festival</h2>
            <div className="text-lg md:text-xl font-sans text-[#3d0082]/75 leading-relaxed space-y-5">
              <p>Sauga Artisan Festival is about bringing homegrown products, original art, and local small businesses closer to audiences who value creativity and craftsmanship.</p>
              <p>Our goal is to build a welcoming space where artists and makers can launch their ideas, share their work, be discovered by wider audiences, and take meaningful steps toward long-term growth and success.</p>
            </div>
          </motion.div>

          <div className="flex items-center justify-center gap-5 md:gap-7 p-6 flex-wrap md:flex-nowrap">
            {cards.map((card, i) => (
              <motion.div key={i}
                initial={noMotion ? {} : { opacity: 0, scale: 0.9 }}
                whileInView={noMotion ? {} : { opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: noMotion ? 0 : i * 0.12 }}
                className="rounded-xl shadow-lg border-4 border-white flex flex-col justify-end p-5 hover:rotate-0 transition-transform duration-300 w-[138px] md:w-[155px] flex-shrink-0"
                style={{ background: card.bg, transform: `rotate(${card.rot})`, aspectRatio: "3/4" }}>
                <h3 className="font-[Caveat] text-lg text-white leading-tight mb-1">{card.title}</h3>
                <p className="font-[Caveat] text-base text-white/80">{card.caption}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

// ── Vendor Callout ────────────────────────────────────────────────────────────

const VendorCallout = () => {
  const noMotion = useReducedMotion();
  const anim = noMotion ? {} : { initial: { opacity: 0, y: 24 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.55 } };

  return (
    <section id="vendors" className="py-24 bg-[#e7572f] rounded-t-[3rem] text-white">
      <div className="container mx-auto px-4 md:px-6 max-w-4xl">
        <motion.div {...anim} className="text-center mb-14">
          <h2 className="text-5xl md:text-6xl font-[Caveat] text-white mb-6">Calling Local Artists, Makers & Food Vendors</h2>
          <p className="text-lg md:text-xl font-sans text-white/85 leading-relaxed max-w-2xl mx-auto">
            Vendor applications are now open. We are looking for original artists, handmade businesses, artisan food vendors, and creative small businesses who want to share their work with the community.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-5 mb-14 max-w-2xl mx-auto">
          {[
            { label: "Application Deadline", value: "May 30", highlight: true },
            { label: "Vendor Fee", value: "$100 + HST", highlight: false },
          ].map((d, i) => (
            <motion.div key={i} {...anim}
              className={`bg-white p-8 rounded-3xl text-center shadow-lg ${d.highlight ? "border-4 border-[#fdb92e] md:-translate-y-3" : ""}`}>
              <h3 className={`font-[Caveat] text-[#3d0082] mb-2 ${d.highlight ? "text-2xl" : "text-xl"}`}>{d.label}</h3>
              <p className={`font-sans font-bold ${d.highlight ? "text-2xl text-[#e7572f]" : "text-xl text-[#3d0082]"}`}>{d.value}</p>
            </motion.div>
          ))}
        </div>

        <motion.div {...anim} className="text-center">
          <a href="/apply" data-testid="vendor-apply-btn"
            className="inline-block bg-[#fdb92e] text-[#3d0082] hover:bg-white px-12 py-5 rounded-full font-bold font-sans text-xl transition-all hover:scale-105 shadow-xl mb-6">
            Apply as a Vendor
          </a>
          <p className="font-[Caveat] text-xl text-white/75 max-w-xl mx-auto">
            "Applications are reviewed to maintain a curated mix of quality, originality, and craftsmanship."
          </p>
        </motion.div>
      </div>
    </section>
  );
};

// ── Vendor List ───────────────────────────────────────────────────────────────

const VendorList = () => {
  const noMotion = useReducedMotion();
  const vendors = [
    { name: "HappyHueFaces", logo: "/vendors/HappyHueFaces.jpeg" },
    { name: "Luv Loop Craft", logo: "/vendors/LuvLoop.jpg" },
    { name: "Mia's", logo: "/vendors/Mias.jpg" },
    { name: "Save-The-Bread Social Enterprise", logo: "/vendors/SaveTheBread.webp" },
    { name: "Tinsel & Tatts", logo: "/vendors/TinselAndTatts.jpeg" },
  ];

  return (
    <section id="vendor-list" className="py-24 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-2xl mx-auto text-center mb-14">
          <h2 className="text-5xl md:text-6xl font-[Caveat] text-[#e7572f] mb-5">Vendor Lineup</h2>
          <p className="text-lg font-sans text-[#3d0082]/75 leading-relaxed">
            Meet the artists, makers, and businesses joining us at the festival.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 max-w-5xl mx-auto">
          {vendors.map((vendor, i) => (
            <motion.div key={i}
              initial={noMotion ? {} : { opacity: 0, y: 16 }}
              whileInView={noMotion ? {} : { opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: noMotion ? 0 : i * 0.08 }}
              className="flex flex-col items-center gap-3">
              <div className="w-full aspect-square rounded-2xl overflow-hidden border-2 border-[#fdb92e] shadow-md bg-[#fafafa]">
                <img src={vendor.logo} alt={vendor.name} className="w-full h-full object-cover" />
              </div>
              <p className="font-[Caveat] text-lg text-[#3d0082] text-center leading-tight">{vendor.name}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ── Sponsors ──────────────────────────────────────────────────────────────────

const Sponsors = () => (
  <section className="py-24 bg-[#fafafa]">
    <div className="container mx-auto px-4 md:px-6">
      <div className="bg-white rounded-[3rem] p-12 md:p-20 text-center max-w-4xl mx-auto shadow-lg border-2 border-[#fdb92e]">
        <h2 className="text-4xl md:text-5xl font-[Caveat] text-[#e7572f] mb-7">Partner With the Festival</h2>
        <p className="text-lg md:text-xl font-sans text-[#3d0082]/75 leading-relaxed mb-10">
          Sauga Artisan Festival is built to support local creativity, small businesses, and community connection. We welcome conversations with sponsors, community partners, and local organizations who want to be part of this first-year festival.
        </p>
        <a href="#contact" onClick={(e) => scrollTo(e, "contact")}
          className="inline-block border-2 border-[#e7572f] text-[#e7572f] hover:bg-[#e7572f] hover:text-white px-10 py-4 rounded-full font-bold font-sans text-lg transition-colors">
          Contact Us
        </a>
      </div>
    </div>
  </section>
);

// ── Location ──────────────────────────────────────────────────────────────────

const Location = () => (
  <section id="location" className="py-24 bg-white">
    <div className="container mx-auto px-4 md:px-6 max-w-3xl text-center">
      <h2 className="text-5xl md:text-6xl font-[Caveat] text-[#e7572f] mb-12">Location</h2>

      <div className="bg-[#fafafa] rounded-[3rem] border-2 border-[#fdb92e] shadow-lg relative overflow-hidden aspect-video flex items-center justify-center mb-10">
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 225" preserveAspectRatio="xMidYMid slice">
          <rect width="400" height="225" fill="#fafafa"/>
          <path d="M 0 185 Q 100 170 200 185 T 400 185 L 400 225 L 0 225 Z" fill="#bde0f5" opacity="0.5"/>
          <path d="M 0 195 Q 80 185 160 195 T 320 195 T 400 190 L 400 225 L 0 225 Z" fill="#7fc8f0" opacity="0.35"/>
          <line x1="130" y1="0" x2="130" y2="185" stroke="#e0d8f0" strokeWidth="1.5" strokeDasharray="5 4"/>
          <line x1="260" y1="0" x2="260" y2="185" stroke="#e0d8f0" strokeWidth="1.5" strokeDasharray="5 4"/>
          <line x1="0" y1="80" x2="400" y2="80" stroke="#e0d8f0" strokeWidth="1.5" strokeDasharray="5 4"/>
          <line x1="0" y1="140" x2="400" y2="140" stroke="#e0d8f0" strokeWidth="1.5" strokeDasharray="5 4"/>
          <rect x="150" y="92" width="100" height="72" rx="10" fill="#c8e6c9" opacity="0.5"/>
          <circle cx="200" cy="117" r="13" fill="#e7572f"/>
          <circle cx="200" cy="117" r="6" fill="#ffffff"/>
          <line x1="200" y1="130" x2="200" y2="145" stroke="#e7572f" strokeWidth="2.5"/>
          <text x="200" y="170" textAnchor="middle" fontFamily="Caveat, cursive" fontSize="13" fill="#3d0082">Port Credit Memorial Park</text>
        </svg>
      </div>

      <h3 className="font-[Caveat] text-3xl text-[#3d0082] mb-2">Port Credit Memorial Park</h3>
      <p className="font-sans text-lg text-[#3d0082]/60 mb-8">40 Lakeshore Rd E, Mississauga, ON L5G 1S4</p>

      <a href="https://www.google.com/maps/dir/?api=1&destination=40+Lakeshore+Rd+E+Mississauga+ON+L5G+1S4"
        target="_blank" rel="noopener noreferrer" data-testid="get-directions-btn"
        className="inline-block bg-[#e7572f] text-white px-8 py-4 rounded-full font-bold font-sans text-lg hover:bg-[#fdb92e] hover:text-[#3d0082] transition-all shadow-md">
        Get Directions
      </a>
    </div>
  </section>
);

// ── Footer ────────────────────────────────────────────────────────────────────

const Footer = () => (
  <footer id="contact" className="bg-[#3d0082] text-white py-12 border-t border-white/10">
    <div className="container mx-auto px-4 md:px-6 flex flex-col items-center text-center">
      <h2 className="font-[Caveat] text-3xl mb-3">Sauga Artisan Festival</h2>
      <p className="font-sans text-base text-white/70 mb-7">August 22, 2026 · Port Credit Memorial Park · Free Entry</p>
      <div className="flex gap-5 mb-7">
        <a href="mailto:art@saugaartisanfest.ca" className="text-white/60 hover:text-[#fdb92e] transition-colors p-2"><Mail size={22} /></a>
        <a href="https://www.instagram.com/saugaartisanfestival" target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-[#fdb92e] transition-colors p-2"><Instagram size={22} /></a>
        <a href="https://www.facebook.com/profile.php?id=61560675926283" target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-[#fdb92e] transition-colors p-2"><Facebook size={22} /></a>
      </div>
      <p className="font-sans text-xs text-white/40">© 2026 Sauga Artisan Festival. All rights reserved.</p>
    </div>
  </footer>
);

// ── Page ──────────────────────────────────────────────────────────────────────

export default function Home() {
  return (
    <div className="relative font-sans bg-white text-[#3d0082] overflow-x-hidden selection:bg-[#e7572f] selection:text-white">
      <Navbar />
      <main>
        <Hero />
        <About />
        <VendorCallout />
        <VendorList />
        <Sponsors />
        <Location />
      </main>
      <Footer />
      {/* Desktop-only draggable stickers */}
      <div className="hidden md:block">
        <DraggableCountdown />
        <DraggableInfoCards />
      </div>
      <FloatingApply />
    </div>
  );
}
