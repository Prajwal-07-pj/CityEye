import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Camera,
  Check,
  CheckCircle2,
  Construction,
  FileText,
  Lightbulb,
  MapPin,
  MoreHorizontal,
  Play,
  Trash2,
  TreePine,
  UserRound,
  Waves,
  Wrench,
} from "lucide-react";
import "./LandingPage.css";

const NAV = [
  ["Home", "top"],
  ["How It Works", "how-it-works"],
  ["Features", "features"],
  ["About", "about"],
  ["Contact", "contact"],
];

const WORKFLOW = [
  [Camera, "1. Report Problem", "Take a photo and upload the issue with details."],
  [FileText, "2. Admin Verifies", "The administrator reviews and verifies the complaint."],
  [UserRound, "3. Assign Field Worker", "Assigned to the appropriate field worker."],
  [Wrench, "4. Problem Fixed", "A field worker visits the location and fixes the issue."],
  [CheckCircle2, "5. Resolved", "Marked resolved. Track it any time."],
];

const ISSUES = [
  [Construction, "Potholes"],
  [Trash2, "Garbage"],
  [TreePine, "Fallen Trees"],
  [Lightbulb, "Broken Streetlights"],
  [Waves, "Water Logging"],
  [MoreHorizontal, "Others"],
];

const LEGEND = [
  ["Critical", "#E5484D"],
  ["In progress", "#F5A524"],
  ["Resolved", "#12A150"],
];

function EyeMark() {
  return (
    <svg className="cel-eye" viewBox="0 0 40 28" aria-hidden="true">
      <path
        d="M2 14C8 5 14 2 20 2s12 3 18 12c-6 9-12 12-18 12S8 23 2 14z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      <circle cx="20" cy="14" r="6.5" fill="#E8F3EE" stroke="#146E52" strokeWidth="2" />
      <circle cx="20" cy="14" r="2.8" fill="#146E52" />
    </svg>
  );
}

function Brand({ light = false }) {
  return (
    <a className={`cel-brand ${light ? "is-light" : ""}`} href="#top" aria-label="CityEye home">
      <EyeMark />
      <strong>CityEye</strong>
    </a>
  );
}

function Button({ variant = "primary", arrow = true, children, ...rest }) {
  return (
    <button className={`cel-btn cel-btn--${variant}`} {...rest}>
      {children}
      {arrow && <ArrowRight size={16} />}
    </button>
  );
}

