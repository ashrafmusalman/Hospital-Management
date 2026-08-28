import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";

// ─────────────────────────────────────────────
//  ADD YOUR OWN IMAGES HERE
//  Put image files inside:  public/images/
//  Then reference them as:  "/images/your-file.jpg"
// ─────────────────────────────────────────────
const SLIDES = [
 {
    image: "/hospital.png.avif",        // ✅ file is at public/hospital.png.avif
    tag:   "Orthopaedics & Spine",
    title: "Advanced Bone & Joint Care",
    desc:  "From complex trauma surgeries to robotic joint replacements.",
  },
  {
    image: "/image1.jpg",          // ← replace with your image
    tag:   "Cardiology",
    title: "Advanced Heart Care You Can Trust",
    desc:  "State-of-the-art cardiac care, 24/7 heart attack response & leading cardiologists.",
  },
  {
    image: "/image2.jpg",          // ← replace with your image
    tag:   "Neurology & Neurosurgery",
    title: "Precision Brain & Spine Treatment",
    desc:  "Minimally invasive neurosurgery, stroke care and neurological rehabilitation.",
  },
  {
    image: "/image3.jpg",          // ← replace with your image
    tag:   "Oncology",
    title: "Comprehensive Cancer Care",
    desc:  "Advanced medical, surgical and radiation oncology with personalised treatment plans.",
  },
];

function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const [paused,  setPaused]  = useState(false);
  const [loaded,  setLoaded]  = useState(() => new Set());
  const total = SLIDES.length;

  const goTo = useCallback((n) => {
    setCurrent((n + total) % total);
  }, [total]);

  // Preload every slide image once, so the shimmer only shows on the very
  // first paint — not every time you flip back to an already-seen slide.
  // A minimum shimmer duration keeps the effect visible even when an image
  // is served instantly (localhost, browser cache) instead of flashing by
  // in a handful of milliseconds.
  useEffect(() => {
    const start = Date.now();
    const reveal = (i) => {
      const wait = Math.max(0, 400 - (Date.now() - start));
      setTimeout(() => setLoaded((prev) => new Set(prev).add(i)), wait);
    };
    SLIDES.forEach((s, i) => {
      const img = new Image();
      img.onload = () => reveal(i);
      img.onerror = () => reveal(i);
      img.src = s.image;
    });
  }, []);

  // Auto-slide every 2 seconds — skipped when the user prefers reduced motion
  useEffect(() => {
    if (paused) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => goTo(current + 1), 2000);
    return () => clearInterval(t);
  }, [current, paused, goTo]);

  return (
    <motion.div
      className="hs-root"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      role="region"
      aria-roledescription="carousel"
      aria-label="Featured hospital services"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* ── SLIDES ── */}
      <motion.div
        className="hs-track"
        animate={{ x: `-${current * 100}%` }}
        transition={{ type: "spring", stiffness: 260, damping: 32 }}
      >
        {SLIDES.map((s, i) => (
          <div key={i} className="hs-slide">
            {/* Background image */}
            <div
              className={`hs-bg ${i === current ? "zoomed" : ""}`}
              style={{ backgroundImage: `url(${s.image})`, opacity: loaded.has(i) ? 1 : 0 }}
            />
            {!loaded.has(i) && <div className="skeleton" style={{ position: "absolute", inset: 0 }} aria-hidden="true" />}
            {/* Dark overlay */}
            <div className="hs-overlay" />
            {/* Text content */}
            <div className="hs-content">
              <span className="hs-tag">{s.tag}</span>
              <h1 className="hs-title">{s.title}</h1>
              <p className="hs-desc">{s.desc}</p>
              <div className="hs-btns">
                <motion.a href="#appointments" className="hs-btn-primary" whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }}>
                  Book Appointment
                </motion.a>
                <motion.a href="#about" className="hs-btn-outline" whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }}>
                  Learn More
                </motion.a>
              </div>
            </div>
          </div>
        ))}
      </motion.div>

      {/* ── LEFT ARROW ── */}
      <motion.button
        className="hs-arrow hs-prev"
        onClick={() => goTo(current - 1)}
        aria-label="Previous slide"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        &#8592;
      </motion.button>

      {/* ── RIGHT ARROW ── */}
      <motion.button
        className="hs-arrow hs-next"
        onClick={() => goTo(current + 1)}
        aria-label="Next slide"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        &#8594;
      </motion.button>

      {/* ── DOTS ── */}
      <div className="hs-dots" role="tablist" aria-label="Slides">
        {SLIDES.map((_, i) => (
          <motion.button
            key={i}
            className={`hs-dot ${i === current ? "active" : ""}`}
            onClick={() => goTo(i)}
            role="tab"
            aria-selected={i === current}
            aria-label={`Go to slide ${i + 1}: ${SLIDES[i].tag}`}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.85 }}
          />
        ))}
      </div>

      {/* ── COUNTER ── */}
      <div className="hs-counter">{current + 1} / {total}</div>

      {/* ── EMERGENCY TAB ── */}
      <div className="hs-emergency">
        <span>E</span><span>M</span><span>E</span><span>R</span>
        <span>G</span><span>E</span><span>N</span><span>C</span><span>Y</span>
      </div>
    </motion.div>
  );
}

export default HeroSlider;
