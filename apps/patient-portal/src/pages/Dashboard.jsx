import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import HeroSlider from "../components/HeroSlider";
import { Reveal, StaggerGroup, StaggerItem } from "../components/Reveal";
import ImageWithSkeleton from "../components/ImageWithSkeleton";
import { DoctorCardSkeleton } from "../components/Skeleton";
import { withMinDuration } from "../utils/minDelay";
import API from "../services/api";
import API_BASE_URL from "../config";

const HOSPITALS = [
  { name: "MediCare – Ahmedabad Main", img: "/image1.jpg", city: "Ahmedabad",  beds: "350+", tag: "NABH Accredited", est: "2005" },
  { name: "MediCare – Gandhinagar",    img: "/image2.jpg", city: "Gandhinagar", beds: "200+", tag: "NABH Accredited", est: "2010" },
  { name: "MediCare – Surat",          img: "/image3.jpg", city: "Surat",       beds: "280+", tag: "NABH Accredited", est: "2012" },
  { name: "MediCare – Vadodara",       img: "/image4.jpg", city: "Vadodara",    beds: "220+", tag: "NABH Accredited", est: "2014" },
];
const BLOGS = [
  { title: "Early Signs of Heart Disease You Should Never Ignore",   img: "/image5.jpg", date: "May 10, 2025",  tag: "Cardiology",   read: "5 min" },
  { title: "Joint Pain: When Is It Time to See a Doctor?",           img: "/image6.jpg", date: "Apr 28, 2025", tag: "Orthopaedics", read: "4 min" },
  { title: "Chest Pain Causes: Is It Your Heart or Something Else?", img: "/image7.jpg", date: "Apr 15, 2025", tag: "Cardiology",   read: "6 min" },
  { title: "Kidney Disease Warning Signs You Must Know Early",       img: "/image4.jpg", date: "Mar 30, 2025", tag: "Renal",        read: "4 min" },
];
// Fallback content — shown immediately and used if /settings/homepage can't be reached.
// The admin panel's "Site Content" page edits the live version of all of this.
const DEFAULT_CONTENT = {
  stats: [
    { icon: "🧑‍⚕️", num: "25000+", label: "Patients Treated",   sub: "Since 2005"       },
    { icon: "👨‍⚕️", num: "200+",   label: "Specialists",         sub: "Across all depts" },
    { icon: "🏆",   num: "18+",    label: "Years of Excellence", sub: "NABH accredited"  },
    { icon: "🏥",   num: "12+",    label: "Operation Theatres",  sub: "State-of-the-art" },
  ],
  about_intro: "Gujarat's first NABH-accredited private hospital with over 18 years of excellence in patient care.",
  feature_cards: [
    { icon: "🏆", title: "NABH Accredited",      desc: "Nationally accredited for quality and patient safety standards across all our facilities." },
    { icon: "🤝", title: "Transparent & Ethical", desc: "Honest communication, transparent billing, and a patient-first approach in everything we do." },
    { icon: "⚙️", title: "Modern Infrastructure", desc: "State-of-the-art facilities, cutting-edge technology and precision diagnostic equipment." },
  ],
  trust_badges: ["ISO 9001:2015", "JCI Standards", "NABH Certified", "WHO Guidelines"],
  specialities: [
    { icon:"❤️",  name:"Cardiac Sciences",           desc:"Heart attack care, angioplasty & bypass surgery."  },
    { icon:"🍽️", name:"Gastro Sciences",             desc:"Digestive disorders, endoscopy & liver care."      },
    { icon:"🧠",  name:"Neuro Sciences",              desc:"Stroke, epilepsy, brain & spine treatment."        },
    { icon:"🎗️", name:"Onco Sciences",               desc:"Medical, surgical & radiation oncology."           },
    { icon:"🦴",  name:"Orthopaedics & Trauma",       desc:"Joint replacement, fractures & sports injuries."  },
    { icon:"🫘",  name:"Renal Sciences",              desc:"Kidney disease, dialysis & transplantation."      },
    { icon:"🤖",  name:"Robotic Surgery",             desc:"Minimally invasive precision robotic procedures."  },
    { icon:"🫀",  name:"Solid Organ Transplantation", desc:"Kidney, liver & heart transplant expertise."       },
  ],
};
const API_BASE = API_BASE_URL;
const getImg   = (p) => p ? `${API_BASE}/${String(p).split("/").map(encodeURIComponent).join("/")}` : null;
const getInit  = (n="") => n.split(" ").map(w=>w[0]).slice(0,2).join("").toUpperCase();

const GRAD = [
  ["#16a34a","#059669"],["#2563eb","#0ea5e9"],["#7c3aed","#a855f7"],
  ["#dc2626","#f97316"],["#0891b2","#06b6d4"],["#d97706","#f59e0b"],
];

function useCounter(raw, duration=1800, inView) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const num = parseInt(raw.replace(/\D/g,""));
    if (!num) return;
    let v = 0; const step = num/(duration/16);
    const t = setInterval(() => { v = Math.min(v+step, num); setN(Math.floor(v)); if (v>=num) clearInterval(t); }, 16);
    return () => clearInterval(t);
  }, [raw, inView]);
  return n.toLocaleString() + raw.replace(/[\d,]/g,"");
}

