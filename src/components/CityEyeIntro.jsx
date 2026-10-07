import { useEffect, useMemo, useState } from "react";
import "./CityEyeIntro.css";

// Module-level flag: the full intro plays once per page load (refresh resets it),
// never again during SPA navigation.
let hasPlayed = false;

const FULL_MS = 4000;
const LEAVE_MS = 3500;
const REDUCED_MS = 350;
const REDUCED_LEAVE_MS = 150;

const GRID = 9;
const ROADS = [3, 6];
const S = 34;
const V = S * 0.55;
const project = (x, y) => [400 + (x - y) * S, 60 + (x + y) * V];
const pts = (list) => list.map((p) => p.join(",")).join(" ");

const MARKERS = [
  { label: "Pothole", x: 3, y: 1.5, color: "#D97855", glyph: "M-4 1a4 2 0 1 0 8 0a4 2 0 1 0 -8 0" },
  { label: "Garbage", x: 1.5, y: 3, color: "#087F5B", glyph: "M-3 -3h6l-1 7h-4z" },
  { label: "Broken streetlight", x: 6, y: 1.2, color: "#C39344", glyph: "M0 -4v8M-3 -4h6" },
  { label: "Fallen tree", x: 7.5, y: 6, color: "#087F5B", glyph: "M-4 3l8-6M-1 -3l2 2" },
  { label: "Road damage", x: 3, y: 7.5, color: "#D97855", glyph: "M-4 -1l3 2 2-3 3 2" },
];

const HUB = { x: 4.5, y: 4.5 };
const ROLES = [
  { label: "Citizens", x: 1.2, y: 1.2 },
  { label: "Field workers", x: 8, y: 4.5 },
  { label: "Verification", x: 4.5, y: 8 },
];

function buildBuildings(simple) {
  const list = [];
  for (let bx = 0; bx < 3; bx += 1) {
    for (let by = 0; by < 3; by += 1) {
      if (bx === 1 && by === 1) continue;
      const k = bx * 3 + by;
      list.push([bx * 3 + 0.4, by * 3 + 0.4, 1.1, 1.1, 14 + ((k * 7) % 4) * 8]);
      if (!simple) list.push([bx * 3 + 1.7, by * 3 + 1.5, 0.9, 1, 10 + ((k * 5) % 3) * 8]);
    }
  }
  return list.sort((a, b) => a[0] + a[1] - (b[0] + b[1]));
}

function Building({ box, index }) {
  const [x, y, w, d, h] = box;
  const a = project(x, y);
  const b = project(x + w, y);
  const c = project(x + w, y + d);
  const e = project(x, y + d);
  const up = ([px, py]) => [px, py - h];
  return (
    <g className="ce-building" style={{ "--i": index }}>
      <polygon points={pts([e, c, up(c), up(e)])} fill="#12212B" opacity="0.92" />
      <polygon points={pts([c, b, up(b), up(c)])} fill="#12212B" opacity="0.72" />
      <polygon points={pts([up(a), up(b), up(c), up(e)])} fill="#E8F5F0" stroke="#12212B" strokeWidth="1" />
    </g>
  );
}

function EyeSymbol() {
  return (
    <svg className="ce-eye" viewBox="0 0 40 28" aria-hidden="true">
      <path
        d="M2 14C8 5 14 2 20 2s12 3 18 12c-6 9-12 12-18 12S8 23 2 14z"
        fill="none"
        stroke="#12212B"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      <circle cx="20" cy="14" r="6.5" fill="#E8F5F0" stroke="#087F5B" strokeWidth="2" />
      <circle className="ce-dot" cx="20" cy="14" r="2.8" fill="#087F5B" />
    </svg>
  );
}