export default function LandingPage({ onEnter }) {
  const root = useRef(null);
  const [active, setActive] = useState("top");
  const [scrolled, setScrolled] = useState(false);

  // Scroll-reveal
  useEffect(() => {
    const els = root.current?.querySelectorAll("[data-reveal]") ?? [];
    if (!("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("is-visible"));
      return undefined;
    }
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            io.unobserve(e.target);
          }
        }),
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  // Active nav link (scroll-spy) + header shadow
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    let spy;
    if ("IntersectionObserver" in window) {
      spy = new IntersectionObserver(
        (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
        { rootMargin: "-45% 0px -50% 0px" }
      );
      NAV.forEach(([, id]) => {
        const el = document.getElementById(id);
        if (el) spy.observe(el);
      });
    }
    return () => {
      window.removeEventListener("scroll", onScroll);
      spy?.disconnect();
    };
  }, []);

  const go = () => onEnter("login");

  return (
    <main className="cel" ref={root}>
      <header className={`cel-header ${scrolled ? "is-scrolled" : ""}`}>
        <div className="cel-header-inner">
          <Brand />
          <nav className="cel-nav" aria-label="Primary">
            {NAV.map(([label, id]) => (
              <a key={id} href={`#${id}`} className={active === id ? "is-active" : ""}>
                {label}
              </a>
            ))}
          </nav>
          <div className="cel-auth">
            <button className="cel-link" onClick={go}>Sign In</button>
            <Button onClick={go}>Get Started</Button>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="cel-hero" id="top">
        <div className="cel-hero-copy">
          <p className="cel-overline cel-in" style={{ "--d": "0ms" }}>
            Report today. <span>A cleaner tomorrow.</span>
          </p>
          <h1 className="cel-h1 cel-in" style={{ "--d": "80ms" }}>
            <span>See an issue</span>
            <span>in your city?</span>
            <em>
              <span>Report it.</span>
              <span>Get it fixed.</span>
            </em>
          </h1>
          <p className="cel-lead cel-in" style={{ "--d": "180ms" }}>
            CityEye makes it easy for citizens to report real-world problems like potholes, garbage,
            fallen trees, broken streetlights and more. Together, we can build cleaner, safer and
            smarter cities.
          </p>
          <div className="cel-actions cel-in" style={{ "--d": "260ms" }}>
            <Button onClick={go}>Report an Issue</Button>
            <button className="cel-btn cel-btn--ghost" type="button">
              <span className="cel-play"><Play size={10} fill="currentColor" /></span>
              Watch Video
            </button>
          </div>
          <ul className="cel-trust cel-in" style={{ "--d": "340ms" }}>
            {["Free for citizens", "Live status tracking", "Officer-verified fixes"].map((t) => (
              <li key={t}><Check size={14} />{t}</li>
            ))}
          </ul>
        </div>

        <div className="cel-scene">
          {/* Keeps your existing map photo: the old class still supplies the background image */}
          <div className="reference-city-image cel-map" aria-hidden="true" />

          <ul className="cel-legend" aria-label="Map legend">
            {LEGEND.map(([label, color]) => (
              <li key={label}><i style={{ background: color }} />{label}</li>
            ))}
          </ul>

          <div className="cel-phone-pos">
            <div className="cel-phone">
              <div className="cel-notch" />
              <div className="cel-screen">
                <div className="cel-screen-title"><span>‹</span><strong>Report an Issue</strong></div>
                <img src="/pothole.jpg" alt="Photo of a pothole being reported" />
                <div className="cel-screen-row">
                  <MapPin size={15} fill="currentColor" />
                  <div><strong>Pothole</strong><small>Shivajinagar, Pune</small></div>
                </div>
                <div className="cel-screen-input">Add more details...</div>
                <div className="cel-screen-submit">Submit Report</div>
                <div className="cel-home-bar" />
              </div>
            </div>
          </div>

          <div className="cel-chip" role="img" aria-label="Status update: assigned to a field worker">
            <span><CheckCircle2 size={16} /></span>
            <div><strong>Assigned to field worker</strong><small>Roads Dept. · Ward 12</small></div>
          </div>

          <p className="cel-caption">Cleaner roads.<br />Stronger communities.</p>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="cel-section" id="how-it-works">
        <div className="cel-container">
          <div className="cel-heading" data-reveal>
            <div>
              <p className="cel-overline">How CityEye works</p>
              <h2>From a report to a real change.</h2>
            </div>
            <p className="cel-heading-note">
              A simple process that connects citizens, administrators and field workers.
            </p>
          </div>
          <ol className="cel-steps">
            {WORKFLOW.map(([Icon, title, text], i) => (
              <li className="cel-step" key={title} data-reveal style={{ "--d": `${i * 90}ms` }}>
                <div className={`cel-step-icon ${i === WORKFLOW.length - 1 ? "is-done" : ""}`}>
                  <Icon size={24} />
                </div>
                <h3>{title}</h3>
                <p>{text}</p>
                {i < WORKFLOW.length - 1 && <ArrowRight className="cel-step-arrow" size={18} aria-hidden="true" />}
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* FEATURES / ISSUES */}
      <section className="cel-section cel-section--tint" id="features">
        <div className="cel-container">
          <div className="cel-heading" data-reveal>
            <div>
              <p className="cel-overline">Features</p>
              <h2>Common issues, one place.</h2>
            </div>
            <p className="cel-heading-note">Report a wide range of civic issues in your area.</p>
          </div>
          <div className="cel-issues">
            {ISSUES.map(([Icon, label], i) => (
              <button className="cel-issue" key={label} onClick={go} data-reveal style={{ "--d": `${i * 70}ms` }}>
                <span><Icon size={26} /></span>
                {label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cel-section" id="about">
        <div className="cel-container">
          <div className="cel-cta" data-reveal>
            <div>
              <p className="cel-overline cel-overline--light">A cleaner, safer, smarter tomorrow</p>
              <h2>Let’s build a better Pune, together.</h2>
              <Button variant="light" onClick={go}>Get Started</Button>
            </div>
            <blockquote>
              “Small reports make a big difference.”
              <footer>A Cleaner City · A Healthier You</footer>
            </blockquote>
          </div>
        </div>
      </section>

      <footer className="cel-footer" id="contact">
        <div className="cel-container cel-footer-inner">
          <Brand />
          <nav aria-label="Footer">
            {NAV.filter(([, id]) => id !== "how-it-works").map(([label, id]) => (
              <a key={id} href={`#${id}`}>{label}</a>
            ))}
          </nav>
          <span>Cleaner Cities. Brighter Tomorrows.</span>
        </div>
      </footer>
    </main>
  );
}