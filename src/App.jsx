import React, { useState, useRef, useMemo, useEffect } from "react";
import {
  Eye, MapPin, Camera, Upload, CheckCircle2, Circle, ChevronRight, ChevronLeft,
  Home, FileText, Bell, User, Plus, Search, Filter, LayoutDashboard, Map as MapIcon,
  ClipboardList, Users, Building2, BarChart3, Settings, AlertTriangle, Clock,
  Construction, Trash2, Zap, Lightbulb, Droplet, Waves, TreePine, HelpCircle,
  Star, X, Navigation, PlayCircle, ThumbsUp, RotateCcw, XCircle, ArrowRight,
  ShieldCheck, Wrench, TrendingUp, ChevronDown, LogOut, Menu, ImagePlus, Check, Mail, Lock, UserPlus
} from "lucide-react";
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from "recharts";
import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";
import DashboardPage from "./pages/DashboardPage";

/* ============================= DESIGN TOKENS ============================= */
const C = {
  navy: "#0A1C34",
  navyDeep: "#061224",
  blue: "#1E6FEB",
  blueLight: "#4E93F7",
  bg: "#F4F6F9",
  card: "#FFFFFF",
  border: "#E4E9F0",
  ink: "#0F1B2D",
  sub: "#5B6B82",
  orange: "#F5A524",
  red: "#E5484D",
  green: "#12A150",
  yellow: "#EAB308",
};

const FONT_IMPORT = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap');
* { font-family: 'Inter', sans-serif; box-sizing: border-box; }
.font-display { font-family: 'Space Grotesk', sans-serif; }
::-webkit-scrollbar { width: 8px; height: 8px; }
::-webkit-scrollbar-thumb { background: #C7D2E0; border-radius: 8px; }
input[type=range] { -webkit-appearance: none; background: transparent; }
input[type=range]::-webkit-slider-thumb {
  -webkit-appearance: none; height: 28px; width: 28px; border-radius: 50%;
  background: ${C.blue}; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.35); cursor: ew-resize; margin-top: -12px;
}
input[type=range]::-webkit-slider-runnable-track { height: 4px; background: rgba(255,255,255,0.6); border-radius: 4px; }
@keyframes pulseDot { 0%{ box-shadow: 0 0 0 0 rgba(30,111,235,0.5);} 70%{ box-shadow: 0 0 0 12px rgba(30,111,235,0);} 100%{ box-shadow: 0 0 0 0 rgba(30,111,235,0);} }
.pulse { animation: pulseDot 2s infinite; }
@keyframes fadeUp { from { opacity:0; transform: translateY(10px);} to { opacity:1; transform: translateY(0);} }
.fade-up { animation: fadeUp 0.35s ease both; }
`;

/* ============================= CONSTANTS ============================= */
const CATEGORIES = [
  { id: "pothole", label: "Road / Pothole", icon: Construction },
  { id: "garbage", label: "Garbage", icon: Trash2 },
  { id: "electrical", label: "Electrical Hazard", icon: Zap },
  { id: "streetlight", label: "Streetlight", icon: Lightbulb },
  { id: "water", label: "Water Supply", icon: Droplet },
  { id: "drainage", label: "Drainage", icon: Waves },
  { id: "tree", label: "Fallen Tree", icon: TreePine },
  { id: "infra", label: "Public Infrastructure", icon: Building2 },
  { id: "other", label: "Other", icon: HelpCircle },
];
const catMeta = (id) => CATEGORIES.find((c) => c.id === id) || CATEGORIES[CATEGORIES.length - 1];

const PRIORITIES = ["Critical", "High", "Medium", "Low"];
const PRIORITY_COLOR = { Critical: C.red, High: C.orange, Medium: C.yellow, Low: C.green };
const DEPARTMENTS = ["Roads", "Sanitation", "Electrical", "Water", "Drainage", "Parks", "General"];
const WORKERS = [
  { id: "w1", name: "Ramesh Yadav", dept: "Roads", load: 3 },
  { id: "w2", name: "Suresh Patil", dept: "Electrical", load: 1 },
  { id: "w3", name: "Anita Kulkarni", dept: "Sanitation", load: 4 },
  { id: "w4", name: "Vijay Singh", dept: "Water", load: 2 },
  { id: "w5", name: "Meena Joshi", dept: "Drainage", load: 2 },
];

const STATUS_FLOW = [
  "Submitted", "Reviewed", "Assigned", "In Progress", "Awaiting Verification", "Resolved",
];

const fmtDate = (d) =>
  new Date(d).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

let idCounter = 4821;
const nextId = () => `NGN-2026-${String(idCounter++).padStart(6, "0")}`;

const img = (seed) => `https://picsum.photos/seed/${seed}/700/460`;

/* ============================= MOCK DATA ============================= */
function buildTimeline(stagesReached, base) {
  const dates = {};
  let t = new Date(base).getTime();
  STATUS_FLOW.forEach((s, i) => {
    if (i <= stagesReached) {
      dates[s] = t;
      t += (2 + Math.random() * 10) * 3600 * 1000;
    }
  });
  return dates;
}

const seedReports = () => {
  const templates = [
    { category: "pothole", title: "Large Pothole Near School", ward: 12, addr: "Ganesh Chowk, Main Road", desc: "A deep pothole has formed right outside the school gate, causing two-wheelers to skid, especially during the evening rush.", priority: "High", stage: 3, dept: "Roads", worker: "Ramesh Yadav" },
    { category: "garbage", title: "Garbage Accumulation Near Market", ward: 7, addr: "Sector 7 Vegetable Market", desc: "Waste has not been collected for over four days and is spilling onto the footpath, attracting stray animals.", priority: "Medium", stage: 5, dept: "Sanitation", worker: "Anita Kulkarni" },
    { category: "electrical", title: "Fallen Electric Pole Blocking Road", ward: 3, addr: "Shivaji Nagar Junction", desc: "An electric pole has fallen across the lane after last night's storm. Live wires may still be exposed.", priority: "Critical", stage: 2, dept: "Electrical", worker: "Suresh Patil" },
    { category: "streetlight", title: "Broken Streetlight on Ring Road", ward: 9, addr: "Ring Road, near Bus Depot", desc: "The streetlight has been non-functional for two weeks, making the stretch unsafe for pedestrians at night.", priority: "Low", stage: 1, dept: "Electrical", worker: null },
    { category: "water", title: "Water Pipeline Leakage", ward: 12, addr: "Laxmi Colony, Lane 4", desc: "Continuous water leakage from an underground pipe is flooding the lane and wasting a large amount of water.", priority: "High", stage: 4, dept: "Water", worker: "Vijay Singh" },
    { category: "drainage", title: "Blocked Storm Water Drain", ward: 5, addr: "Near Community Hall, Ward 5", desc: "The drain is completely choked with plastic waste, causing water to stagnate after every rain.", priority: "Medium", stage: 0, dept: "Drainage", worker: null },
    { category: "tree", title: "Fallen Tree Obstructing Footpath", ward: 8, addr: "Park Street, Ward 8", desc: "A large tree fell during yesterday's windstorm and is blocking half the footpath and one traffic lane.", priority: "High", stage: 3, dept: "Parks", worker: "Meena Joshi" },
    { category: "pothole", title: "Damaged Footpath Tiles", ward: 12, addr: "MG Road, near Clock Tower", desc: "Several footpath tiles are broken and uneven, creating a tripping hazard for elderly pedestrians.", priority: "Low", stage: 5, dept: "Roads", worker: "Ramesh Yadav" },
  ];
  return templates.map((t, i) => {
    const id = nextId();
    const baseDate = Date.now() - (10 - i) * 24 * 3600 * 1000;
    const timeline = buildTimeline(t.stage, baseDate);
    const statusIdx = t.stage;
    return {
      id,
      category: t.category,
      title: t.title,
      description: t.desc,
      citizenImage: img(id + "-before"),
      workerImage: t.stage >= 4 ? img(id + "-after") : null,
      location: { address: t.addr, ward: t.ward, lat: (18.5 + Math.random() * 0.1).toFixed(4), lng: (73.8 + Math.random() * 0.1).toFixed(4) },
      priority: t.priority,
      status: STATUS_FLOW[statusIdx],
      department: t.dept,
      assignedWorker: t.worker,
      citizen: ["Rohit Sharma", "Priya Deshmukh", "Amit Verma", "Sneha Kulkarni", "Rahul Jadhav"][i % 5],
      workNotes: statusIdx >= 3 ? "Please cordon off the area before starting repair work and restore surface fully." : "",
      completionNote: statusIdx >= 4 ? "Repair completed and area cleaned up." : "",
      reportedDate: baseDate,
      expectedCompletion: baseDate + 4 * 24 * 3600 * 1000,
      timeline,
      feedback: statusIdx === 5 && i % 2 === 0 ? { rating: 5, comment: "Fixed quickly, thank you!" } : null,
      officerVerified: statusIdx === 5,
      reworkReason: null,
      isDemoNew: false,
    };
  });
};

/* ============================= SMALL UI PRIMITIVES ============================= */
const IconFor = ({ category, size = 18, ...rest }) => {
  const M = catMeta(category).icon;
  return <M size={size} {...rest} />;
};

function Logo({ dark = false, size = 28 }) {
  return (
    <div className="flex items-center gap-2 select-none">
      <div className="rounded-xl flex items-center justify-center" style={{ width: size + 14, height: size + 14, background: `linear-gradient(135deg, ${C.blue}, ${C.navy})` }}>
        <Eye size={size} color="white" strokeWidth={2.2} />
      </div>
      <span className="font-display font-700 text-xl tracking-tight" style={{ color: dark ? "white" : C.navy, fontWeight: 700 }}>
        Nagar<span style={{ color: C.blue }}>Netra</span>
      </span>
    </div>
  );
}

function PriorityBadge({ priority }) {
  const color = PRIORITY_COLOR[priority] || C.sub;
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: color + "1A", color }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
      {priority}
    </span>
  );
}

function StatusBadge({ status }) {
  const map = {
    Submitted: C.sub, Reviewed: C.blueLight, Assigned: C.blue, "In Progress": C.orange,
    "Awaiting Verification": "#8B5CF6", Resolved: C.green, "Rework Required": C.red, Rejected: C.sub,
  };
  const color = map[status] || C.sub;
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold" style={{ background: color + "1A", color }}>
      {status}
    </span>
  );
}

function Card({ children, className = "", style = {}, ...rest }) {
  return (
    <div className={`rounded-2xl bg-white border ${className}`} style={{ borderColor: C.border, boxShadow: "0 1px 2px rgba(15,27,45,0.04)", ...style }} {...rest}>
      {children}
    </div>
  );
}