function CityScene({ simple }) {
  const buildings = useMemo(() => buildBuildings(simple), [simple]);
  const corners = [project(0, 0), project(GRID, 0), project(GRID, GRID), project(0, GRID)];
  const hub = project(HUB.x, HUB.y);
  const links = [...ROLES, ...MARKERS];

  return (
    <svg className="ce-city" viewBox="0 0 800 440" aria-hidden="true" focusable="false">
      <polygon points={pts(corners)} fill="#E8F5F0" stroke="#12212B" strokeOpacity="0.12" />
      <ellipse cx="560" cy="300" rx="70" ry="22" fill="#087F5B" opacity="0.07" />
      <ellipse cx="250" cy="250" rx="60" ry="18" fill="#087F5B" opacity="0.07" />

      {ROADS.map((r, i) => (
        <g key={r} className="ce-road" style={{ "--i": i }}>
          <path d={`M${project(r, 0)} L${project(r, GRID)}`} pathLength="1" />
          <path d={`M${project(0, r)} L${project(GRID, r)}`} pathLength="1" />
        </g>
      ))}
      <path
        className="ce-route"
        pathLength="1"
        d={`M${project(0, 3)} L${project(3, 3)} L${project(3, 6)} L${project(6, 6)} L${project(6, GRID)}`}
      />

      {buildings.map((box, i) => (
        <Building key={box.join("-")} box={box} index={i} />
      ))}

      <g className="ce-links">
        {links.map((n, i) => {
          const [px, py] = project(n.x, n.y);
          return (
            <path key={n.label} pathLength="1" style={{ "--i": i }} d={`M${px} ${py} L${hub[0]} ${hub[1]}`} />
          );
        })}
      </g>

      <g className="ce-hub" transform={`translate(${hub[0]} ${hub[1]})`}>
        <circle className="ce-hub-ring" r="12" />
        <circle r="6" fill="#12212B" />
        <circle r="2.4" fill="#087F5B" />
      </g>

      {ROLES.map((r, i) => {
        const [px, py] = project(r.x, r.y);
        return (
          <g key={r.label} className="ce-role" style={{ "--i": i }} transform={`translate(${px} ${py})`}>
            <circle r="5" fill="#fff" stroke="#12212B" strokeWidth="1.5" />
            {!simple && (
              <text y="-12" textAnchor="middle">
                {r.label}
              </text>
            )}
          </g>
        );
      })}

      {MARKERS.map((m, i) => {
        const [px, py] = project(m.x, m.y);
        const w = m.label.length * 5.6 + 16;
        return (
          <g key={m.label} transform={`translate(${px} ${py})`}>
            <g className="ce-marker" style={{ "--m": i, "--c": m.color }}>
              <circle className="ce-ring" r="11" />
              <circle r="11" fill={m.color} stroke="#fff" strokeWidth="2" />
              <path d={m.glyph} fill="none" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
              {!simple && (
                <g transform="translate(0 24)">
                  <rect x={-w / 2} y="-9" width={w} height="18" rx="9" fill="#fff" stroke="#12212B" strokeOpacity="0.14" />
                  <text textAnchor="middle" y="3.5">
                    {m.label}
                  </text>
                </g>
              )}
            </g>
          </g>
        );
      })}
    </svg>
  );
}

function CityEyeIntro({ onComplete }) {
  const [active, setActive] = useState(() => !hasPlayed);
  const [leaving, setLeaving] = useState(false);

  const { reduced, simple } = useMemo(() => {
    if (typeof window === "undefined" || !window.matchMedia) return { reduced: false, simple: false };
    return {
      reduced: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
      simple: window.matchMedia("(max-width: 640px)").matches,
    };
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
      <div className="ce-stage">
        <div className="ce-logo">
          <EyeSymbol />
          <span className="ce-wordmark">CityEye</span>
          <p className="ce-tagline">Making cities better, one report at a time.</p>
        </div>
        {!reduced && (
          <div className="ce-zoom">
            <CityScene simple={simple} />
          </div>
        )}
      </div>
      <button type="button" className="ce-skip" onClick={skip}>
        Skip intro
      </button>
    </div>
  );
}

export default CityEyeIntro;