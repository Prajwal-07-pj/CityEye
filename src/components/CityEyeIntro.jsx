import { useEffect, useMemo, useState } from "react";
import "./CityEyeIntro.css";

// Plays once per page load (refresh resets it), never during SPA navigation.
let hasPlayed = false;

const FULL_MS = 2600;
const LEAVE_MS = 2150;
const REDUCED_MS = 350;
const REDUCED_LEAVE_MS = 150;

function EyeSymbol() {
  return (
    <svg className="ce-eye" viewBox="0 0 40 28" aria-hidden="true">
      <path
        className="ce-eye-outline"
        pathLength="1"
        d="M2 14C8 5 14 2 20 2s12 3 18 12c-6 9-12 12-18 12S8 23 2 14z"
      />
      <circle className="ce-iris" cx="20" cy="14" r="6.5" />
      <circle className="ce-pupil" cx="20" cy="14" r="2.8" />
    </svg>
  );
}

function CityEyeIntro({ onComplete }) {
  const [active, setActive] = useState(() => !hasPlayed);
  const [leaving, setLeaving] = useState(false);

  const reduced = useMemo(() => {
    if (typeof window === "undefined" || !window.matchMedia) return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  useEffect(() => {
    if (!active) return undefined;
    hasPlayed = true;
    const leaveTimer = setTimeout(() => setLeaving(true), reduced ? REDUCED_LEAVE_MS : LEAVE_MS);
    const endTimer = setTimeout(() => {
      setActive(false);
      if (onComplete) onComplete();
    }, reduced ? REDUCED_MS : FULL_MS);
    return () => {
      clearTimeout(leaveTimer);
      clearTimeout(endTimer);
    };
  }, [active, reduced, onComplete]);

  const skip = () => {
    setActive(false);
    if (onComplete) onComplete();
  };

  if (!active) return null;

  const cls = ["ce-intro", reduced && "ce-intro--reduced", leaving && "ce-intro--leaving"]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={cls} role="status" aria-label="Loading CityEye" aria-live="polite">
      <div className="ce-center">
        <div className="ce-mark">
          <span className="ce-halo" />
          <EyeSymbol />
        </div>
        <span className="ce-wordmark">CityEye</span>
        <p className="ce-tagline">Making cities better, one report at a time.</p>
        <div className="ce-progress" aria-hidden="true">
          <span />
        </div>
      </div>
      <button type="button" className="ce-skip" onClick={skip}>
        Skip intro
      </button>
    </div>
  );
}

export default CityEyeIntro;