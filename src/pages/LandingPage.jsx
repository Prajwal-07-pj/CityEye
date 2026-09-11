import { useMemo } from "react";
import {
  Camera, ClipboardList, Wrench, ShieldCheck, TrendingUp, Plus, Search,
} from "lucide-react";

export default function LandingPage({ C, ui, priorities, onEnter }) {
  const steps = [
    { n: "01", t: "Report", d: "Citizens capture and submit civic problems in under two minutes.", icon: Camera },
    { n: "02", t: "Assign", d: "Administration reviews, prioritizes, and assigns the issue.", icon: ClipboardList },
    { n: "03", t: "Resolve", d: "Field workers receive tasks and complete the work on ground.", icon: Wrench },
    { n: "04", t: "Verify", d: "Officers verify the work using before/after completion evidence.", icon: ShieldCheck },
    { n: "05", t: "Improve", d: "Citizens see the result and give feedback that shapes the city.", icon: TrendingUp },
  ];
  const markers = useMemo(() => Array.from({ length: 14 }).map((_, i) => ({ id: i, x: 10 + Math.random() * 80, y: 10 + Math.random() * 80, priority: priorities[i % 4] })), [priorities]);

  return (
    <div style={{ background: C.bg }}>
      <div className="border-b bg-white" style={{ borderColor: C.border }}>
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <ui.Logo />
          <ui.Btn variant="dark" onClick={() => onEnter("login")}>Sign In</ui.Btn>
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
            <ui.Btn variant="primary" icon={Plus} className="!py-3.5 !px-6" onClick={() => onEnter("login")}>Report a Problem</ui.Btn>
            <ui.Btn variant="outline" icon={Search} className="!py-3.5 !px-6" onClick={() => onEnter("login")}>Track a Report</ui.Btn>
          </div>
          <div className="flex gap-10 mt-10">
            {[['1,248', 'Reports Filed'], ['846', 'Issues Resolved'], ['2.4 Days', 'Avg. Resolution']].map(([value, label]) => (
              <div key={label}><div className="font-display text-2xl" style={{ color: C.navy, fontWeight: 700 }}>{value}</div><div className="text-xs" style={{ color: C.sub }}>{label}</div></div>
            ))}
          </div>
        </div>
        <ui.CityMap markers={markers} height={420} />
      </div>
      <div className="max-w-7xl mx-auto px-6 pb-24">
        <h2 className="font-display text-3xl mb-2" style={{ color: C.navy, fontWeight: 700 }}>How NagarNetra works</h2>
        <p className="mb-10 text-sm" style={{ color: C.sub }}>A closed loop from the first photo to a verified fix.</p>
        <div className="grid md:grid-cols-5 gap-5">
          {steps.map((step) => (
            <ui.Card key={step.n} className="p-5">
              <div className="text-xs font-bold mb-4" style={{ color: C.blue }}>{step.n}</div>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: C.navy }}><step.icon size={18} color="white" /></div>
              <div className="font-semibold mb-1.5" style={{ color: C.ink }}>{step.t}</div>
              <div className="text-xs leading-relaxed" style={{ color: C.sub }}>{step.d}</div>
            </ui.Card>
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
            <div key={role}><div className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: C.blueLight }}>{role}</div><div className="text-sm leading-relaxed text-white/80">{quote}</div></div>
          ))}
        </div>
      </div>
    </div>
  );
}
