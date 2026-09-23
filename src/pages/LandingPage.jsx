import {
  ArrowRight,
  Camera,
  CheckCircle2,
  Construction,
  FileText,
  Leaf,
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
import { createElement } from "react";

const workflow = [
  [Camera, "1. Report Problem", "Take a photo and upload the issue with details."],
  [FileText, "2. Admin Verifies", "The administrator reviews and verifies the complaint."],
  [UserRound, "3. Assign Field Worker", "Assigned to the appropriate field worker."],
  [Wrench, "4. Problem Fixed", "Field worker visits the location and resolves the issue."],
  [CheckCircle2, "5. Resolved", "The issue is marked as resolved and you can track its status."],
];

const issueTypes = [
  [Construction, "Potholes"],
  [Trash2, "Garbage"],
  [TreePine, "Fallen Trees"],
  [Lightbulb, "Broken Streetlights"],
  [Waves, "Water Logging"],
  [MoreHorizontal, "Others"],
];

function Brand() {
  return <a className="reference-brand" href="#reference-top" aria-label="CityEye home"><span className="reference-brand-mark"><i /></span><strong>CityEye</strong></a>;
}

function ActionButton({ children, light = false, onClick }) {
  return <button className={`reference-button ${light ? "reference-button-light" : ""}`} onClick={onClick}>{children}<ArrowRight size={14} /></button>;
}

export default function LandingPage({ onEnter }) {
  return (
    <main className="reference-landing" id="reference-top">
      <header className="reference-header">
        <Brand />
        <nav className="reference-nav">
          <a className="is-active" href="#reference-top">Home</a>
          <a href="#how-it-works">How It Works</a>
          <a href="#common-issues">Features</a>
          <a href="#reference-about">About</a>
          <a href="#reference-contact">Contact</a>
        </nav>
        <div className="reference-auth"><button onClick={() => onEnter("login")}>Sign In</button><ActionButton onClick={() => onEnter("login")}>Get Started</ActionButton></div>
      </header>

      <section className="reference-hero">
        <div className="reference-hero-copy">
          <p className="reference-overline">REPORT TODAY. <span>A CLEANER TOMORROW.</span></p>
          <h1>See an issue<br />in your city?<br /><em>Report it. Get it fixed.</em></h1>
          <p className="reference-hero-text">CityEye makes it easy for citizens to report real-world problems like potholes, garbage, fallen trees, broken streetlights and more. Together, we can build cleaner, safer and smarter cities.</p>
          <div className="reference-hero-actions"><ActionButton onClick={() => onEnter("login")}>Report an Issue</ActionButton><button className="reference-watch"><span><Play size={11} fill="currentColor" /></span>Watch Video</button></div>
        </div>
        <div className="reference-hero-scene">
          <div className="reference-city-image" />
          <div className="reference-phone"><div className="reference-notch" /><div className="reference-phone-screen"><div className="reference-phone-title">‹ <strong>Report an Issue</strong></div><div className="reference-pothole" /><div className="reference-report-line"><MapPin size={13} fill="currentColor" /><strong>Pothole</strong><small>Shivajinagar, Pune</small></div><div className="reference-input">Add more details...</div><button>Submit Report</button><div className="reference-home-bar" /></div></div>
          <div className="reference-scene-note">Cleaner roads.<br />Stronger communities.</div>
        </div>
      </section>

      <section className="reference-workflow" id="how-it-works">
        <div className="reference-section-heading"><div><p className="reference-overline">HOW CITYEYE WORKS</p><h2>From a report to a real change.</h2></div><p>A simple process that connects<br />citizens, administrators and field workers.</p></div>
        <div className="reference-steps">{workflow.map(([icon, title, text], index) => <div className="reference-step-wrap" key={title}><article className="reference-step"><div className={`reference-step-icon ${index === 4 ? "is-done" : ""}`}>{createElement(icon, { size: 24 })}</div><h3>{title}</h3><p>{text}</p></article>{index < workflow.length - 1 && <ArrowRight className="reference-step-arrow" size={20} />}</div>)}</div>
      </section>

      <section className="reference-issues" id="common-issues">
        <div className="reference-issues-heading"><div><h2>Common Issues</h2><p>Report a wide range of civic issues in your area.</p></div><a href="#reference-contact">View All Categories <ArrowRight size={13} /></a></div>
        <div className="reference-issue-grid">{issueTypes.map(([icon, label]) => <button className="reference-issue" key={label}>{createElement(icon, { size: 27 })}<span>{label}</span></button>)}</div>
      </section>

      <section className="reference-cta" id="reference-about"><div className="reference-cta-copy"><p className="reference-overline">A CLEANER, SAFER, SMARTER TOMORROW</p><h2>Let’s build a better<br />Pune, together.</h2><ActionButton light onClick={() => onEnter("login")}>Get Started</ActionButton></div><div className="reference-cta-quote">“Small reports<br />make a big difference.”<span />A Cleaner City<br />A Healthier You</div></section>

      <footer className="reference-footer" id="reference-contact"><Brand /><nav><a href="#reference-top">Home</a><a href="#common-issues">Features</a><a href="#reference-about">About</a><a href="#reference-contact">Contact</a></nav><span>Cleaner Cities. Brighter Tomorrows.</span></footer>
    </main>
  );
}