function Btn({ children, variant = "primary", className = "", icon: I, ...rest }) {
  const base = "inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-all active:scale-[0.98]";
  const styles = {
    primary: { background: C.blue, color: "white" },
    dark: { background: C.navy, color: "white" },
    outline: { background: "white", color: C.navy, border: `1.5px solid ${C.border}` },
    ghost: { background: "transparent", color: C.sub },
    danger: { background: C.red, color: "white" },
    success: { background: C.green, color: "white" },
    warn: { background: C.orange, color: "white" },
  };
  return (
    <button className={`${base} ${className} hover:brightness-95 disabled:opacity-40 disabled:cursor-not-allowed`} style={styles[variant]} {...rest}>
      {I && <I size={16} />}
      {children}
    </button>
  );
}

function Toast({ message, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3200);
    return () => clearTimeout(t);
  }, []);
  return (
    <div className="fixed bottom-6 right-6 z-[999] fade-up">
      <div className="flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl" style={{ background: C.navy, color: "white" }}>
        <CheckCircle2 size={20} color={C.green} />
        <span className="text-sm font-medium">{message}</span>
        <button onClick={onClose}><X size={15} /></button>
      </div>
    </div>
  );
}

function StatCard({ label, value, color = C.navy, icon: I }) {
  return (
    <Card className="p-5 flex items-center justify-between">
      <div>
        <div className="text-xs font-semibold uppercase tracking-wide" style={{ color: C.sub }}>{label}</div>
        <div className="text-3xl font-display font-700 mt-1" style={{ color, fontWeight: 700 }}>{value}</div>
      </div>
      {I && <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: color + "14" }}><I size={20} color={color} /></div>}
    </Card>
  );
}

/* Abstract stylized city map with markers */
function CityMap({ markers = [], onMarkerClick, height = 320, selectable = false, pin, onSelectPin, highlightId }) {
  const ref = useRef(null);
  const handleClick = (e) => {
    if (!selectable || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    onSelectPin && onSelectPin({ x, y });
  };
  return (
    <div
      ref={ref}
      onClick={handleClick}
      className="relative w-full rounded-2xl overflow-hidden select-none"
      style={{ height, background: `linear-gradient(180deg, ${C.navyDeep}, ${C.navy})`, cursor: selectable ? "crosshair" : "default" }}
    >
      <svg className="absolute inset-0 w-full h-full opacity-30" preserveAspectRatio="none" viewBox="0 0 100 100">
        {[10, 25, 40, 55, 70, 85].map((v) => (
          <line key={"h" + v} x1="0" y1={v} x2="100" y2={v} stroke="#4E93F7" strokeWidth="0.3" />
        ))}
        {[10, 25, 40, 55, 70, 85].map((v) => (
          <line key={"v" + v} x1={v} y1="0" x2={v} y2="100" stroke="#4E93F7" strokeWidth="0.3" />
        ))}
        <circle cx="30" cy="35" r="14" fill="#1E6FEB" opacity="0.08" />
        <circle cx="72" cy="65" r="18" fill="#1E6FEB" opacity="0.08" />
      </svg>
      {markers.map((m) => (
        <button
          key={m.id}
          onClick={(e) => { e.stopPropagation(); onMarkerClick && onMarkerClick(m); }}
          className="absolute -translate-x-1/2 -translate-y-1/2 group"
          style={{ left: `${m.x}%`, top: `${m.y}%` }}
        >
          <div
            className={`rounded-full border-2 border-white flex items-center justify-center ${highlightId === m.id ? "pulse" : ""}`}
            style={{ width: highlightId === m.id ? 22 : 16, height: highlightId === m.id ? 22 : 16, background: PRIORITY_COLOR[m.priority] || C.blue, boxShadow: "0 2px 6px rgba(0,0,0,0.4)" }}
          />
        </button>
      ))}
      {pin && (
        <div className="absolute -translate-x-1/2 -translate-y-full" style={{ left: `${pin.x}%`, top: `${pin.y}%` }}>
          <MapPin size={34} color={C.orange} fill={C.orange} strokeWidth={1} />
        </div>
      )}
      {selectable && (
        <div className="absolute bottom-3 left-3 right-3 text-center text-xs text-white/70 bg-black/30 rounded-lg py-1.5 backdrop-blur-sm">
          Tap anywhere on the map to move the location pin
        </div>
      )}
    </div>
  );
}

function BeforeAfterSlider({ before, after }) {
  const [pos, setPos] = useState(50);
  return (
    <div className="relative w-full rounded-2xl overflow-hidden select-none" style={{ height: 340 }}>
      <img src={after} className="absolute inset-0 w-full h-full object-cover" alt="after" />
      <div className="absolute inset-0 overflow-hidden" style={{ width: `${pos}%` }}>
        <img src={before} className="h-full object-cover" style={{ width: `${100 * (100 / pos)}%`, maxWidth: "none" }} alt="before" />
      </div>
      <div className="absolute top-0 bottom-0" style={{ left: `${pos}%`, width: 3, background: "white", transform: "translateX(-1.5px)" }} />
      <input type="range" min="0" max="100" value={pos} onChange={(e) => setPos(+e.target.value)} className="absolute inset-x-0 bottom-4 w-[92%] mx-[4%]" />
      <span className="absolute top-3 left-3 text-xs font-bold text-white bg-black/50 px-2 py-1 rounded-md">BEFORE</span>
      <span className="absolute top-3 right-3 text-xs font-bold text-white bg-black/50 px-2 py-1 rounded-md">AFTER</span>
    </div>
  );
}

function ImageDropzone({ value, onChange }) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const handleFiles = (files) => {
    const f = files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = (e) => onChange(e.target.result);
    reader.readAsDataURL(f);
  };
  if (value) {
    return (
      <div className="relative rounded-2xl overflow-hidden" style={{ height: 280 }}>
        <img src={value} className="w-full h-full object-cover" alt="preview" />
        <button onClick={() => onChange(null)} className="absolute top-3 right-3 bg-black/60 text-white rounded-full p-1.5"><X size={16} /></button>
      </div>
    );
  }
  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
      className="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed cursor-pointer transition-colors"
      style={{ height: 280, borderColor: dragOver ? C.blue : C.border, background: dragOver ? C.blue + "0A" : "#FAFBFD" }}
      onClick={() => inputRef.current.click()}
    >
      <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: C.blue + "14" }}>
        <ImagePlus size={26} color={C.blue} />
      </div>
      <div className="text-sm font-semibold" style={{ color: C.ink }}>Drag & drop a photo, or click to upload</div>
      <div className="text-xs" style={{ color: C.sub }}>JPG or PNG, up to 10MB</div>
      <div className="flex gap-2 mt-1">
        <span className="text-xs px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5" style={{ background: C.navy, color: "white" }}><Camera size={13} /> Use Camera</span>
        <span className="text-xs px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5" style={{ background: C.border, color: C.ink }}><Upload size={13} /> Upload File</span>
      </div>
      <input ref={inputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => handleFiles(e.target.files)} />
    </div>
  );
}

function StarRating({ value, onChange }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} onClick={() => onChange(n)}>
          <Star size={30} color={C.orange} fill={n <= value ? C.orange : "none"} strokeWidth={1.5} />
        </button>
      ))}
    </div>
  );
}