function StatItem({ num, lbl, icon, sub, inView }) {
  const displayed = useCounter(num, 1600, inView);
  return (
    <div className="stat-cell">
      <div className="stat-emoji">{icon}</div>
      <div className="stat-num">{displayed}</div>
      <div className="stat-lbl">{lbl}</div>
      <div className="stat-sub">{sub}</div>
    </div>
  );
}

export default function Dashboard() {
  const [doctors, setDoctors] = useState([]);
  const [dLoad,   setDLoad]   = useState(true);
  const [content, setContent] = useState(DEFAULT_CONTENT);
  const statsRef              = useRef(null);
  const [inView,  setInView]  = useState(false);

  useEffect(() => {
    withMinDuration(API.get("/patient/doctors"), 500)
      .then(r => { setDoctors(r.data || []); setDLoad(false); })
      .catch(() => setDLoad(false));
  }, []);

  useEffect(() => {
    // Admin-editable homepage content (stats, about, specialities).
    // Falls back to DEFAULT_CONTENT above if the API is unreachable.
    API.get("/settings/homepage")
      .then(r => r.data && setContent(r.data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const obs = new IntersectionObserver(([e])=>{ if(e.isIntersecting) setInView(true); },{threshold:.25});
    if (statsRef.current) obs.observe(statsRef.current);
    return ()=>obs.disconnect();
  }, []);

  return (
    <div className="mc">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,700;0,9..144,900;1,9..144,700;1,9..144,900&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
        :root {
          --g:#16a34a;--g-d:#14532d;--g-m:#22c55e;--g-l:#f0fdf4;--g-xl:#dcfce7;
          --ink:#0c1a0e;--ink2:#1f2937;--ink3:#6b7280;--ink4:#9ca3af;
          --border:#e5e7eb;--border2:#f3f4f6;
          --white:#fff;--off:#f9fafb;--off2:#f3f4f6;
          --shadow-sm:0 1px 4px rgba(0,0,0,.06);
          --shadow-md:0 4px 20px rgba(0,0,0,.07),0 1px 4px rgba(0,0,0,.04);
          --shadow-lg:0 20px 50px rgba(0,0,0,.09),0 6px 16px rgba(0,0,0,.05);
          --shadow-green:0 8px 32px rgba(22,163,74,.2);
          --r:14px;--r-lg:22px;
        }
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        html{scroll-behavior:smooth;}
        body{font-family:'DM Sans',sans-serif;background:var(--white);color:var(--ink);}
        img{display:block;max-width:100%;}
        a{text-decoration:none;color:inherit;}
        .mc{overflow-x:hidden;}

        .announce{background:linear-gradient(90deg,var(--g-d),var(--g));padding:10px 5%;display:flex;align-items:center;justify-content:center;gap:10px;font-size:12.5px;color:rgba(255,255,255,.9);font-weight:500;}
        .announce strong{color:#fff;font-weight:700;}
        .announce-badge{background:rgba(255,255,255,.15);border:1px solid rgba(255,255,255,.25);border-radius:999px;padding:2px 10px;font-size:11px;font-weight:700;color:#fff;letter-spacing:.06em;text-transform:uppercase;}

        .inner{max-width:1180px;margin:0 auto;padding:0 5%;}
        .eyebrow{display:inline-flex;align-items:center;gap:8px;font-size:10.5px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--g);margin-bottom:14px;}
        .eyebrow::before{content:'';width:22px;height:2px;background:var(--g);border-radius:2px;}
        .sec-h{font-family:'Fraunces',serif;font-size:clamp(1.9rem,3.8vw,2.9rem);font-weight:900;color:var(--ink);letter-spacing:-.04em;line-height:1.05;margin-bottom:12px;}
        .sec-h em{font-style:italic;color:var(--g);}
        .sec-sub{font-size:15px;color:var(--ink3);line-height:1.8;max-width:52ch;}
        .divider{width:36px;height:3px;background:var(--g);border-radius:2px;margin:14px 0 20px;}

        .stats-band{background:var(--ink);}
        .stats-grid{display:grid;grid-template-columns:repeat(4,1fr);}
        .stat-cell{padding:40px 28px;text-align:center;border-right:1px solid rgba(255,255,255,.07);position:relative;overflow:hidden;transition:background .2s;}
        .stat-cell:last-child{border-right:none;}
        .stat-cell:hover{background:rgba(255,255,255,.025);}
        .stat-cell::after{content:'';position:absolute;bottom:0;left:0;right:0;height:3px;background:linear-gradient(90deg,var(--g),var(--g-m));transform:scaleX(0);transform-origin:left;transition:transform .4s ease;}
        .stat-cell:hover::after{transform:scaleX(1);}
        .stat-emoji{font-size:28px;margin-bottom:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%;}
        .stat-num{font-family:'Fraunces',serif;font-size:clamp(2rem,3.5vw,2.8rem);font-weight:900;color:#fff;letter-spacing:-.04em;line-height:1;margin-bottom:6px;}
        .stat-lbl{font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:rgba(255,255,255,.4);margin-bottom:5px;}
        .stat-sub{font-size:11px;color:rgba(255,255,255,.22);}

        .about-sec{padding:110px 0;background:var(--white);}
        .about-grid{display:grid;grid-template-columns:1fr 1fr;gap:88px;align-items:start;}
        .feat-card{display:flex;align-items:flex-start;gap:16px;padding:20px 22px;border-radius:var(--r);background:var(--off);border:1px solid var(--border);transition:all .22s;margin-bottom:12px;}
        .feat-card:hover{border-color:var(--g-m);background:var(--g-l);box-shadow:var(--shadow-green);transform:translateX(5px);}
        .feat-icon{width:46px;height:46px;border-radius:13px;flex-shrink:0;background:var(--g-xl);border:1px solid rgba(34,197,94,.2);display:flex;align-items:center;justify-content:center;font-size:20px;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;}
        .feat-title{font-size:14px;font-weight:700;color:var(--ink);margin-bottom:4px;}
        .feat-desc{font-size:13px;color:var(--ink3);line-height:1.65;}
        .spec-grid{display:grid;grid-template-columns:1fr 1fr;gap:11px;}
        .spec-card{background:var(--white);border:1px solid var(--border);border-radius:var(--r);padding:18px 16px;transition:all .22s;}
        .spec-card:hover{border-color:var(--g-m);background:var(--g-l);box-shadow:0 6px 24px rgba(22,163,74,.1);transform:translateY(-3px);}
        .spec-emoji{font-size:26px;margin-bottom:10px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%;}
        .spec-name{font-size:13px;font-weight:700;color:var(--ink);margin-bottom:4px;}
        .spec-desc{font-size:12px;color:var(--ink3);line-height:1.6;}
        .trust-row{display:flex;gap:12px;margin-top:32px;flex-wrap:wrap;}
        .trust-badge{display:flex;align-items:center;gap:8px;background:var(--off);border:1px solid var(--border);border-radius:999px;padding:8px 16px;font-size:12px;font-weight:600;color:var(--ink2);}
        .trust-badge-dot{width:7px;height:7px;border-radius:50%;background:var(--g);flex-shrink:0;}

        /* DOCTORS SECTION */
        .doctors-sec{padding:110px 0;background:var(--off);}
        .split-hdr{display:flex;align-items:flex-end;justify-content:space-between;gap:24px;margin-bottom:52px;flex-wrap:wrap;}
        .doc-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:18px;}

        /* NEW doctor card design */
        .doc-card{
          background:var(--white);border:1px solid var(--border);
          border-radius:20px;overflow:hidden;transition:all .3s;
          display:flex;flex-direction:column;
          box-shadow:var(--shadow-sm);
        }
        .doc-card:hover{transform:translateY(-10px);border-color:rgba(22,163,74,.25);box-shadow:0 28px 56px rgba(22,163,74,.15);}
        .doc-photo{height:200px;position:relative;overflow:hidden;}
        .doc-photo img{width:100%;height:100%;object-fit:cover;object-position:center top;transition:transform .4s ease;}
        .doc-card:hover .doc-photo img{transform:scale(1.06);}
        .doc-photo-placeholder{
          width:100%;height:100%;
          display:flex;align-items:center;justify-content:center;
        }
        .doc-init{
          width:72px;height:72px;border-radius:50%;
          color:#fff;display:flex;align-items:center;justify-content:center;
          font-family:'Fraunces',serif;font-size:26px;font-weight:900;
          box-shadow:0 4px 16px rgba(0,0,0,.2);
        }
        .doc-overlay{position:absolute;inset:0;background:linear-gradient(to top,rgba(12,26,14,.7) 0%,transparent 50%);}
        .doc-status{
          position:absolute;top:12px;right:12px;
          background:rgba(22,163,74,.9);color:#fff;
          font-size:9.5px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;
          padding:4px 10px;border-radius:20px;backdrop-filter:blur(4px);
          border:1px solid rgba(255,255,255,.2);
        }
        .doc-body{padding:16px 16px 18px;flex:1;display:flex;flex-direction:column;gap:8px;}
        .doc-name{font-size:14px;font-weight:700;color:var(--ink);line-height:1.3;}
        .doc-spec{display:inline-flex;align-items:center;gap:5px;background:var(--g-xl);color:var(--g-d);font-size:11px;font-weight:700;padding:3px 10px;border-radius:999px;}
        .doc-fee{font-size:12px;color:var(--ink3);display:flex;align-items:center;gap:4px;}
        .doc-fee strong{color:var(--g-d);font-weight:700;}
        .doc-cta{
          margin-top:auto;text-align:center;
          background:var(--g-l);border:1px solid rgba(22,163,74,.2);
          border-radius:10px;padding:9px;
          font-size:12px;font-weight:700;color:var(--g);transition:all .18s;
        }
        .doc-card:hover .doc-cta{background:var(--g);color:#fff;border-color:var(--g);}
        .doc-all{
          min-height:280px;background:var(--g-l);
          border:1.5px dashed rgba(22,163,74,.35);border-radius:20px;
          display:flex;flex-direction:column;align-items:center;justify-content:center;
          gap:10px;text-align:center;padding:28px;transition:all .22s;cursor:pointer;
        }
        .doc-all:hover{background:var(--g-xl);border-style:solid;border-color:var(--g);transform:translateY(-4px);}
        .doc-loading{
          grid-column:span 5;display:flex;align-items:center;justify-content:center;gap:12px;
          padding:48px;color:var(--ink3);font-size:14px;
        }
        .doc-spinner{width:24px;height:24px;border-radius:50%;border:2px solid var(--border);border-top-color:var(--g);animation:spin .7s linear infinite;}
        @keyframes spin{to{transform:rotate(360deg)}}

        .hosp-sec{padding:110px 0;background:var(--white);}
        .hosp-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:20px;}
        .hosp-card{background:var(--white);border:1px solid var(--border);border-radius:20px;overflow:hidden;transition:all .24s;display:flex;flex-direction:column;}
        .hosp-card:hover{transform:translateY(-6px);border-color:rgba(22,163,74,.28);box-shadow:0 20px 48px rgba(22,163,74,.12);}
        .hosp-photo{height:170px;position:relative;overflow:hidden;background:var(--g-l);}
        .hosp-photo img{width:100%;height:100%;object-fit:cover;transition:transform .4s ease;}
        .hosp-card:hover .hosp-photo img{transform:scale(1.05);}
        .hosp-badge{position:absolute;top:12px;left:12px;background:var(--g);color:#fff;font-size:9.5px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;padding:4px 10px;border-radius:5px;}
        .hosp-est{position:absolute;bottom:12px;right:12px;background:rgba(12,26,14,.7);color:rgba(255,255,255,.85);backdrop-filter:blur(6px);font-size:10px;font-weight:700;padding:3px 9px;border-radius:5px;}
        .hosp-body{padding:18px 18px 20px;flex:1;display:flex;flex-direction:column;}
        .hosp-city{font-size:11px;font-weight:700;color:var(--g);letter-spacing:.06em;text-transform:uppercase;margin-bottom:6px;display:flex;align-items:center;gap:5px;}
        .hosp-name{font-size:14px;font-weight:700;color:var(--ink);margin-bottom:5px;line-height:1.3;}
        .hosp-beds{font-size:12px;color:var(--ink3);margin-bottom:16px;display:flex;align-items:center;gap:5px;}
        .hosp-links{display:flex;gap:10px;margin-top:auto;}
        .hosp-btn{flex:1;text-align:center;padding:9px;border-radius:9px;font-size:12px;font-weight:700;transition:all .18s;cursor:pointer;border:none;font-family:'DM Sans',sans-serif;}
        .hosp-btn-p{background:var(--g-l);color:var(--g);border:1px solid rgba(22,163,74,.2);}
        .hosp-btn-p:hover{background:var(--g);color:#fff;}
        .hosp-btn-s{background:var(--off);color:var(--ink3);border:1px solid var(--border);}
        .hosp-btn-s:hover{background:var(--border);}

        .services-strip{padding:20px 0;background:var(--g-l);border-top:1px solid rgba(22,163,74,.12);border-bottom:1px solid rgba(22,163,74,.12);}
        .services-inner{display:flex;align-items:center;gap:0;overflow-x:auto;scrollbar-width:none;}
        .services-inner::-webkit-scrollbar{display:none;}
        .svc-item{display:flex;align-items:center;gap:8px;padding:0 28px;font-size:13px;font-weight:600;color:var(--g-d);white-space:nowrap;flex-shrink:0;border-right:1px solid rgba(22,163,74,.2);}
        .svc-item:last-child{border-right:none;}
        .svc-dot{width:6px;height:6px;border-radius:50%;background:var(--g);flex-shrink:0;}

        .cta-sec{padding:88px 0;background:var(--off);}
        .cta-box{background:var(--ink);border-radius:28px;padding:64px 60px;position:relative;overflow:hidden;}
        .cta-box::before{content:'';position:absolute;width:600px;height:600px;border-radius:50%;top:-260px;right:-160px;background:radial-gradient(circle,rgba(22,163,74,.22) 0%,transparent 65%);pointer-events:none;}
        .cta-box::after{content:'';position:absolute;width:320px;height:320px;border-radius:50%;bottom:-140px;left:4%;background:radial-gradient(circle,rgba(34,197,94,.1) 0%,transparent 70%);pointer-events:none;}
        .cta-top{position:relative;z-index:1;margin-bottom:48px;}
        .cta-eyebrow{display:inline-block;background:rgba(22,163,74,.18);color:#4ade80;font-size:10.5px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;padding:5px 16px;border-radius:999px;margin-bottom:20px;border:1px solid rgba(74,222,128,.2);}
        .cta-h{font-family:'Fraunces',serif;font-size:clamp(1.9rem,3.5vw,2.9rem);font-weight:900;color:#fff;letter-spacing:-.04em;margin-bottom:16px;line-height:1.05;}
        .cta-h em{font-style:italic;color:#4ade80;}
        .cta-sub{font-size:15px;color:rgba(255,255,255,.48);line-height:1.8;max-width:52ch;}
        .cta-cards{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;position:relative;z-index:1;}
        .cta-card{border-radius:18px;padding:28px 24px;display:flex;flex-direction:column;gap:10px;transition:transform .2s;}
        .cta-card:hover{transform:translateY(-4px);}
        .cta-card-icon{font-size:30px;}
        .cta-card-h{font-size:15px;font-weight:700;color:#fff;}
        .cta-card-p{font-size:13.5px;color:rgba(255,255,255,.68);line-height:1.65;flex:1;}
        .cta-card-a{font-size:13px;font-weight:700;color:rgba(255,255,255,.8);margin-top:6px;transition:color .18s;}
        .cta-card-a:hover{color:#4ade80;}

        .blogs-sec{padding:110px 0;background:var(--white);}
        .blogs-layout{display:grid;grid-template-columns:360px 1fr;gap:64px;align-items:start;}
        .featured-post{background:var(--ink);border-radius:20px;overflow:hidden;transition:transform .24s;}
        .featured-post:hover{transform:translateY(-4px);}
        .featured-img{height:200px;position:relative;overflow:hidden;background:#1f2937;}
        .featured-img img{width:100%;height:100%;object-fit:cover;}
        .featured-overlay{position:absolute;inset:0;background:linear-gradient(to top,rgba(12,26,14,.8) 0%,transparent 55%);}
        .featured-badge{position:absolute;top:14px;left:14px;background:var(--g);color:#fff;font-size:10px;font-weight:700;padding:4px 11px;border-radius:5px;letter-spacing:.05em;}
        .featured-body{padding:24px 24px 28px;}
        .featured-meta{display:flex;align-items:center;gap:8px;margin-bottom:12px;}
        .featured-date{font-size:12px;color:rgba(255,255,255,.4);font-weight:500;}
        .featured-read{font-size:12px;color:rgba(255,255,255,.3);}
        .feat-dot{width:3px;height:3px;border-radius:50%;background:rgba(255,255,255,.2);}
        .featured-title{font-family:'Fraunces',serif;font-size:18px;font-weight:900;color:#fff;line-height:1.35;margin-bottom:18px;letter-spacing:-.02em;}
        .featured-link{display:inline-flex;align-items:center;gap:7px;background:var(--g);color:#fff;padding:10px 20px;border-radius:9px;font-size:13px;font-weight:700;transition:background .18s;}
        .featured-link:hover{background:var(--g-d);}
        .blog-grid{display:flex;flex-direction:column;gap:16px;}
        .blog-row{display:flex;gap:16px;background:var(--white);border:1px solid var(--border);border-radius:16px;overflow:hidden;transition:all .22s;}
        .blog-row:hover{border-color:rgba(22,163,74,.28);box-shadow:0 8px 28px rgba(22,163,74,.1);transform:translateX(3px);}
        .blog-thumb{width:100px;height:100px;flex-shrink:0;overflow:hidden;background:var(--border);position:relative;}
        .blog-thumb img{width:100%;height:100%;object-fit:cover;}
        .blog-info{padding:14px 16px 14px 0;flex:1;display:flex;flex-direction:column;justify-content:center;gap:5px;}
        .blog-tag-pill{display:inline-block;background:var(--g-xl);color:var(--g-d);font-size:10px;font-weight:700;padding:2px 9px;border-radius:999px;align-self:flex-start;}
        .blog-row-title{font-size:13.5px;font-weight:700;color:var(--ink);line-height:1.45;}
        .blog-row-meta{display:flex;align-items:center;gap:8px;font-size:11.5px;color:var(--ink4);}
        .blog-row-link{font-size:12px;font-weight:700;color:var(--g);align-self:flex-start;}
        .blog-row-link:hover{color:var(--g-d);}

        .footer{background:var(--ink);color:rgba(255,255,255,.45);}
        .footer-top{max-width:1180px;margin:0 auto;padding:72px 5% 56px;display:grid;grid-template-columns:2.5fr 1fr 1fr 1.5fr;gap:52px;}
        .f-logo-row{display:flex;align-items:center;gap:12px;margin-bottom:20px;}
        .f-logo-icon{width:44px;height:44px;border-radius:12px;background:var(--g);flex-shrink:0;display:flex;align-items:center;justify-content:center;color:#fff;font-size:22px;font-weight:900;font-family:'Fraunces',serif;}
        .f-brand{font-family:'Fraunces',serif;font-size:18px;font-weight:900;color:#fff;}
        .f-brand-tag{font-size:10px;font-weight:700;color:var(--g-m);text-transform:uppercase;letter-spacing:.09em;}
        .f-about{font-size:13px;color:rgba(255,255,255,.36);line-height:1.85;max-width:28ch;margin-bottom:22px;}
        .f-contact{display:flex;flex-direction:column;gap:8px;font-size:13px;color:rgba(255,255,255,.4);}
        .f-newsletter{margin-top:22px;}
        .f-nl-label{font-size:11.5px;font-weight:700;color:rgba(255,255,255,.55);margin-bottom:10px;letter-spacing:.05em;text-transform:uppercase;}
        .f-nl-row{display:flex;gap:8px;}
        .f-nl-input{flex:1;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.12);border-radius:9px;padding:10px 14px;color:#fff;font-size:13px;font-family:'DM Sans',sans-serif;outline:none;}
        .f-nl-input::placeholder{color:rgba(255,255,255,.28);}
        .f-nl-input:focus{border-color:rgba(34,197,94,.4);}
        .f-nl-btn{background:var(--g);border:none;border-radius:9px;padding:10px 16px;color:#fff;font-size:13px;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif;transition:background .18s;white-space:nowrap;}
        .f-nl-btn:hover{background:var(--g-d);}
        .f-col-title{font-size:11.5px;font-weight:700;text-transform:uppercase;letter-spacing:.09em;color:#fff;margin-bottom:18px;padding-bottom:10px;border-bottom:1px solid rgba(255,255,255,.08);}
        .f-link{display:block;font-size:13px;color:rgba(255,255,255,.4);margin-bottom:10px;transition:color .18s;}
        .f-link:hover{color:var(--g-m);}
        .opd-row{display:flex;justify-content:space-between;font-size:13px;padding:9px 0;border-bottom:1px solid rgba(255,255,255,.07);}
        .opd-day{color:rgba(255,255,255,.4);}
        .opd-hrs{font-weight:700;color:rgba(255,255,255,.82);}
        .footer-btm{max-width:1180px;margin:0 auto;padding:20px 5%;border-top:1px solid rgba(255,255,255,.07);display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;font-size:12.5px;color:rgba(255,255,255,.28);}

        .btn-p{display:inline-flex;align-items:center;gap:8px;background:var(--g);color:#fff;padding:13px 26px;border-radius:12px;font-size:14px;font-weight:700;font-family:'DM Sans',sans-serif;transition:all .2s;box-shadow:var(--shadow-green);flex-shrink:0;border:none;cursor:pointer;}
        .btn-p:hover{background:var(--g-d);transform:translateY(-2px);box-shadow:0 12px 40px rgba(22,163,74,.3);}
        .btn-o{display:inline-flex;align-items:center;gap:8px;background:transparent;color:var(--g);padding:11px 22px;border-radius:12px;font-size:13.5px;font-weight:700;font-family:'DM Sans',sans-serif;border:1.5px solid var(--g);transition:all .2s;flex-shrink:0;cursor:pointer;}
        .btn-o:hover{background:var(--g-l);transform:translateY(-1px);}

        @media(max-width:1024px){.about-grid{grid-template-columns:1fr;gap:52px;}.doc-grid{grid-template-columns:repeat(3,1fr);}.hosp-grid{grid-template-columns:repeat(2,1fr);}.cta-cards{grid-template-columns:1fr 1fr;}.blogs-layout{grid-template-columns:1fr;gap:40px;}.footer-top{grid-template-columns:1fr 1fr;gap:36px;}}
        @media(max-width:768px){.stats-grid{grid-template-columns:repeat(2,1fr);}.doc-grid{grid-template-columns:repeat(2,1fr);}.hosp-grid{grid-template-columns:1fr;}.spec-grid{grid-template-columns:1fr;}.cta-cards{grid-template-columns:1fr;}.cta-box{padding:44px 28px;}.footer-top{grid-template-columns:1fr;gap:32px;}.about-sec,.doctors-sec,.hosp-sec,.blogs-sec{padding:80px 0;}.doc-loading{grid-column:span 2;}}
        @media(max-width:480px){.blog-row{flex-direction:column;}.blog-thumb{width:100%;height:140px;}.blog-info{padding:14px 16px 16px;}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
        .fade{animation:fadeUp .5s ease both;}
      `}</style>

      <motion.div
        className="announce"
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      >
        <span className="announce-badge">New</span>
        <span>Robotic surgery now available at Ahmedabad Main &nbsp;·&nbsp; <strong>Book a consultation today</strong></span>
      </motion.div>

      <HeroSlider />

      <div className="services-strip">
        <div className="inner">
          <div className="services-inner">
            {["NABH Accredited","24/7 Emergency","Robotic Surgery","Organ Transplant","Advanced Diagnostics","International Patients","Cashless Insurance","Home Care Services"].map(s=>(
              <div key={s} className="svc-item"><span className="svc-dot"/>{s}</div>
            ))}
          </div>
        </div>
      </div>

      <div className="stats-band" ref={statsRef}>
        <div className="inner">
          <div className="stats-grid">
            {content.stats.map(s=><StatItem key={s.label} num={s.num} lbl={s.label} icon={s.icon} sub={s.sub} inView={inView}/>)}
          </div>
        </div>
      </div>

      <section className="about-sec">
        <div className="inner">
          <div className="about-grid">
            <div>
              <Reveal>
                <div className="eyebrow">About Us</div>
                <h2 className="sec-h">Why Choose<br/><em>MediCare?</em></h2>
                <div className="divider"/>
                <p className="sec-sub" style={{marginBottom:32}}>{content.about_intro}</p>
              </Reveal>
              <StaggerGroup stagger={0.08}>
                {content.feature_cards.map(f=>(
                  <StaggerItem key={f.title}>
                    <div className="feat-card">
                      <div className="feat-icon">{f.icon}</div>
                      <div><div className="feat-title">{f.title}</div><div className="feat-desc">{f.desc}</div></div>
                    </div>
                  </StaggerItem>
                ))}
              </StaggerGroup>
              <StaggerGroup className="trust-row" stagger={0.05}>
                {content.trust_badges.map(b=>(
                  <StaggerItem key={b}>
                    <div className="trust-badge"><span className="trust-badge-dot"/>{b}</div>
                  </StaggerItem>
                ))}
              </StaggerGroup>
            </div>
            <div>
              <Reveal delay={0.1}>
                <div className="eyebrow">Departments</div>
                <h3 className="sec-h" style={{fontSize:"clamp(1.6rem,2.8vw,2.2rem)"}}>Our <em>Specialities</em></h3>
                <div className="divider"/>
                <p className="sec-sub" style={{marginBottom:26}}>From routine check-ups to specialised treatments — personalised, expert care for every need.</p>
              </Reveal>
              <StaggerGroup className="spec-grid" stagger={0.05}>
                {content.specialities.map(s=>(
                  <StaggerItem key={s.name}>
                    <div className="spec-card">
                      <div className="spec-emoji">{s.icon}</div>
                      <div className="spec-name">{s.name}</div>
                      <div className="spec-desc">{s.desc}</div>
                    </div>
                  </StaggerItem>
                ))}
              </StaggerGroup>
            </div>
          </div>
        </div>
      </section>

      <section className="doctors-sec">
        <div className="inner">
          <Reveal className="split-hdr">
            <div>
              <div className="eyebrow">Meet Our Team</div>
              <h2 className="sec-h">Our <em>Doctors</em></h2>
              <div className="divider"/>
              <p className="sec-sub">Our physicians deliver personalised care — from routine check-ups to complex procedures.</p>
            </div>
            <Link to="/dashboard/doctors"><button className="btn-p">Find a Doctor →</button></Link>
          </Reveal>
          <StaggerGroup className="doc-grid" stagger={0.07}>
            {dLoad && Array.from({ length: 4 }).map((_, i) => <DoctorCardSkeleton key={i} />)}
            {!dLoad && doctors.slice(0,4).map((d, i) => {
              const [c1,c2] = GRAD[i % GRAD.length];
              return (
                <StaggerItem key={d.id}>
                  <Link to={`/dashboard/doctors/${d.id}`}>
                    <div className="doc-card">
                      <div className="doc-photo" style={{background:`linear-gradient(135deg,${c1}22,${c2}22)`}}>
                        {d.image
                          ? <ImageWithSkeleton src={getImg(d.image)} alt={d.name}/>
                          : <div className="doc-photo-placeholder">
                              <div className="doc-init" style={{background:`linear-gradient(135deg,${c1},${c2})`}}>
                                {getInit(d.name)}
                              </div>
                            </div>
                        }
                        <div className="doc-overlay"/>
                        <div className="doc-status">Available</div>
                      </div>
                      <div className="doc-body">
                        <div className="doc-name">{d.name}</div>
                        <span className="doc-spec">🔬 {d.specialization}</span>
                        {d.consultation_fee != null && (
                          <div className="doc-fee">Consult: <strong>₹{d.consultation_fee}</strong></div>
                        )}
                        <div className="doc-cta">Book Appointment →</div>
                      </div>
                    </div>
                  </Link>
                </StaggerItem>
              );
            })}
            <StaggerItem>
              <Link to="/dashboard/doctors">
                <div className="doc-all">
                  <div style={{fontSize:40,marginBottom:4}}>👨‍⚕️</div>
                  <div style={{fontSize:14,fontWeight:800,color:"var(--g-d)"}}>View All Doctors</div>
                  <div style={{fontSize:12,color:"var(--g-d)",opacity:.6}}>{doctors.length > 0 ? `${doctors.length} specialists available` : "200+ specialists"}</div>
                </div>
              </Link>
            </StaggerItem>
          </StaggerGroup>
        </div>
      </section>

      <section className="hosp-sec">
        <div className="inner">
          <Reveal className="split-hdr">
            <div>
              <div className="eyebrow">Our Locations</div>
              <h2 className="sec-h">Our <em>Hospitals</em></h2>
              <div className="divider"/>
              <p className="sec-sub">Choose a MediCare hospital near you for world-class care by our best professionals.</p>
            </div>
          </Reveal>
          <StaggerGroup className="hosp-grid" stagger={0.08}>
            {HOSPITALS.map(h=>(
              <StaggerItem key={h.name}>
                <div className="hosp-card">
                  <div className="hosp-photo">
                    <ImageWithSkeleton src={h.img} alt={h.name}/>
                    <div className="hosp-badge">{h.tag}</div>
                    <div className="hosp-est">Est. {h.est}</div>
                  </div>
                  <div className="hosp-body">
                    <div className="hosp-city">📍 {h.city}</div>
                    <div className="hosp-name">{h.name}</div>
                    <div className="hosp-beds">🛏️ {h.beds} beds</div>
                    <div className="hosp-links">
                      <button className="hosp-btn hosp-btn-p">📞 Details</button>
                      <button className="hosp-btn hosp-btn-s">📍 Directions</button>
                    </div>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>

      <section className="cta-sec">
        <div className="inner">
          <Reveal className="cta-box" y={32}>
            <div className="cta-top">
              <div className="cta-eyebrow">Patient Success & Services</div>
              <h2 className="cta-h">Transforming Lives with<br/><em>Expert Care</em></h2>
              <p className="cta-sub">Explore our comprehensive healthcare services and the stories of patients whose lives we've helped transform.</p>
            </div>
            <StaggerGroup className="cta-cards" stagger={0.08}>
              {[
                {bg:"var(--g)",icon:"🏥",h:"Our Procedures",p:"Comprehensive surgical procedures and progressive treatment options.",a:"View All Procedures →"},
                {bg:"#1d4ed8",icon:"✈️",h:"International Patients",p:"Comprehensive support for patients travelling from abroad for treatment.",a:"Learn More →"},
                {bg:"#1e293b",icon:"📞",h:"Need Assistance?",p:"Our team is available 24/7 to help you with any healthcare query.",a:"Contact Us →"},
              ].map(c=>(
                <StaggerItem key={c.h}>
                  <div className="cta-card" style={{background:c.bg,border:c.bg==="#1e293b"?"1px solid rgba(255,255,255,.08)":"none"}}>
                    <div className="cta-card-icon">{c.icon}</div>
                    <div className="cta-card-h">{c.h}</div>
                    <div className="cta-card-p">{c.p}</div>
                    <a href="#" className="cta-card-a">{c.a}</a>
                  </div>
                </StaggerItem>
              ))}
            </StaggerGroup>
          </Reveal>
        </div>
      </section>

      <section className="blogs-sec">
        <div className="inner">
          <Reveal className="split-hdr" style={{marginBottom:40}}>
            <div>
              <div className="eyebrow">Knowledge Hub</div>
              <h2 className="sec-h">Health <em>Blogs</em></h2>
              <div className="divider"/>
              <p className="sec-sub">Stay updated on healthcare — expert articles for a healthier life.</p>
            </div>
            <div style={{display:"flex",gap:12,flexShrink:0}}>
              <a href="#"><button className="btn-p">All Articles →</button></a>
              <button className="btn-o">Subscribe</button>
            </div>
          </Reveal>
          <div className="blogs-layout">
            <Reveal y={20}>
              <div className="featured-post">
                <div className="featured-img">
                  <ImageWithSkeleton src={BLOGS[0].img} alt={BLOGS[0].title}/>
                  <div className="featured-overlay"/>
                  <div className="featured-badge">{BLOGS[0].tag}</div>
                </div>
                <div className="featured-body">
                  <div className="featured-meta">
                    <span className="featured-date">{BLOGS[0].date}</span>
                    <span className="feat-dot"/>
                    <span className="featured-read">{BLOGS[0].read} read</span>
                  </div>
                  <div className="featured-title">{BLOGS[0].title}</div>
                  <a href="#" className="featured-link">Read Article →</a>
                </div>
              </div>
            </Reveal>
            <StaggerGroup className="blog-grid" stagger={0.07}>
              {BLOGS.slice(1).map(b=>(
                <StaggerItem key={b.title}>
                  <div className="blog-row">
                    <div className="blog-thumb"><ImageWithSkeleton src={b.img} alt={b.title}/></div>
                    <div className="blog-info">
                      <span className="blog-tag-pill">{b.tag}</span>
                      <div className="blog-row-title">{b.title}</div>
                      <div className="blog-row-meta"><span>{b.date}</span><span>·</span><span>{b.read} read</span></div>
                      <a href="#" className="blog-row-link">Read More →</a>
                    </div>
                  </div>
                </StaggerItem>
              ))}
            </StaggerGroup>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-top">
          <div>
            <div className="f-logo-row">
              <div className="f-logo-icon">+</div>
              <div><div className="f-brand">MediCare</div><div className="f-brand-tag">Hospitals</div></div>
            </div>
            <p className="f-about">Providing compassionate, world-class healthcare since 2005. Your health is our highest priority.</p>
            <div className="f-contact">
              <span>📞 +91 1800 200 3000</span>
              <span>✉️ info@medicare.in</span>
              <span>📍 Ahmedabad, Gujarat, India</span>
            </div>
            <div className="f-newsletter">
              <div className="f-nl-label">Health Newsletter</div>
              <div className="f-nl-row">
                <input className="f-nl-input" type="email" placeholder="your@email.com"/>
                <button className="f-nl-btn">Subscribe</button>
              </div>
            </div>
          </div>
          <div>
            <div className="f-col-title">Patient Portal</div>
            {[{to:"/dashboard",label:"Home"},{to:"/dashboard/doctors",label:"Find Doctors"},{to:"/dashboard/appointments",label:"My Appointments"}].map(l=>
              <Link key={l.to} to={l.to} className="f-link">{l.label}</Link>
            )}
          </div>
          <div>
            <div className="f-col-title">Departments</div>
            {["Cardiology","Neurology","Orthopaedics","Oncology","Paediatrics","Renal Sciences"].map(d=>
              <a key={d} href="#" className="f-link">{d}</a>
            )}
          </div>
          <div>
            <div className="f-col-title">OPD Hours</div>
            {[
              {day:"Mon – Fri",hrs:"9 AM – 6 PM"},
              {day:"Saturday",hrs:"9 AM – 2 PM"},
              {day:"Sunday",hrs:"Emergency Only"},
              {day:"Emergency",hrs:"24 / 7",accent:true},
            ].map(r=>(
              <div key={r.day} className="opd-row">
                <span className="opd-day">{r.day}</span>
                <span className="opd-hrs" style={r.accent?{color:"#4ade80"}:{}}>{r.hrs}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="footer-btm">
          <span>© 2025 MediCare Hospital. All rights reserved.</span>
          <span>Made with ❤️ for better health</span>
        </div>
      </footer>
    </div>
  );
}