import { useState, useRef, useEffect } from "react";

// Drop-in replacement for <img> — shows a shimmering placeholder until the
// image has actually decoded, instead of a blank box or a layout jump.
// Renders no wrapper element, so it slots into existing `.card img { … }`
// CSS untouched — just make sure the parent has `position: relative`.
//
// Lazy by default: the <img> isn't even mounted until it's about to enter
// the viewport (via IntersectionObserver). Without this, a plain <img>
// starts fetching the moment it mounts — even scrolled off-screen far
// below the fold — so by the time you actually scroll to it, it's long
// since loaded and the shimmer has nothing left to show. Pass eager to
// skip this and load immediately (for above-the-fold images).
//
// minDurationMs guarantees the shimmer stays visible for at least that
// long, measured from the moment loading actually starts (i.e. from when
// it scrolls into view for lazy images) — not from mount — so it holds
// consistently even on a fast connection.
export default function ImageWithSkeleton({ src, alt, style, onError, minDurationMs = 400, eager = false, ...rest }) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const [inView, setInView] = useState(eager);
  const startRef = useRef(eager ? Date.now() : null);
  const skeletonRef = useRef(null);

  useEffect(() => {
    if (inView) return;
    const el = skeletonRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          startRef.current = Date.now();
          setInView(true);
        }
      },
      { rootMargin: "150px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [inView]);

  const reveal = () => {
    const elapsed = Date.now() - (startRef.current ?? Date.now());
    const wait = Math.max(0, minDurationMs - elapsed);
    setTimeout(() => setLoaded(true), wait);
  };

  if (failed) return null;

  return (
    <>
      {inView && (
        <img
          src={src}
          alt={alt}
          decoding="async"
          onLoad={reveal}
          onError={(e) => { setFailed(true); onError?.(e); }}
          style={{ opacity: loaded ? 1 : 0, transition: "opacity 0.35s ease", ...style }}
          {...rest}
        />
      )}
      {!loaded && (
        <div ref={skeletonRef} className="skeleton" style={{ position: "absolute", inset: 0 }} aria-hidden="true" />
      )}
    </>
  );
}