/* Vertical status timeline used on citizen tracking page */
function Timeline({ report }) {
  const steps = STATUS_FLOW;
  const currentIdx = steps.indexOf(report.status);
  return (
    <div className="flex flex-col">
      {steps.map((s, i) => {
        const done = i < currentIdx || report.status === "Resolved";
        const active = i === currentIdx && report.status !== "Resolved";
        const isLast = i === steps.length - 1;
        const label = s === "Awaiting Verification" && report.status === "Rework Required" ? "Rework Required" : s;
        return (
          <div key={s} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                  background: done ? C.green : active ? C.blue : "white",
                  border: `2px solid ${done ? C.green : active ? C.blue : C.border}`,
                }}
              >
                {done ? <Check size={16} color="white" /> : active ? <div className="w-2.5 h-2.5 rounded-full bg-white pulse" /> : <Circle size={10} color={C.border} fill={C.border} />}
              </div>
              {!isLast && <div className="w-0.5 flex-1 my-1" style={{ background: done ? C.green : C.border, minHeight: 34 }} />}
            </div>
            <div className="pb-8">
              <div className="font-semibold text-sm" style={{ color: done || active ? C.ink : C.sub }}>{label}</div>
              {report.timeline[s] ? (
                <div className="text-xs mt-0.5" style={{ color: C.sub }}>{fmtDate(report.timeline[s])}</div>
              ) : active ? (
                <div className="text-xs mt-0.5 font-medium" style={{ color: C.blue }}>In progress…</div>
              ) : (
                <div className="text-xs mt-0.5" style={{ color: C.border }}>Pending</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ============================= NAV SHELLS ============================= */
function TopNav({ role, active, onNavigate, onLogout, items, notifCount = 0 }) {
  return (
    <div className="sticky top-0 z-40 bg-white border-b" style={{ borderColor: C.border }}>
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Logo size={20} />
        <div className="hidden md:flex items-center gap-1">
          {items.map((it) => (
            <button
              key={it.key}
              onClick={() => onNavigate(it.key)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors"
              style={{ color: active === it.key ? C.blue : C.sub, background: active === it.key ? C.blue + "12" : "transparent" }}
            >
              <it.icon size={16} /> {it.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => onNavigate("notifications")} className="relative w-9 h-9 rounded-full flex items-center justify-center" style={{ background: C.bg }}>
            <Bell size={17} color={C.navy} />
            {notifCount > 0 && <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-[10px] flex items-center justify-center text-white font-bold" style={{ background: C.red }}>{notifCount}</span>}
          </button>
          <div className="hidden sm:flex items-center gap-2 pl-3 border-l" style={{ borderColor: C.border }}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: C.navy }}>{role[0]}</div>
            <button onClick={onLogout} title="Log out"><LogOut size={16} color={C.sub} /></button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SideNav({ items, active, onNavigate }) {
  return (
    <div className="hidden lg:flex flex-col w-64 flex-shrink-0 border-r bg-white min-h-[calc(100vh-64px)] py-6 px-4 gap-1" style={{ borderColor: C.border }}>
      {items.map((it) => (
        <button
          key={it.key}
          onClick={() => onNavigate(it.key)}
          className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors text-left"
          style={{ color: active === it.key ? "white" : C.ink, background: active === it.key ? C.navy : "transparent" }}
        >
          <it.icon size={17} /> {it.label}
        </button>
      ))}
    </div>
  );
}

/* ============================= LANDING & LOGIN ============================= */
function LegacyLandingPage({ onEnter }) {
  const steps = [
    { n: "01", t: "Report", d: "Citizens capture and submit civic problems in under two minutes.", icon: Camera },
    { n: "02", t: "Assign", d: "Administration reviews, prioritizes, and assigns the issue.", icon: ClipboardList },
    { n: "03", t: "Resolve", d: "Field workers receive tasks and complete the work on ground.", icon: Wrench },
    { n: "04", t: "Verify", d: "Officers verify the work using before/after completion evidence.", icon: ShieldCheck },
    { n: "05", t: "Improve", d: "Citizens see the result and give feedback that shapes the city.", icon: TrendingUp },
  ];
  const markers = useMemo(() => Array.from({ length: 14 }).map((_, i) => ({ id: i, x: 10 + Math.random() * 80, y: 10 + Math.random() * 80, priority: PRIORITIES[i % 4] })), []);
  return (
    <div style={{ background: C.bg }}>
      <div className="border-b bg-white" style={{ borderColor: C.border }}>
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Logo />
          <Btn variant="dark" onClick={() => onEnter("login")}>Sign In</Btn>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-16 pb-20 grid lg:grid-cols-2 gap-14 items-center">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-6" style={{ background: C.blue + "14", color: C.blue }}>
            <span className="w-1.5 h-1.5 rounded-full pulse" style={{ background: C.blue }} /> Smart Civic Infrastructure
          </div>
          <h1 className="font-display text-5xl leading-[1.05] mb-5" style={{ color: C.navy, fontWeight: 700 }}>
            See the problem.<br />Track the action.<br />Verify the change.
          </h1>
          <p className="text-base leading-relaxed mb-8 max-w-md" style={{ color: C.sub }}>
            NagarNetra connects citizens, city administration, field workers, and officers on one platform — so a reported problem is never lost, and every fix is verified.
          </p>
          <div className="flex flex-wrap gap-3">
            <Btn variant="primary" icon={Plus} className="!py-3.5 !px-6" onClick={() => onEnter("login")}>Report a Problem</Btn>
            <Btn variant="outline" icon={Search} className="!py-3.5 !px-6" onClick={() => onEnter("login")}>Track a Report</Btn>
          </div>
          <div className="flex gap-10 mt-10">
            {[["1,248", "Reports Filed"], ["846", "Issues Resolved"], ["2.4 Days", "Avg. Resolution"]].map(([v, l]) => (
              <div key={l}>
                <div className="font-display text-2xl" style={{ color: C.navy, fontWeight: 700 }}>{v}</div>
                <div className="text-xs" style={{ color: C.sub }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
        <CityMap markers={markers} height={420} />
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-24">
        <h2 className="font-display text-3xl mb-2" style={{ color: C.navy, fontWeight: 700 }}>How NagarNetra works</h2>
        <p className="mb-10 text-sm" style={{ color: C.sub }}>A closed loop from the first photo to a verified fix.</p>
        <div className="grid md:grid-cols-5 gap-5">
          {steps.map((s) => (
            <Card key={s.n} className="p-5">
              <div className="text-xs font-bold mb-4" style={{ color: C.blue }}>{s.n}</div>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: C.navy }}>
                <s.icon size={18} color="white" />
              </div>
              <div className="font-semibold mb-1.5" style={{ color: C.ink }}>{s.t}</div>
              <div className="text-xs leading-relaxed" style={{ color: C.sub }}>{s.d}</div>
            </Card>
          ))}
        </div>
      </div>

      <div style={{ background: C.navy }}>
        <div className="max-w-7xl mx-auto px-6 py-16 grid md:grid-cols-4 gap-8 text-white">
          {[
            ["Citizens", "\u201cI reported it, but I don\u2019t know what happened.\u201d"],
            ["Administration", "\u201cWe receive many complaints and struggle to organize and prioritize them.\u201d"],
            ["Field Workers", "\u201cWe need clear location, instructions, and task priority.\u201d"],
            ["Officers", "\u201cHow do I know the reported work was actually completed?\u201d"],
          ].map(([role, quote]) => (
            <div key={role}>
              <div className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: C.blueLight }}>{role}</div>
              <div className="text-sm leading-relaxed text-white/80">{quote}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function LegacyLoginPage({ onAuth }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ email: "", password: "", name: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to continue.");
      onAuth(data.user);
    } catch (requestError) {
      setError(requestError.message || "Unable to continue.");
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));
  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ background: `linear-gradient(160deg, ${C.navyDeep}, ${C.navy} 60%)` }}>
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-3"><Logo dark size={30} /></div>
        <p className="text-center text-sm text-white/60 mb-10">See the Problem. Track the Action. Verify the Change.</p>
        <Card className="p-6" style={{ background: "rgba(255,255,255,0.98)" }}>
          <div className="flex gap-1 p-1 rounded-xl mb-6" style={{ background: C.bg }}>
            {[{ key: "login", label: "Sign in" }, { key: "signup", label: "Create citizen account" }].map((tab) => (
              <button key={tab.key} onClick={() => { setMode(tab.key); setError(""); }} className="flex-1 rounded-lg py-2 text-xs font-semibold" style={{ background: mode === tab.key ? "white" : "transparent", color: mode === tab.key ? C.navy : C.sub, boxShadow: mode === tab.key ? "0 1px 4px rgba(15,27,45,0.1)" : "none" }}>{tab.label}</button>
            ))}
          </div>
          <div className="mb-5">
            <div className="text-lg font-display font-bold" style={{ color: C.ink }}>{mode === "login" ? "Welcome back" : "Join NagarNetra"}</div>
            <div className="text-xs mt-1" style={{ color: C.sub }}>{mode === "login" ? "Use the ID and password issued by your upper class." : "Citizen accounts can report and track civic issues."}</div>
          </div>
          <form onSubmit={submit} className="flex flex-col gap-3">
            {mode === "signup" && <label className="relative"><UserPlus size={16} color={C.sub} className="absolute left-3 top-3.5" /><input required value={form.name} onChange={updateField("name")} placeholder="Full name" className="w-full rounded-xl border py-3 pl-10 pr-3 text-sm outline-none" style={{ borderColor: C.border }} /></label>}
            <label className="relative"><Mail size={16} color={C.sub} className="absolute left-3 top-3.5" /><input required type="email" value={form.email} onChange={updateField("email")} placeholder="Email / user ID" className="w-full rounded-xl border py-3 pl-10 pr-3 text-sm outline-none" style={{ borderColor: C.border }} /></label>
            <label className="relative"><Lock size={16} color={C.sub} className="absolute left-3 top-3.5" /><input required type="password" value={form.password} onChange={updateField("password")} placeholder="Password" className="w-full rounded-xl border py-3 pl-10 pr-3 text-sm outline-none" style={{ borderColor: C.border }} /></label>
            {error && <div className="rounded-lg px-3 py-2 text-xs" style={{ color: C.red, background: C.red + "12" }}>{error}</div>}
            <Btn type="submit" disabled={loading} className="w-full mt-2">{loading ? "Checking..." : mode === "login" ? "Sign in securely" : "Create account"}</Btn>
          </form>
          <div className="text-[11px] text-center mt-5" style={{ color: C.sub }}>{mode === "login" ? "Admin, field worker, and officer access is issued by administration." : "Staff accounts cannot be created from this page."}</div>
        </Card>
      </div>
    </div>
  );
}

/* ============================= CITIZEN ============================= */
const CITIZEN_NAV = [
  { key: "citizen-home", label: "Home", icon: Home },
  { key: "citizen-report", label: "Report Issue", icon: Plus },
  { key: "citizen-myreports", label: "My Reports", icon: FileText },
  { key: "citizen-nearby", label: "Nearby Issues", icon: MapIcon },
];

function CitizenHome({ reports, citizenName, onNavigate, onOpenReport }) {
  const mine = reports.filter((r) => r.citizen === citizenName || r.isDemoNew);
  const submitted = mine.length;
  const inProgress = mine.filter((r) => ["Assigned", "In Progress", "Awaiting Verification"].includes(r.status)).length;
  const resolved = mine.filter((r) => r.status === "Resolved").length;
  const markers = reports.map((r, i) => ({ id: r.id, x: 15 + ((i * 13) % 70), y: 15 + ((i * 27) % 70), priority: r.priority }));
  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <Card className="p-10 mb-8 relative overflow-hidden" style={{ background: `linear-gradient(120deg, ${C.navy}, #123A6B)` }}>
        <div className="relative z-10 max-w-lg">
          <h1 className="font-display text-3xl text-white mb-3" style={{ fontWeight: 700 }}>See a problem? Help fix it.</h1>
          <p className="text-white/70 text-sm mb-6">Snap a photo, drop a pin, and NagarNetra takes it from there — all the way to a verified fix.</p>
          <Btn variant="primary" icon={Plus} className="!py-3.5 !px-6" onClick={() => onNavigate("citizen-report")}>Report a Civic Issue</Btn>
        </div>
        <Eye size={220} color="white" strokeWidth={0.5} className="absolute -right-10 -bottom-16 opacity-10" />
      </Card>

      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <StatCard label="Reports Submitted" value={submitted} color={C.navy} icon={FileText} />
        <StatCard label="In Progress" value={inProgress} color={C.orange} icon={Clock} />
        <StatCard label="Resolved" value={resolved} color={C.green} icon={CheckCircle2} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="font-semibold" style={{ color: C.ink }}>Your recent reports</div>
            <button onClick={() => onNavigate("citizen-myreports")} className="text-xs font-semibold" style={{ color: C.blue }}>View all</button>
          </div>
          <div className="flex flex-col gap-3">
            {mine.slice(0, 4).map((r) => (
              <button key={r.id} onClick={() => onOpenReport(r.id)} className="flex items-center gap-3 p-2.5 rounded-xl border text-left hover:bg-slate-50" style={{ borderColor: C.border }}>
                <img src={r.citizenImage} className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold truncate" style={{ color: C.ink }}>{r.title}</div>
                  <div className="text-xs" style={{ color: C.sub }}>{r.id} • {r.location.address}</div>
                </div>
                <StatusBadge status={r.status} />
              </button>
            ))}
            {mine.length === 0 && <div className="text-sm py-6 text-center" style={{ color: C.sub }}>No reports yet — report your first civic issue.</div>}
          </div>
        </Card>
        <Card className="p-5">
          <div className="font-semibold mb-4" style={{ color: C.ink }}>Nearby issues</div>
          <CityMap markers={markers} height={260} onMarkerClick={(m) => onOpenReport(m.id)} />
        </Card>
      </div>
    </div>
  );
}

function CitizenMyReports({ reports, citizenName, onOpenReport }) {
  const mine = reports.filter((r) => r.citizen === citizenName || r.isDemoNew);
  const [filter, setFilter] = useState("All");
  const filtered = filter === "All" ? mine : mine.filter((r) => r.status === filter);
  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <h1 className="font-display text-2xl mb-1" style={{ color: C.navy, fontWeight: 700 }}>My Reports</h1>
      <p className="text-sm mb-6" style={{ color: C.sub }}>Every issue you've reported, tracked from submission to verified resolution.</p>
      <div className="flex gap-2 mb-5 flex-wrap">
        {["All", ...STATUS_FLOW].map((s) => (
          <button key={s} onClick={() => setFilter(s)} className="px-3 py-1.5 rounded-full text-xs font-semibold border" style={{ borderColor: filter === s ? C.blue : C.border, color: filter === s ? C.blue : C.sub, background: filter === s ? C.blue + "10" : "white" }}>{s}</button>
        ))}
      </div>
      <div className="flex flex-col gap-3">
        {filtered.map((r) => (
          <Card key={r.id} className="p-4 flex items-center gap-4 cursor-pointer hover:shadow-md" onClick={() => onOpenReport(r.id)}>
            <img src={r.citizenImage} className="w-16 h-16 rounded-xl object-cover" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1"><IconFor category={r.category} size={14} color={C.sub} /><span className="text-xs" style={{ color: C.sub }}>{r.id}</span></div>
              <div className="font-semibold text-sm truncate" style={{ color: C.ink }}>{r.title}</div>
              <div className="text-xs mt-0.5" style={{ color: C.sub }}>{r.location.address} • Ward {r.location.ward}</div>
            </div>
            <PriorityBadge priority={r.priority} />
            <StatusBadge status={r.status} />
            <ChevronRight size={16} color={C.sub} />
          </Card>
        ))}
        {filtered.length === 0 && <div className="text-sm py-16 text-center" style={{ color: C.sub }}>No reports match this filter.</div>}
      </div>
    </div>
  );
}

function ReportWizard({ onSubmit, citizenName }) {
  const [step, setStep] = useState(1);
  const [image, setImage] = useState(null);
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [pin, setPin] = useState({ x: 45, y: 50 });
  const [address] = useState("Near Ganesh Chowk, Ward 12, Main Road");
  const [submittedReport, setSubmittedReport] = useState(null);

  const canNext = { 1: !!image, 2: category && description.trim().length > 5, 3: true, 4: true }[step];

  const handleSubmit = () => {
    const id = nextId();
    const now = Date.now();
    const report = {
      id, category, title: `${catMeta(category).label} Reported`, description,
      citizenImage: image, workerImage: null,
      location: { address, ward: 12, lat: "18.5204", lng: "73.8567" },
      priority: category === "electrical" ? "High" : "Medium",
      status: "Submitted", department: DEPARTMENTS[0], assignedWorker: null,
      citizen: citizenName, workNotes: "", completionNote: "",
      reportedDate: now, expectedCompletion: now + 4 * 24 * 3600 * 1000,
      timeline: { Submitted: now }, feedback: null, officerVerified: false, reworkReason: null,
      isDemoNew: true,
    };
    onSubmit(report);
    setSubmittedReport(report);
    setStep(5);
  };

  if (step === 5 && submittedReport) {
    return (
      <div className="max-w-xl mx-auto px-6 py-16 text-center fade-up">
        <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: C.green + "14" }}>
          <CheckCircle2 size={40} color={C.green} />
        </div>
        <h1 className="font-display text-2xl mb-2" style={{ color: C.navy, fontWeight: 700 }}>Report Submitted Successfully!</h1>
        <p className="text-sm mb-1" style={{ color: C.sub }}>Complaint ID</p>
        <div className="font-display text-xl mb-6 tracking-wide" style={{ color: C.blue, fontWeight: 700 }}>{submittedReport.id}</div>
        <p className="text-sm max-w-sm mx-auto mb-8" style={{ color: C.sub }}>Your report has been received and will be reviewed by the administration. You'll be notified at every step.</p>
        <div className="flex justify-center gap-3">
          <Btn variant="primary" onClick={() => onSubmit(submittedReport, "track")}>Track Report</Btn>
          <Btn variant="outline" onClick={() => { setStep(1); setImage(null); setCategory(""); setDescription(""); setSubmittedReport(null); }}>Report Another Issue</Btn>
        </div>
      </div>
    );
  }

  const stepsLabels = ["Capture", "Describe", "Location", "Review"];
  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <h1 className="font-display text-2xl mb-1" style={{ color: C.navy, fontWeight: 700 }}>Report a Civic Issue</h1>
      <p className="text-sm mb-6" style={{ color: C.sub }}>Takes less than two minutes.</p>

      <div className="flex items-center mb-8">
        {stepsLabels.map((s, i) => (
          <React.Fragment key={s}>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: step > i + 1 ? C.green : step === i + 1 ? C.blue : C.border, color: step >= i + 1 ? "white" : C.sub }}>
                {step > i + 1 ? <Check size={14} /> : i + 1}
              </div>
              <span className="text-xs font-medium hidden sm:block" style={{ color: step === i + 1 ? C.ink : C.sub }}>{s}</span>
            </div>
            {i < stepsLabels.length - 1 && <div className="flex-1 h-0.5 mx-2" style={{ background: step > i + 1 ? C.green : C.border }} />}
          </React.Fragment>
        ))}
      </div>

      <Card className="p-6 fade-up">
        {step === 1 && (
          <div>
            <div className="font-semibold mb-1" style={{ color: C.ink }}>Capture the problem</div>
            <p className="text-xs mb-4" style={{ color: C.sub }}>Upload a clear photo of the issue — this helps administration and workers understand it instantly.</p>
            <ImageDropzone value={image} onChange={setImage} />
          </div>
        )}
        {step === 2 && (
          <div>
            <div className="font-semibold mb-4" style={{ color: C.ink }}>Describe the problem</div>
            <label className="text-xs font-semibold" style={{ color: C.sub }}>Issue category</label>
            <div className="grid grid-cols-3 gap-2 mt-2 mb-5">
              {CATEGORIES.map((c) => (
                <button key={c.id} onClick={() => setCategory(c.id)} className="flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-medium" style={{ borderColor: category === c.id ? C.blue : C.border, background: category === c.id ? C.blue + "0C" : "white", color: category === c.id ? C.blue : C.ink }}>
                  <c.icon size={18} /> {c.label}
                </button>
              ))}
            </div>
            <label className="text-xs font-semibold" style={{ color: C.sub }}>Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} placeholder="Describe what happened and why it is a problem..." className="w-full mt-2 p-3 rounded-xl border text-sm outline-none" style={{ borderColor: C.border }} />
          </div>
        )}
        {step === 3 && (
          <div>
            <div className="font-semibold mb-1" style={{ color: C.ink }}>Location</div>
            <div className="flex items-center gap-1.5 text-xs font-medium mb-4" style={{ color: C.green }}><MapPin size={13} /> Location detected</div>
            <CityMap markers={[]} pin={pin} selectable onSelectPin={setPin} height={260} />
            <div className="grid sm:grid-cols-2 gap-3 mt-4 text-xs">
              <div className="p-3 rounded-xl" style={{ background: C.bg }}><div style={{ color: C.sub }}>Address</div><div className="font-semibold mt-0.5" style={{ color: C.ink }}>{address}</div></div>
              <div className="p-3 rounded-xl" style={{ background: C.bg }}><div style={{ color: C.sub }}>Latitude / Longitude</div><div className="font-semibold mt-0.5" style={{ color: C.ink }}>18.5204, 73.8567</div></div>
            </div>
            <Btn variant="outline" icon={Navigation} className="mt-4 !py-2.5 text-xs">Use My Current Location</Btn>
          </div>
        )}
        {step === 4 && (
          <div>
            <div className="font-semibold mb-4" style={{ color: C.ink }}>Review & submit</div>
            <div className="grid sm:grid-cols-2 gap-4">
              <img src={image} className="w-full h-48 object-cover rounded-xl" />
              <div className="flex flex-col gap-3 text-sm">
                <div><span style={{ color: C.sub }}>Category: </span><span className="font-semibold" style={{ color: C.ink }}>{catMeta(category).label}</span></div>
                <div><span style={{ color: C.sub }}>Description: </span><span style={{ color: C.ink }}>{description}</span></div>
                <div><span style={{ color: C.sub }}>Location: </span><span style={{ color: C.ink }}>{address}</span></div>
                <div><span style={{ color: C.sub }}>Date/time: </span><span style={{ color: C.ink }}>{fmtDate(Date.now())}</span></div>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between mt-7 pt-5 border-t" style={{ borderColor: C.border }}>
          <Btn variant="ghost" icon={ChevronLeft} onClick={() => setStep((s) => Math.max(1, s - 1))} disabled={step === 1}>Back</Btn>
          {step < 4 ? (
            <Btn variant="primary" onClick={() => setStep((s) => s + 1)} disabled={!canNext}>Next</Btn>
          ) : (
            <Btn variant="success" onClick={handleSubmit}>Submit Report</Btn>
          )}
        </div>
      </Card>
    </div>
  );
}

function CitizenReportDetail({ report, onFeedback }) {
  const [rating, setRating] = useState(report.feedback?.rating || 0);
  const [comment, setComment] = useState(report.feedback?.comment || "");
  const [sent, setSent] = useState(!!report.feedback);
  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="flex items-start justify-between mb-1 flex-wrap gap-2">
        <div>
          <div className="text-xs font-semibold" style={{ color: C.blue }}>{report.id}</div>
          <h1 className="font-display text-2xl mt-1" style={{ color: C.navy, fontWeight: 700 }}>{report.title}</h1>
        </div>
        <StatusBadge status={report.status} />
      </div>
      <div className="flex items-center gap-4 text-sm mb-6 flex-wrap" style={{ color: C.sub }}>
        <span className="flex items-center gap-1"><MapPin size={14} /> {report.location.address}, Ward {report.location.ward}</span>
        <PriorityBadge priority={report.priority} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <Card className="p-5">
          <div className="font-semibold mb-3 text-sm" style={{ color: C.ink }}>Reported photo</div>
          <img src={report.citizenImage} className="w-full h-64 object-cover rounded-xl" />
          <p className="text-sm mt-4 leading-relaxed" style={{ color: C.sub }}>{report.description}</p>
        </Card>
        <Card className="p-5">
          <div className="font-semibold mb-3 text-sm" style={{ color: C.ink }}>Status timeline</div>
          <Timeline report={report} />
        </Card>
      </div>

      {report.status === "Resolved" && report.workerImage && (
        <Card className="p-5 mb-6 fade-up">
          <div className="font-semibold mb-3 text-sm" style={{ color: C.ink }}>Before &amp; after</div>
          <BeforeAfterSlider before={report.citizenImage} after={report.workerImage} />
          <div className="flex items-center gap-5 mt-4 text-sm flex-wrap">
            <span className="flex items-center gap-1.5" style={{ color: C.green }}><CheckCircle2 size={16} /> Work completed</span>
            <span className="flex items-center gap-1.5" style={{ color: C.green }}><ShieldCheck size={16} /> Verified by Officer</span>
            <span style={{ color: C.sub }}>Resolved on {fmtDate(report.timeline["Resolved"])}</span>
          </div>

          <div className="mt-6 pt-5 border-t" style={{ borderColor: C.border }}>
            {sent ? (
              <div className="text-sm flex items-center gap-2" style={{ color: C.green }}><Check size={16} /> Thanks for your feedback!</div>
            ) : (
              <>
                <div className="text-sm font-semibold mb-2" style={{ color: C.ink }}>How satisfied are you?</div>
                <StarRating value={rating} onChange={setRating} />
                <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Optional comment..." rows={2} className="w-full mt-3 p-3 rounded-xl border text-sm outline-none" style={{ borderColor: C.border }} />
                <Btn variant="primary" className="mt-3" disabled={!rating} onClick={() => { onFeedback(report.id, { rating, comment }); setSent(true); }}>Submit Feedback</Btn>
              </>
            )}
          </div>
        </Card>
      )}

      {report.status === "Rework Required" && (
        <Card className="p-5 mb-6" style={{ borderColor: C.orange }}>
          <div className="flex items-center gap-2 font-semibold text-sm" style={{ color: C.orange }}><RotateCcw size={16} /> Rework in progress</div>
          <p className="text-sm mt-1" style={{ color: C.sub }}>The officer requested additional work before closing this issue. The field worker has been notified.</p>
        </Card>
      )}
    </div>
  );
}

/* ============================= ADMIN ============================= */
const ADMIN_NAV = [
  { key: "admin-dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "admin-issues", label: "All Issues", icon: ClipboardList },
  { key: "admin-map", label: "Map View", icon: MapIcon },
  { key: "admin-workers", label: "Field Workers", icon: Users },
  { key: "admin-analytics", label: "Reports & Analytics", icon: BarChart3 },
  { key: "admin-heatmap", label: "Civic Heatmap", icon: MapIcon },
];

function AdminDashboard({ reports, onNavigate, onOpenReport }) {
  const total = reports.length;
  const pending = reports.filter((r) => r.status === "Submitted").length;
  const inProgress = reports.filter((r) => ["Assigned", "In Progress", "Awaiting Verification"].includes(r.status)).length;
  const resolved = reports.filter((r) => r.status === "Resolved").length;
  const critical = reports.filter((r) => r.priority === "Critical").length;
  return (
    <div className="p-8">
      <h1 className="font-display text-2xl mb-1" style={{ color: C.navy, fontWeight: 700 }}>NagarNetra Command Center</h1>
      <p className="text-sm mb-6" style={{ color: C.sub }}>City-wide visibility into every reported civic issue.</p>
      <div className="grid sm:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
        <StatCard label="Total Reports" value={total} color={C.navy} icon={FileText} />
        <StatCard label="Pending Review" value={pending} color={C.sub} icon={Clock} />
        <StatCard label="In Progress" value={inProgress} color={C.orange} icon={Wrench} />
        <StatCard label="Resolved" value={resolved} color={C.green} icon={CheckCircle2} />
        <StatCard label="Critical" value={critical} color={C.red} icon={AlertTriangle} />
      </div>
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div className="font-semibold text-sm" style={{ color: C.ink }}>Needs attention</div>
            <button onClick={() => onNavigate("admin-issues")} className="text-xs font-semibold" style={{ color: C.blue }}>View all issues</button>
          </div>
          <div className="flex flex-col gap-2.5">
            {reports.filter((r) => r.status === "Submitted" || r.priority === "Critical").slice(0, 5).map((r) => (
              <button key={r.id} onClick={() => onOpenReport(r.id)} className="flex items-center gap-3 p-3 rounded-xl border hover:bg-slate-50 text-left" style={{ borderColor: C.border }}>
                <img src={r.citizenImage} className="w-12 h-12 rounded-lg object-cover" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold truncate" style={{ color: C.ink }}>{r.title}</div>
                  <div className="text-xs" style={{ color: C.sub }}>{r.id} • Ward {r.location.ward}</div>
                </div>
                <PriorityBadge priority={r.priority} />
                <ChevronRight size={15} color={C.sub} />
              </button>
            ))}
          </div>
        </Card>
        <Card className="p-5">
          <div className="font-semibold text-sm mb-4" style={{ color: C.ink }}>Department load</div>
          <div className="flex flex-col gap-3">
            {DEPARTMENTS.map((d) => {
              const count = reports.filter((r) => r.department === d && r.status !== "Resolved").length;
              return (
                <div key={d}>
                  <div className="flex justify-between text-xs mb-1"><span style={{ color: C.ink }}>{d}</span><span style={{ color: C.sub }}>{count}</span></div>
                  <div className="h-1.5 rounded-full" style={{ background: C.bg }}><div className="h-1.5 rounded-full" style={{ width: `${Math.min(100, count * 18)}%`, background: C.blue }} /></div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}

function AdminAllIssues({ reports, onOpenReport }) {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("All");
  const [priority, setPriority] = useState("All");
  const filtered = reports.filter((r) =>
    (status === "All" || r.status === status) &&
    (priority === "All" || r.priority === priority) &&
    (q === "" || r.id.toLowerCase().includes(q.toLowerCase()) || r.title.toLowerCase().includes(q.toLowerCase()) || r.location.address.toLowerCase().includes(q.toLowerCase()))
  );
  return (
    <div className="p-8">
      <h1 className="font-display text-2xl mb-1" style={{ color: C.navy, fontWeight: 700 }}>All Issues</h1>
      <p className="text-sm mb-5" style={{ color: C.sub }}>{filtered.length} of {reports.length} reports</p>
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl border flex-1 min-w-[220px]" style={{ borderColor: C.border }}>
          <Search size={15} color={C.sub} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by ID, location, citizen..." className="text-sm outline-none flex-1" />
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="px-3 py-2 rounded-xl border text-sm" style={{ borderColor: C.border, color: C.ink }}>
          <option>All</option>{STATUS_FLOW.map((s) => <option key={s}>{s}</option>)}
        </select>
        <select value={priority} onChange={(e) => setPriority(e.target.value)} className="px-3 py-2 rounded-xl border text-sm" style={{ borderColor: C.border, color: C.ink }}>
          <option>All</option>{PRIORITIES.map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>
      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left" style={{ background: C.bg }}>
              {["Issue", "Category", "Ward", "Priority", "Status", "Worker", ""].map((h) => (
                <th key={h} className="px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: C.sub }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id} className="border-t hover:bg-slate-50 cursor-pointer" style={{ borderColor: C.border }} onClick={() => onOpenReport(r.id)}>
                <td className="px-4 py-3">
                  <div className="font-semibold" style={{ color: C.ink }}>{r.title}</div>
                  <div className="text-xs" style={{ color: C.sub }}>{r.id}</div>
                </td>
                <td className="px-4 py-3"><div className="flex items-center gap-1.5 text-xs" style={{ color: C.sub }}><IconFor category={r.category} size={14} />{catMeta(r.category).label}</div></td>
                <td className="px-4 py-3 text-xs" style={{ color: C.sub }}>Ward {r.location.ward}</td>
                <td className="px-4 py-3"><PriorityBadge priority={r.priority} /></td>
                <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                <td className="px-4 py-3 text-xs" style={{ color: C.sub }}>{r.assignedWorker || "—"}</td>
                <td className="px-4 py-3"><ChevronRight size={15} color={C.sub} /></td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="text-sm py-14 text-center" style={{ color: C.sub }}>No issues match these filters.</div>}
      </Card>
    </div>
  );
}

function AdminMapView({ reports, onOpenReport }) {
  const [filterCat, setFilterCat] = useState("All");
  const [selected, setSelected] = useState(null);
  const filtered = filterCat === "All" ? reports : reports.filter((r) => r.category === filterCat);
  const markers = filtered.map((r, i) => ({ id: r.id, x: 10 + ((i * 17) % 80), y: 10 + ((i * 23) % 80), priority: r.priority }));
  const sel = reports.find((r) => r.id === selected);
  return (
    <div className="p-8">
      <h1 className="font-display text-2xl mb-1" style={{ color: C.navy, fontWeight: 700 }}>Live Issue Map</h1>
      <p className="text-sm mb-5" style={{ color: C.sub }}>Real-time view of every open civic issue across the city.</p>
      <div className="flex gap-2 mb-4 flex-wrap">
        <button onClick={() => setFilterCat("All")} className="px-3 py-1.5 rounded-full text-xs font-semibold border" style={{ borderColor: filterCat === "All" ? C.blue : C.border, color: filterCat === "All" ? C.blue : C.sub }}>All Categories</button>
        {CATEGORIES.slice(0, 6).map((c) => (
          <button key={c.id} onClick={() => setFilterCat(c.id)} className="px-3 py-1.5 rounded-full text-xs font-semibold border flex items-center gap-1.5" style={{ borderColor: filterCat === c.id ? C.blue : C.border, color: filterCat === c.id ? C.blue : C.sub }}><c.icon size={12} />{c.label}</button>
        ))}
      </div>
      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <CityMap markers={markers} height={500} highlightId={selected} onMarkerClick={(m) => setSelected(m.id)} />
          <div className="flex gap-4 mt-3 text-xs flex-wrap">
            {PRIORITIES.map((p) => (
              <span key={p} className="flex items-center gap-1.5" style={{ color: C.sub }}><span className="w-2.5 h-2.5 rounded-full" style={{ background: PRIORITY_COLOR[p] }} />{p}</span>
            ))}
          </div>
        </div>
        <div>
          {sel ? (
            <Card className="p-4 fade-up">
              <img src={sel.citizenImage} className="w-full h-36 object-cover rounded-xl mb-3" />
              <div className="flex items-center gap-2 mb-1"><IconFor category={sel.category} size={14} color={C.sub} /><span className="text-xs" style={{ color: C.sub }}>{catMeta(sel.category).label}</span></div>
              <div className="font-semibold text-sm" style={{ color: C.ink }}>{sel.title}</div>
              <div className="text-xs mt-1 flex items-center gap-1" style={{ color: C.sub }}><MapPin size={12} /> {sel.location.address}</div>
              <div className="flex gap-2 mt-3"><PriorityBadge priority={sel.priority} /><StatusBadge status={sel.status} /></div>
              <div className="text-xs mt-2" style={{ color: C.sub }}>{sel.id}</div>
              <Btn variant="primary" className="w-full mt-4 !py-2.5" onClick={() => onOpenReport(sel.id)}>View Issue</Btn>
            </Card>
          ) : (
            <Card className="p-6 text-center text-sm" style={{ color: C.sub }}>Click a marker on the map to preview an issue.</Card>
          )}
        </div>
      </div>
    </div>
  );
}

function smartPriority(report) {
  if (report.category === "electrical") return { level: "Critical", reason: "Electrical infrastructure failure near a road creates an immediate public safety risk." };
  if (report.category === "tree" || report.category === "water") return { level: "High", reason: "This issue obstructs movement or wastes a critical resource and should be actioned quickly." };
  if (report.category === "pothole" || report.category === "drainage") return { level: "High", reason: "Located on a high-footfall stretch; delay increases risk of accidents or waterlogging." };
  return { level: "Medium", reason: "Impacts local convenience but poses limited immediate safety risk." };
}

function AdminIssueReview({ report, onUpdate, notify }) {
  const suggestion = useMemo(() => smartPriority(report), [report.id]);
  const [priority, setPriority] = useState(report.priority);
  const [department, setDepartment] = useState(report.department);
  const [worker, setWorker] = useState(report.assignedWorker || "");
  const [instructions, setInstructions] = useState(report.workNotes || "");

  const assign = () => {
    onUpdate(report.id, {
      priority, department, assignedWorker: worker, workNotes: instructions,
      status: "Assigned", timeline: { ...report.timeline, Reviewed: report.timeline.Reviewed || Date.now(), Assigned: Date.now() },
    });
    notify(`Task assigned to ${worker} for ${report.id}.`);
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="text-xs font-semibold mb-1" style={{ color: C.blue }}>{report.id}</div>
      <h1 className="font-display text-2xl mb-6" style={{ color: C.navy, fontWeight: 700 }}>{report.title}</h1>
      <div className="grid lg:grid-cols-2 gap-6">
        <div>
          <img src={report.citizenImage} className="w-full h-72 object-cover rounded-2xl" />
        </div>
        <div className="flex flex-col gap-3 text-sm">
          <Row label="Category" value={catMeta(report.category).label} />
          <Row label="Description" value={report.description} />
          <Row label="Location" value={`${report.location.address}, Ward ${report.location.ward}`} />
          <Row label="Reported" value={fmtDate(report.reportedDate)} />
          <Row label="Citizen" value={report.citizen} />
          <Row label="Current Status" value={<StatusBadge status={report.status} />} />
        </div>
      </div>

      <Card className="p-5 mt-6" style={{ background: `linear-gradient(120deg, ${C.blue}0D, transparent)`, borderColor: C.blue + "40" }}>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: C.blue }}><Eye size={14} color="white" /></div>
          <span className="font-semibold text-sm" style={{ color: C.navy }}>NagarNetra Smart Priority</span>
        </div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs" style={{ color: C.sub }}>Suggested Priority:</span>
          <PriorityBadge priority={suggestion.level} />
        </div>
        <p className="text-xs" style={{ color: C.sub }}>{suggestion.reason}</p>
      </Card>

      <Card className="p-5 mt-6">
        <div className="font-semibold text-sm mb-4" style={{ color: C.ink }}>Administration controls</div>
        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-xs font-semibold" style={{ color: C.sub }}>Priority</label>
            <div className="flex gap-2 mt-2 flex-wrap">
              {PRIORITIES.map((p) => (
                <button key={p} onClick={() => setPriority(p)} className="px-3 py-1.5 rounded-full text-xs font-semibold border" style={{ borderColor: priority === p ? PRIORITY_COLOR[p] : C.border, color: priority === p ? PRIORITY_COLOR[p] : C.sub, background: priority === p ? PRIORITY_COLOR[p] + "14" : "white" }}>{p}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold" style={{ color: C.sub }}>Department</label>
            <select value={department} onChange={(e) => setDepartment(e.target.value)} className="w-full mt-2 px-3 py-2 rounded-xl border text-sm" style={{ borderColor: C.border }}>
              {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
            </select>
          </div>
        </div>
        <label className="text-xs font-semibold" style={{ color: C.sub }}>Assign Field Worker</label>
        <select value={worker} onChange={(e) => setWorker(e.target.value)} className="w-full mt-2 mb-4 px-3 py-2 rounded-xl border text-sm" style={{ borderColor: C.border }}>
          <option value="">Select a worker...</option>
          {WORKERS.map((w) => <option key={w.id} value={w.name}>{w.name} — {w.dept} ({w.load} active tasks)</option>)}
        </select>
        <label className="text-xs font-semibold" style={{ color: C.sub }}>Work instructions</label>
        <textarea value={instructions} onChange={(e) => setInstructions(e.target.value)} rows={2} placeholder="Add instructions for the field worker..." className="w-full mt-2 mb-4 px-3 py-2 rounded-xl border text-sm" style={{ borderColor: C.border }} />
        <div className="flex flex-wrap gap-3">
          <Btn variant="success" icon={CheckCircle2} disabled={!worker} onClick={assign}>Assign Task</Btn>
          <Btn variant="outline" icon={AlertTriangle} onClick={() => { onUpdate(report.id, { status: "Rejected" }); notify(`Report ${report.id} was rejected.`); }}>Reject Report</Btn>
          <Btn variant="ghost" icon={ClipboardList} onClick={() => notify("Requested more information from citizen.")}>Request More Information</Btn>
        </div>
      </Card>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div>
      <div className="text-xs font-semibold" style={{ color: C.sub }}>{label}</div>
      <div className="mt-0.5" style={{ color: C.ink }}>{value}</div>
    </div>
  );
}

function AdminWorkers({ reports }) {
  return (
    <div className="p-8">
      <h1 className="font-display text-2xl mb-1" style={{ color: C.navy, fontWeight: 700 }}>Field Workers</h1>
      <p className="text-sm mb-6" style={{ color: C.sub }}>Workload distribution across active field staff.</p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {WORKERS.map((w) => {
          const tasks = reports.filter((r) => r.assignedWorker === w.name && r.status !== "Resolved");
          return (
            <Card key={w.id} className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold text-white" style={{ background: C.navy }}>{w.name.split(" ").map((n) => n[0]).join("")}</div>
                <div>
                  <div className="font-semibold text-sm" style={{ color: C.ink }}>{w.name}</div>
                  <div className="text-xs" style={{ color: C.sub }}>{w.dept} Department</div>
                </div>
              </div>
              <div className="text-xs" style={{ color: C.sub }}>{tasks.length} active task{tasks.length !== 1 ? "s" : ""}</div>
              <div className="flex flex-col gap-1.5 mt-2">
                {tasks.map((t) => <div key={t.id} className="text-xs px-2.5 py-1.5 rounded-lg" style={{ background: C.bg, color: C.ink }}>{t.title}</div>)}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function AdminAnalytics({ reports }) {
  const byCategory = CATEGORIES.map((c) => ({ name: c.label, value: reports.filter((r) => r.category === c.id).length })).filter((d) => d.value > 0);
  const byPriority = PRIORITIES.map((p) => ({ name: p, value: reports.filter((r) => r.priority === p).length }));
  const trend = Array.from({ length: 7 }).map((_, i) => ({ day: `Day ${i + 1}`, reports: 3 + Math.round(Math.sin(i) * 2 + i * 0.6) }));
  const resolutionRate = Math.round((reports.filter((r) => r.status === "Resolved").length / reports.length) * 1000) / 10;
  const pieColors = [C.blue, C.orange, C.green, C.red, C.yellow, "#8B5CF6", C.navy];

  return (
    <div className="p-8">
      <h1 className="font-display text-2xl mb-1" style={{ color: C.navy, fontWeight: 700 }}>Reports & Analytics</h1>
      <p className="text-sm mb-6" style={{ color: C.sub }}>City-wide performance across every department.</p>
      <div className="grid sm:grid-cols-4 gap-4 mb-6">
        <StatCard label="Resolution Rate" value={`${resolutionRate}%`} color={C.green} icon={TrendingUp} />
        <StatCard label="Avg. Resolution Time" value="2.4 Days" color={C.blue} icon={Clock} />
        <StatCard label="Most Reported" value="Road Damage" color={C.orange} icon={Construction} />
        <StatCard label="Highest Issue Ward" value="Ward 12" color={C.navy} icon={MapPin} />
      </div>
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <Card className="p-5">
          <div className="font-semibold text-sm mb-4" style={{ color: C.ink }}>Issues by category</div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={byCategory}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-20} textAnchor="end" height={60} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="value" fill={C.blue} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card className="p-5">
          <div className="font-semibold text-sm mb-4" style={{ color: C.ink }}>Issues by priority</div>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={byPriority} dataKey="value" nameKey="name" outerRadius={85} label>
                {byPriority.map((d, i) => <Cell key={i} fill={PRIORITY_COLOR[d.name]} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>
      <Card className="p-5">
        <div className="font-semibold text-sm mb-4" style={{ color: C.ink }}>Reports over time</div>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={trend}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
            <XAxis dataKey="day" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Line type="monotone" dataKey="reports" stroke={C.blue} strokeWidth={2.5} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}

function AdminHeatmap({ reports }) {
  const wards = [...new Set(reports.map((r) => r.location.ward))];
  const [activeWard, setActiveWard] = useState(wards[0]);
  const [cat, setCat] = useState("All");
  const filtered = cat === "All" ? reports : reports.filter((r) => r.category === cat);
  const markers = filtered.map((r, i) => ({ id: r.id, x: 8 + ((r.location.ward * 11 + i * 7) % 84), y: 8 + ((r.location.ward * 17 + i * 13) % 84), priority: r.priority }));
  const wardIssues = reports.filter((r) => r.location.ward === activeWard);
  const wardCat = (id) => wardIssues.filter((r) => r.category === id).length;
  return (
    <div className="p-8">
      <h1 className="font-display text-2xl mb-1" style={{ color: C.navy, fontWeight: 700 }}>Civic Issue Heatmap</h1>
      <p className="text-sm mb-5" style={{ color: C.sub }}>Where the city needs resources most.</p>
      <div className="flex gap-2 mb-4 flex-wrap">
        {["All", "pothole", "garbage", "electrical", "water", "drainage"].map((c) => (
          <button key={c} onClick={() => setCat(c)} className="px-3 py-1.5 rounded-full text-xs font-semibold border" style={{ borderColor: cat === c ? C.blue : C.border, color: cat === c ? C.blue : C.sub }}>{c === "All" ? "All Issues" : catMeta(c).label}</button>
        ))}
      </div>
      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2"><CityMap markers={markers} height={480} /></div>
        <Card className="p-5">
          <div className="text-xs font-semibold mb-2" style={{ color: C.sub }}>Select ward</div>
          <div className="flex flex-wrap gap-1.5 mb-4">
            {wards.map((w) => <button key={w} onClick={() => setActiveWard(w)} className="px-2.5 py-1 rounded-lg text-xs font-semibold border" style={{ borderColor: activeWard === w ? C.blue : C.border, color: activeWard === w ? C.blue : C.sub }}>Ward {w}</button>)}
          </div>
          <div className="font-display text-lg mb-1" style={{ color: C.navy, fontWeight: 700 }}>Ward {activeWard}</div>
          <div className="text-sm mb-3" style={{ color: C.sub }}>{wardIssues.length} Open Issues</div>
          <div className="flex flex-col gap-2 text-sm">
            <div className="flex justify-between"><span style={{ color: C.ink }}>Road Issues</span><span className="font-semibold">{wardCat("pothole")}</span></div>
            <div className="flex justify-between"><span style={{ color: C.ink }}>Garbage Issues</span><span className="font-semibold">{wardCat("garbage")}</span></div>
            <div className="flex justify-between"><span style={{ color: C.ink }}>Electrical Issues</span><span className="font-semibold">{wardCat("electrical")}</span></div>
            <div className="flex justify-between"><span style={{ color: C.ink }}>Water Issues</span><span className="font-semibold">{wardCat("water")}</span></div>
            <div className="flex justify-between"><span style={{ color: C.ink }}>Other</span><span className="font-semibold">{wardIssues.length - wardCat("pothole") - wardCat("garbage") - wardCat("electrical") - wardCat("water")}</span></div>
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ============================= WORKER ============================= */
const WORKER_NAV = [
  { key: "worker-tasks", label: "My Tasks", icon: ClipboardList },
];

function WorkerDashboard({ reports, workerName, onOpenTask }) {
  const tasks = reports.filter((r) => r.assignedWorker === workerName && r.status !== "Resolved");
  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="font-display text-2xl mb-1" style={{ color: C.navy, fontWeight: 700 }}>My Field Tasks</h1>
      <p className="text-sm mb-5" style={{ color: C.sub }}>{tasks.length} active task{tasks.length !== 1 ? "s" : ""} assigned to you today.</p>
      <div className="flex flex-col gap-3">
        {tasks.map((t) => (
          <Card key={t.id} className="p-4">
            <div className="flex items-start gap-3">
              <img src={t.citizenImage} className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <PriorityBadge priority={t.priority} />
                <div className="font-semibold mt-1.5 text-sm" style={{ color: C.ink }}>{t.title}</div>
                <div className="text-xs mt-1 flex items-center gap-1" style={{ color: C.sub }}><MapPin size={12} /> {t.location.address}</div>
                <div className="text-xs mt-0.5" style={{ color: C.sub }}>Assigned {fmtDate(t.timeline.Assigned || t.reportedDate)}</div>
              </div>
            </div>
            <Btn variant="dark" className="w-full mt-3 !py-3" onClick={() => onOpenTask(t.id)}>View Task</Btn>
          </Card>
        ))}
        {tasks.length === 0 && <Card className="p-10 text-center text-sm" style={{ color: C.sub }}>No active tasks right now. New assignments will appear here.</Card>}
      </div>
    </div>
  );
}

const WORKER_STEPS = ["Assigned", "Accepted", "On the Way", "Work Started", "Work Completed"];

function WorkerTaskPage({ report, onUpdate, onGoComplete }) {
  const idxMap = { Assigned: 0, Accepted: 0, "On the Way": 1, "In Progress": 3, "Awaiting Verification": 4, Resolved: 4, "Rework Required": 3 };
  const [wStep, setWStep] = useState(idxMap[report.status] ?? 0);

  const advance = () => {
    const next = Math.min(wStep + 1, WORKER_STEPS.length - 1);
    setWStep(next);
    if (WORKER_STEPS[next] === "Work Completed") {
      onGoComplete(report.id);
    } else if (WORKER_STEPS[next] === "Work Started") {
      onUpdate(report.id, { status: "In Progress", timeline: { ...report.timeline, "In Progress": Date.now() } });
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="text-xs font-semibold mb-1" style={{ color: C.blue }}>{report.id}</div>
      <h1 className="font-display text-xl mb-4" style={{ color: C.navy, fontWeight: 700 }}>{report.title}</h1>

      <Card className="p-4 mb-4">
        <div className="font-semibold text-sm mb-2" style={{ color: C.ink }}>Problem reported</div>
        <img src={report.citizenImage} className="w-full h-52 object-cover rounded-xl mb-3" />
        <p className="text-sm" style={{ color: C.sub }}>{report.description}</p>
      </Card>

      <Card className="p-4 mb-4">
        <div className="font-semibold text-sm mb-2" style={{ color: C.ink }}>Location</div>
        <CityMap markers={[{ id: report.id, x: 50, y: 50, priority: report.priority }]} height={200} />
        <div className="text-xs mt-2 flex items-center gap-1" style={{ color: C.sub }}><MapPin size={12} /> {report.location.address}, Ward {report.location.ward}</div>
      </Card>

      <div className="flex items-center gap-3 mb-4">
        <span className="text-xs font-semibold" style={{ color: C.sub }}>Priority</span>
        <PriorityBadge priority={report.priority} />
      </div>

      {report.workNotes && (
        <Card className="p-4 mb-4" style={{ background: C.orange + "0C", borderColor: C.orange + "40" }}>
          <div className="font-semibold text-sm mb-1" style={{ color: C.orange }}>Work instructions</div>
          <p className="text-sm" style={{ color: C.ink }}>{report.workNotes}</p>
        </Card>
      )}

      {report.status === "Rework Required" && report.reworkReason && (
        <Card className="p-4 mb-4" style={{ background: C.red + "0C", borderColor: C.red + "40" }}>
          <div className="font-semibold text-sm mb-1" style={{ color: C.red }}>Rework requested</div>
          <p className="text-sm" style={{ color: C.ink }}>{report.reworkReason}</p>
        </Card>
      )}

      <Card className="p-4 mb-4">
        <div className="font-semibold text-sm mb-4" style={{ color: C.ink }}>Work status</div>
        <div className="flex items-center flex-wrap gap-y-3">
          {WORKER_STEPS.map((s, i) => (
            <React.Fragment key={s}>
              <div className="flex flex-col items-center gap-1 w-16">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs" style={{ background: i <= wStep ? C.blue : C.border, color: i <= wStep ? "white" : C.sub }}>{i < wStep ? <Check size={13} /> : i + 1}</div>
                <span className="text-[10px] text-center leading-tight" style={{ color: i <= wStep ? C.ink : C.sub }}>{s}</span>
              </div>
              {i < WORKER_STEPS.length - 1 && <div className="flex-1 h-0.5 min-w-[10px]" style={{ background: i < wStep ? C.blue : C.border }} />}
            </React.Fragment>
          ))}
        </div>
      </Card>

      <div className="flex gap-3">
        <Btn variant="outline" icon={Navigation} className="flex-1 !py-3.5">Navigate</Btn>
        {wStep < WORKER_STEPS.length - 1 && <Btn variant="primary" icon={PlayCircle} className="flex-1 !py-3.5" onClick={advance}>{WORKER_STEPS[wStep + 1]}</Btn>}
      </div>
    </div>
  );
}

function WorkerCompletionUpload({ report, onSubmit }) {
  const [afterImage, setAfterImage] = useState(null);
  const [note, setNote] = useState("");
  const [done, setDone] = useState(false);

  if (done) {
    return (
      <div className="max-w-md mx-auto px-6 py-20 text-center fade-up">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5" style={{ background: "#8B5CF614" }}>
          <ShieldCheck size={30} color="#8B5CF6" />
        </div>
        <h1 className="font-display text-xl mb-2" style={{ color: C.navy, fontWeight: 700 }}>Work Completed</h1>
        <p className="text-sm" style={{ color: C.sub }}>Awaiting officer verification. You'll be notified of the outcome.</p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-6">
      <div className="text-xs font-semibold mb-1" style={{ color: C.blue }}>{report.id}</div>
      <h1 className="font-display text-xl mb-4" style={{ color: C.navy, fontWeight: 700 }}>Upload Completion Evidence</h1>
      <Card className="p-4 mb-4">
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <div className="text-xs font-semibold mb-1.5" style={{ color: C.sub }}>Before</div>
            <img src={report.citizenImage} className="w-full h-32 object-cover rounded-xl" />
          </div>
          <div>
            <div className="text-xs font-semibold mb-1.5" style={{ color: C.sub }}>After</div>
            {afterImage ? <img src={afterImage} className="w-full h-32 object-cover rounded-xl" /> : <div className="w-full h-32 rounded-xl flex items-center justify-center text-xs" style={{ background: C.bg, color: C.sub }}>Not uploaded</div>}
          </div>
        </div>
        <ImageDropzone value={afterImage} onChange={setAfterImage} />
        <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} placeholder="Add a completion note describing the work done..." className="w-full mt-3 p-3 rounded-xl border text-sm" style={{ borderColor: C.border }} />
      </Card>
      <Btn variant="primary" className="w-full !py-3.5" disabled={!afterImage} onClick={() => { onSubmit(report.id, afterImage, note); setDone(true); }}>Submit for Verification</Btn>
    </div>
  );
}

/* ============================= OFFICER ============================= */
const OFFICER_NAV = [
  { key: "officer-verify", label: "Verification Center", icon: ShieldCheck },
];

function OfficerDashboard({ reports, onOpenVerify }) {
  const [tab, setTab] = useState("Pending Verification");
  const groups = {
    "Pending Verification": reports.filter((r) => r.status === "Awaiting Verification"),
    "Approved": reports.filter((r) => r.status === "Resolved"),
    "Rejected": reports.filter((r) => r.status === "Rejected"),
    "Rework Required": reports.filter((r) => r.status === "Rework Required"),
  };
  const list = groups[tab];
  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <h1 className="font-display text-2xl mb-1" style={{ color: C.navy, fontWeight: 700 }}>Verification Center</h1>
      <p className="text-sm mb-6" style={{ color: C.sub }}>Confirm field work before a citizen's report is closed.</p>
      <div className="flex gap-2 mb-5 flex-wrap">
        {Object.keys(groups).map((t) => (
          <button key={t} onClick={() => setTab(t)} className="px-3.5 py-2 rounded-xl text-xs font-semibold border flex items-center gap-1.5" style={{ borderColor: tab === t ? C.blue : C.border, color: tab === t ? C.blue : C.sub, background: tab === t ? C.blue + "0C" : "white" }}>
            {t} <span className="px-1.5 py-0.5 rounded-full text-[10px]" style={{ background: C.bg }}>{groups[t].length}</span>
          </button>
        ))}
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        {list.map((r) => (
          <Card key={r.id} className="p-4 cursor-pointer hover:shadow-md" onClick={() => tab === "Pending Verification" ? onOpenVerify(r.id) : null}>
            <div className="grid grid-cols-2 gap-2 mb-3">
              <img src={r.citizenImage} className="w-full h-28 object-cover rounded-lg" />
              <img src={r.workerImage || r.citizenImage} className="w-full h-28 object-cover rounded-lg" />
            </div>
            <div className="font-semibold text-sm" style={{ color: C.ink }}>{r.title}</div>
            <div className="text-xs mt-1" style={{ color: C.sub }}>{r.location.address} • Worker: {r.assignedWorker}</div>
            <div className="text-xs" style={{ color: C.sub }}>Completed {r.timeline["Awaiting Verification"] ? fmtDate(r.timeline["Awaiting Verification"]) : "—"}</div>
            {tab === "Pending Verification" && <Btn variant="dark" className="w-full mt-3 !py-2.5">Review</Btn>}
          </Card>
        ))}
        {list.length === 0 && <div className="col-span-2 text-sm py-14 text-center" style={{ color: C.sub }}>Nothing here right now.</div>}
      </div>
    </div>
  );
}

function OfficerVerifyDetail({ report, onDecision }) {
  const [reworkOpen, setReworkOpen] = useState(false);
  const [reworkReason, setReworkReason] = useState("");
  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="text-xs font-semibold mb-1" style={{ color: C.blue }}>{report.id}</div>
      <h1 className="font-display text-2xl mb-6" style={{ color: C.navy, fontWeight: 700 }}>{report.title}</h1>

      <Card className="p-5 mb-6">
        <BeforeAfterSlider before={report.citizenImage} after={report.workerImage} />
      </Card>

      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        <Row label="Location" value={`${report.location.address}, Ward ${report.location.ward}`} />
        <Row label="Field Worker" value={report.assignedWorker} />
        <Row label="Completion Date" value={report.timeline["Awaiting Verification"] ? fmtDate(report.timeline["Awaiting Verification"]) : "—"} />
        <Row label="Work Notes" value={report.completionNote || "—"} />
      </div>

      {reworkOpen ? (
        <Card className="p-5">
          <div className="font-semibold text-sm mb-2" style={{ color: C.ink }}>Describe what needs to be redone</div>
          <textarea value={reworkReason} onChange={(e) => setReworkReason(e.target.value)} rows={3} placeholder="e.g. Repair is incomplete. Please restore the damaged road surface around the pothole." className="w-full p-3 rounded-xl border text-sm" style={{ borderColor: C.border }} />
          <div className="flex gap-3 mt-3">
            <Btn variant="warn" icon={RotateCcw} disabled={!reworkReason.trim()} onClick={() => onDecision(report.id, "rework", reworkReason)}>Send Back to Worker</Btn>
            <Btn variant="ghost" onClick={() => setReworkOpen(false)}>Cancel</Btn>
          </div>
        </Card>
      ) : (
        <div className="flex flex-wrap gap-3">
          <Btn variant="success" icon={ThumbsUp} onClick={() => onDecision(report.id, "approve")}>Approve & Close</Btn>
          <Btn variant="warn" icon={RotateCcw} onClick={() => setReworkOpen(true)}>Request Rework</Btn>
          <Btn variant="danger" icon={XCircle} onClick={() => onDecision(report.id, "reject")}>Reject</Btn>
        </div>
      )}
    </div>
  );
}

/* ============================= NOTIFICATIONS ============================= */
function NotificationsPage({ notifications }) {
  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <h1 className="font-display text-2xl mb-6" style={{ color: C.navy, fontWeight: 700 }}>Notifications</h1>
      <div className="flex flex-col gap-2.5">
        {notifications.map((n, i) => (
          <Card key={i} className="p-4 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: C.blue + "14" }}><Bell size={14} color={C.blue} /></div>
            <div className="flex-1">
              <div className="text-sm" style={{ color: C.ink }}>{n.text}</div>
              <div className="text-xs mt-0.5" style={{ color: C.sub }}>{fmtDate(n.time)}</div>
            </div>
          </Card>
        ))}
        {notifications.length === 0 && <div className="text-sm text-center py-14" style={{ color: C.sub }}>You're all caught up.</div>}
      </div>
    </div>
  );
}

/* ============================= APP ROOT ============================= */
export default function NagarNetraApp() {
  const [reports, setReports] = useState(seedReports);
  const [view, setView] = useState("landing");
  const [role, setRole] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [toast, setToast] = useState(null);
  const [notifications, setNotifications] = useState({ citizen: [], admin: [], worker: [], officer: [] });

  const citizenName = currentUser?.name || "Rohit Sharma";
  const workerName = "Ramesh Yadav";

  const notify = (audience, text) => {
    setNotifications((prev) => ({ ...prev, [audience]: [{ text, time: Date.now() }, ...prev[audience]] }));
    setToast(text);
  };

  const updateReport = (id, patch) => {
    setReports((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  };

  const handleAuth = (user) => {
    setCurrentUser(user);
    setRole(user.role);
    setView(user.role === "citizen" ? "citizen-home" : user.role === "admin" ? "admin-dashboard" : user.role === "worker" ? "worker-tasks" : "officer-verify");
  };

  const handleLogout = () => { setCurrentUser(null); setRole(null); setView("landing"); };

  const selectedReport = reports.find((r) => r.id === selectedId);

  // --- Citizen submit report ---
  const handleCitizenSubmit = (report, action) => {
    if (action === "track") { setSelectedId(report.id); setView("citizen-track"); return; }
    setReports((prev) => [report, ...prev]);
    notify("admin", `New issue reported: ${report.title} (${report.id}).`);
  };

  const handleFeedback = (id, feedback) => updateReport(id, { feedback });

  // --- Admin assign ---
  const handleAdminNotify = (text) => notify("admin", text);
  const onAdminAssign = (id, patch) => {
    updateReport(id, patch);
    if (patch.assignedWorker) notify("worker", `New task assigned: ${reports.find((r) => r.id === id)?.title} (${id}).`);
    notify("citizen", `Your report ${id} has a field worker assigned.`);
  };

  // --- Worker completion ---
  const handleWorkerComplete = (id, afterImage, note) => {
    updateReport(id, {
      workerImage: afterImage, completionNote: note, status: "Awaiting Verification",
      timeline: { ...reports.find((r) => r.id === id).timeline, "Awaiting Verification": Date.now() },
    });
    notify("officer", `Work submitted for verification: ${id}.`);
    notify("citizen", `Work on your report ${id} has been completed and is awaiting verification.`);
  };

  // --- Officer decision ---
  const handleOfficerDecision = (id, decision, reason) => {
    const r = reports.find((rp) => rp.id === id);
    if (decision === "approve") {
      updateReport(id, { status: "Resolved", officerVerified: true, timeline: { ...r.timeline, Resolved: Date.now() } });
      notify("citizen", `Your reported issue ${id} has been resolved and verified.`);
    } else if (decision === "reject") {
      updateReport(id, { status: "Rejected" });
      notify("citizen", `Your report ${id} was reviewed and rejected by the officer.`);
    } else if (decision === "rework") {
      updateReport(id, { status: "Rework Required", reworkReason: reason });
      notify("worker", `Rework requested on ${id}: ${reason}`);
      notify("citizen", `Additional work is being done on your report ${id}.`);
    }
    setView("officer-verify");
  };

  const openReport = (id) => {
    setSelectedId(id);
    if (role === "admin") setView("admin-review");
    else if (role === "worker") setView("worker-task");
    else if (role === "officer") setView("officer-review");
    else setView("citizen-track");
  };

  if (view === "landing") return <><style>{FONT_IMPORT}</style><LandingPage C={C} ui={{ Logo, Btn, Card, CityMap }} priorities={PRIORITIES} onEnter={setView} /></>;
  if (view === "login") return <><style>{FONT_IMPORT}</style><AuthPage C={C} ui={{ Logo, Card, Btn }} onAuth={handleAuth} /></>;

  const navMap = { citizen: CITIZEN_NAV, admin: ADMIN_NAV, worker: WORKER_NAV, officer: OFFICER_NAV };
  const activeTop = view.split("-").slice(0, 2).join("-");

  const openWorkerCompletion = (id) => { setSelectedId(id); setView("worker-complete"); };

  return (
    <div style={{ background: C.bg, minHeight: "100vh" }}>
      <style>{FONT_IMPORT}</style>
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
      <DashboardPage
        role={role}
        view={view}
        activeTop={activeTop}
        notifications={notifications}
        onNavigate={setView}
        onLogout={handleLogout}
        onOpenReport={openReport}
        selectedReport={selectedReport}
        reports={reports}
        citizenName={citizenName}
        workerName={workerName}
        onCitizenSubmit={handleCitizenSubmit}
        onFeedback={handleFeedback}
        onAdminAssign={onAdminAssign}
        onAdminNotify={handleAdminNotify}
        onUpdateReport={updateReport}
        onWorkerComplete={handleWorkerComplete}
        onWorkerCompleteOpen={openWorkerCompletion}
        onOfficerDecision={handleOfficerDecision}
        nav={navMap}
        pages={{ TopNav, SideNav, NotificationsPage, CitizenHome, ReportWizard, CitizenMyReports, CitizenReportDetail, AdminDashboard, AdminAllIssues, AdminMapView, AdminIssueReview, AdminWorkers, AdminAnalytics, AdminHeatmap, WorkerDashboard, WorkerTaskPage, WorkerCompletionUpload, OfficerDashboard, OfficerVerifyDetail }}
      />
    </div>
  );

  return (
    <div style={{ background: C.bg, minHeight: "100vh" }}>
      <style>{FONT_IMPORT}</style>
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}

      {role === "citizen" && (
        <>
          <TopNav role="Citizen" active={view} onNavigate={setView} onLogout={handleLogout} items={CITIZEN_NAV} notifCount={notifications.citizen.length} />
          {view === "citizen-home" && <CitizenHome reports={reports} citizenName={citizenName} onNavigate={setView} onOpenReport={openReport} />}
          {view === "citizen-report" && <ReportWizard onSubmit={handleCitizenSubmit} citizenName={citizenName} />}
          {view === "citizen-myreports" && <CitizenMyReports reports={reports} citizenName={citizenName} onOpenReport={openReport} />}
          {view === "citizen-nearby" && <CitizenHome reports={reports} citizenName={citizenName} onNavigate={setView} onOpenReport={openReport} />}
          {view === "citizen-track" && selectedReport && <CitizenReportDetail report={selectedReport} onFeedback={handleFeedback} />}
          {view === "notifications" && <NotificationsPage notifications={notifications.citizen} />}
        </>
      )}

      {role === "admin" && (
        <>
          <TopNav role="Admin" active={activeTop} onNavigate={setView} onLogout={handleLogout} items={ADMIN_NAV.slice(0, 4)} notifCount={notifications.admin.length} />
          <div className="flex">
            <SideNav items={ADMIN_NAV} active={view} onNavigate={setView} />
            <div className="flex-1">
              {view === "admin-dashboard" && <AdminDashboard reports={reports} onNavigate={setView} onOpenReport={openReport} />}
              {view === "admin-issues" && <AdminAllIssues reports={reports} onOpenReport={openReport} />}
              {view === "admin-map" && <AdminMapView reports={reports} onOpenReport={openReport} />}
              {view === "admin-review" && selectedReport && <AdminIssueReview report={selectedReport} onUpdate={onAdminAssign} notify={handleAdminNotify} />}
              {view === "admin-workers" && <AdminWorkers reports={reports} />}
              {view === "admin-analytics" && <AdminAnalytics reports={reports} />}
              {view === "admin-heatmap" && <AdminHeatmap reports={reports} />}
              {view === "notifications" && <NotificationsPage notifications={notifications.admin} />}
            </div>
          </div>
        </>
      )}

      {role === "worker" && (
        <>
          <TopNav role="Worker" active={view} onNavigate={setView} onLogout={handleLogout} items={WORKER_NAV} notifCount={notifications.worker.length} />
          {view === "worker-tasks" && <WorkerDashboard reports={reports} workerName={workerName} onOpenTask={openReport} />}
          {view === "worker-task" && selectedReport && <WorkerTaskPage report={selectedReport} onUpdate={updateReport} onGoComplete={(id) => { setSelectedId(id); setView("worker-complete"); }} />}
          {view === "worker-complete" && selectedReport && <WorkerCompletionUpload report={selectedReport} onSubmit={handleWorkerComplete} />}
          {view === "notifications" && <NotificationsPage notifications={notifications.worker} />}
        </>
      )}

      {role === "officer" && (
        <>
          <TopNav role="Officer" active={view} onNavigate={setView} onLogout={handleLogout} items={OFFICER_NAV} notifCount={notifications.officer.length} />
          {view === "officer-verify" && <OfficerDashboard reports={reports} onOpenVerify={openReport} />}
          {view === "officer-review" && selectedReport && <OfficerVerifyDetail report={selectedReport} onDecision={handleOfficerDecision} />}
          {view === "notifications" && <NotificationsPage notifications={notifications.officer} />}
        </>
      )}
    </div>
  );
}