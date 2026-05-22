import { useEffect, useState, useCallback } from "react";

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
  const total = SLIDES.length;

  const goTo = useCallback((n) => {
    setCurrent((n + total) % total);
  }, [total]);

  // Auto-slide every 2 seconds
  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => goTo(current + 1), 2000);
    return () => clearInterval(t);
  }, [current, paused, goTo]);

  return (
    <div
      className="hs-root"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* ── SLIDES ── */}
      <div
        className="hs-track"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {SLIDES.map((s, i) => (
          <div key={i} className="hs-slide">
            {/* Background image */}
            <div
              className={`hs-bg ${i === current ? "zoomed" : ""}`}
              style={{ backgroundImage: `url(${s.image})` }}
            />
            {/* Dark overlay */}
            <div className="hs-overlay" />
            {/* Text content */}
            <div className="hs-content">
              <span className="hs-tag">{s.tag}</span>
              <h1 className="hs-title">{s.title}</h1>
              <p className="hs-desc">{s.desc}</p>
              <div className="hs-btns">
                <a href="#appointments" className="hs-btn-primary">Book Appointment</a>
                <a href="#about"        className="hs-btn-outline">Learn More</a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── LEFT ARROW ── */}
      <button className="hs-arrow hs-prev" onClick={() => goTo(current - 1)}>
        &#8592;
      </button>

      {/* ── RIGHT ARROW ── */}
      <button className="hs-arrow hs-next" onClick={() => goTo(current + 1)}>
        &#8594;
      </button>

      {/* ── DOTS ── */}
      <div className="hs-dots">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            className={`hs-dot ${i === current ? "active" : ""}`}
            onClick={() => goTo(i)}
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
    </div>
  );
}

export default HeroSlider;