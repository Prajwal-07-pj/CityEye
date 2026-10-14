import { useEffect, useRef } from "react";
import * as THREE from "three";

const rng = (seed) => {
  let a = seed;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};
const clamp01 = (v) => Math.min(1, Math.max(0, v));

export default function CityScene3D() {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const small = window.matchMedia("(max-width: 760px)").matches;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: !small, alpha: true, powerPreference: "high-performance" });
    } catch (err) {
      console.warn("WebGL unavailable, skipping the 3D scene.", err);
      return undefined;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, small ? 1.5 : 2));
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    const disposables = [];
    const track = (o) => { disposables.push(o); return o; };

    /* ---------- scene, camera, lights ---------- */
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050f0b, 0.032);
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 200);
    const baseCam = new THREE.Vector3(0, 15, 22);
    const world = new THREE.Group();
    scene.add(world);

    scene.add(new THREE.AmbientLight(0x6fd6b4, 0.7));
    const key = new THREE.DirectionalLight(0xbfffe8, 1.4);
    key.position.set(-8, 16, 10);
    scene.add(key);
    const warm = new THREE.PointLight(0xd8b56e, 90, 45);
    warm.position.set(7, 7, -4);
    scene.add(warm);

    /* ---------- ground ---------- */
    const grid = new THREE.GridHelper(44, 44, 0x1fd6a0, 0x0f5c44);
    grid.material.transparent = true;
    grid.material.opacity = 0.22;
    track(grid.geometry); track(grid.material);
    world.add(grid);

    const baseGeo = track(new THREE.CircleGeometry(16, 72));
    const baseMat = track(new THREE.MeshBasicMaterial({ color: 0x0a2a20, transparent: true, opacity: 0.55 }));
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.rotation.x = -Math.PI / 2;
    base.position.y = -0.02;
    world.add(base);

    /* ---------- buildings ---------- */
    const unit = track(new THREE.BoxGeometry(1, 1, 1));
    const edges = track(new THREE.EdgesGeometry(unit));
    const bodyMat = track(new THREE.MeshStandardMaterial({ color: 0x0c2a21, metalness: 0.65, roughness: 0.32, emissive: 0x03140f }));
    const hubMat = track(new THREE.MeshStandardMaterial({ color: 0x0f3a2d, metalness: 0.7, roughness: 0.25, emissive: 0x0f7a58, emissiveIntensity: 0.55 }));
    const emEdge = track(new THREE.LineBasicMaterial({ color: 0x1fd6a0, transparent: true, opacity: 0.5 }));
    const goldEdge = track(new THREE.LineBasicMaterial({ color: 0xd8b56e, transparent: true, opacity: 0.95 }));

    const rand = rng(7);
    const buildings = [];
    const addBuilding = (x, z, w, d, h, delay, hub = false) => {
      const g = new THREE.Group();
      const mesh = new THREE.Mesh(unit, hub ? hubMat : bodyMat);
      const lines = new THREE.LineSegments(edges, hub ? goldEdge : emEdge);
      g.add(mesh, lines);
      g.scale.set(w, 0.001, d);
      g.position.set(x, 0, z);
      world.add(g);
      buildings.push({ g, h, delay });
    };

    const N = small ? 3 : 4;
    const CELL = 2;
    for (let i = -N; i <= N; i += 1) {
      for (let j = -N; j <= N; j += 1) {
        if (Math.abs(i) % 3 === 0 || Math.abs(j) % 3 === 0) continue; // roads
        const dist = Math.hypot(i, j);
        const h = 0.6 + rand() * 1.7 + Math.max(0, 4 - dist) * 0.4;
        addBuilding(i * CELL + (rand() - 0.5) * 0.2, j * CELL + (rand() - 0.5) * 0.2, 1.1 + rand() * 0.5, 1.1 + rand() * 0.5, h, dist * 0.09);
      }
    }
    addBuilding(0, 0, 1.15, 1.15, 6.2, 0.1, true); // the "CityEye" hub tower

    const ringGeo = track(new THREE.TorusGeometry(1.35, 0.03, 12, 90));
    const goldBasic = track(new THREE.MeshBasicMaterial({ color: 0xd8b56e }));
    const emBasic = track(new THREE.MeshBasicMaterial({ color: 0x1fd6a0 }));
    const ringA = new THREE.Mesh(ringGeo, goldBasic);
    const ringB = new THREE.Mesh(ringGeo, emBasic);
    ringB.scale.setScalar(0.7);
    const halo = new THREE.Group();
    halo.add(ringA, ringB);
    halo.position.set(0, 6.9, 0);
    halo.rotation.x = Math.PI / 2.4;
    world.add(halo);

    const beamMat = track(new THREE.MeshBasicMaterial({ color: 0x1fd6a0, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false }));
    const hubBeam = new THREE.Mesh(track(new THREE.CylinderGeometry(0.05, 0.05, 9, 8, 1, true)), beamMat);
    hubBeam.position.y = 10.5;
    world.add(hubBeam);

    /* ---------- issue pins ---------- */
    const pinSpots = [[-6, -6, 0xe5484d], [6, -6, 0xf5a524], [-6, 6, 0x12a150], [6, 6, 0xe5484d], [0, -6, 0xf5a524], [-6, 0, 0x12a150]];
    const pinRing = track(new THREE.RingGeometry(0.25, 0.33, 48));
    const pinBeam = track(new THREE.CylinderGeometry(0.03, 0.03, 3.2, 8, 1, true));
    const pinHead = track(new THREE.SphereGeometry(0.2, 18, 18));
    const pins = pinSpots.map(([x, z, color], i) => {
      const group = new THREE.Group();
      const rMat = track(new THREE.MeshBasicMaterial({ color, transparent: true, side: THREE.DoubleSide, depthWrite: false }));
      const bMat = track(new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.45, blending: THREE.AdditiveBlending, depthWrite: false }));
      const hMat = track(new THREE.MeshBasicMaterial({ color }));
      const ring = new THREE.Mesh(pinRing, rMat);
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = 0.03;
      const beam = new THREE.Mesh(pinBeam, bMat);
      beam.position.y = 1.6;
      const head = new THREE.Mesh(pinHead, hMat);
      head.position.y = 3.3;
      group.add(ring, beam, head);
      group.position.set(x, 0, z);
      group.scale.setScalar(0.001);
      world.add(group);
      return { group, ring, head, phase: i * 0.37 };
    });

    /* ---------- field worker route ---------- */
    const route = [[-9, 0], [0, 0], [0, 6], [6, 6]].map(([x, z]) => new THREE.Vector3(x, 0.07, z));
    const routeGeo = track(new THREE.BufferGeometry().setFromPoints(route));
    const routeMat = track(new THREE.LineBasicMaterial({ color: 0xd8b56e, transparent: true, opacity: 0.9 }));
    world.add(new THREE.Line(routeGeo, routeMat));
    const segLens = route.slice(1).map((p, k) => p.distanceTo(route[k]));
    const routeLen = segLens.reduce((a, b) => a + b, 0);
    const pointAt = (u, out) => {
      let d = u * routeLen;
      for (let k = 0; k < segLens.length; k += 1) {
        if (d <= segLens[k]) return out.copy(route[k]).lerp(route[k + 1], d / segLens[k]);
        d -= segLens[k];
      }
      return out.copy(route[route.length - 1]);
    };
    const worker = new THREE.Mesh(track(new THREE.SphereGeometry(0.17, 16, 16)), goldBasic);
    const workerGlow = new THREE.Mesh(
      track(new THREE.SphereGeometry(0.17, 16, 16)),
      track(new THREE.MeshBasicMaterial({ color: 0xf3dfa8, transparent: true, opacity: 0.25, blending: THREE.AdditiveBlending, depthWrite: false }))
    );
    workerGlow.scale.setScalar(2.6);
    world.add(worker, workerGlow);

    /* ---------- gold dust ---------- */
    const COUNT = small ? 120 : 260;
    const dust = new Float32Array(COUNT * 3);
    const dustSpeed = new Float32Array(COUNT);
    for (let k = 0; k < COUNT; k += 1) {
      dust[k * 3] = (rand() - 0.5) * 30;
      dust[k * 3 + 1] = rand() * 10;
      dust[k * 3 + 2] = (rand() - 0.5) * 30;
      dustSpeed[k] = 0.15 + rand() * 0.35;
    }
    const dustGeo = track(new THREE.BufferGeometry());
    dustGeo.setAttribute("position", new THREE.BufferAttribute(dust, 3));
    const dustMat = track(new THREE.PointsMaterial({ color: 0xf3dfa8, size: 0.06, transparent: true, opacity: 0.7, blending: THREE.AdditiveBlending, depthWrite: false }));
    world.add(new THREE.Points(dustGeo, dustMat));

    /* ---------- interaction ---------- */
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    const onPointer = (e) => {
      mouse.tx = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.ty = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onPointer, { passive: true });

    /* ---------- render ---------- */
    const tmp = new THREE.Vector3();
    const render = (t) => {
      mouse.x += (mouse.tx - mouse.x) * 0.05;
      mouse.y += (mouse.ty - mouse.y) * 0.05;

      buildings.forEach((b) => {
        const l = clamp01((t - 0.35 - b.delay) / 1.2);
        const s = Math.max(0.001, b.h * (1 - (1 - l) ** 3));
        b.g.scale.y = s;
        b.g.position.y = s / 2;
      });

      pins.forEach((p, i) => {
        const on = clamp01((t - 1.7 - i * 0.14) / 0.7);
        p.group.scale.setScalar(Math.max(0.001, on));
        const ph = (t * 0.9 + p.phase) % 1;
        p.ring.scale.setScalar(1 + ph * 3.4);
        p.ring.material.opacity = (1 - ph) * 0.9;
        p.head.position.y = 3.3 + Math.sin(t * 2 + p.phase * 6) * 0.12;
      });

      halo.rotation.z = t * 0.6;
      halo.position.y = 6.9 + Math.sin(t * 1.2) * 0.1;
      hubBeam.material.opacity = 0.25 + Math.sin(t * 2) * 0.08;

      pointAt((t * 0.06) % 1, tmp);
      worker.position.copy(tmp);
      workerGlow.position.copy(tmp);

      const arr = dustGeo.attributes.position.array;
      for (let k = 0; k < COUNT; k += 1) {
        arr[k * 3 + 1] += dustSpeed[k] * 0.012;
        if (arr[k * 3 + 1] > 10) arr[k * 3 + 1] = 0;
      }
      dustGeo.attributes.position.needsUpdate = true;

      world.rotation.y = Math.sin(t * 0.12) * 0.28 + mouse.x * 0.34;
      camera.position.set(baseCam.x, baseCam.y - mouse.y * 1.6, baseCam.z);
      camera.lookAt(0, 1, 0);
      renderer.render(scene, camera);
    };

    const resize = () => {
      const w = mount.clientWidth || 1;
      const h = mount.clientHeight || 1;
      const aspect = w / h;
      renderer.setSize(w, h, false);
      camera.aspect = aspect;
      camera.updateProjectionMatrix();
      const k = aspect < 1.15 ? Math.min(1.9, 1.15 / aspect) : 1;
      baseCam.set(0, 15 * k, 22 * k);
      world.position.x = aspect > 1.3 ? 4.6 : 0;
      if (reduced) render(10);
    };
    const ro = new ResizeObserver(resize);
    ro.observe(mount);
    resize();

    let raf = 0;
    let running = false;
    let inView = true;
    let t = 0;
    let last = performance.now();
    const loop = (now) => {
      raf = requestAnimationFrame(loop);
      t += Math.min(0.05, (now - last) / 1000);
      last = now;
      render(t);
    };
    const start = () => {
      if (running || reduced) return;
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    const io = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      if (inView && !document.hidden) start(); else stop();
    });
    io.observe(mount);
    const onVisibility = () => (document.hidden ? stop() : inView && start());
    document.addEventListener("visibilitychange", onVisibility);

    if (reduced) render(10); else render(0);
    requestAnimationFrame(() => mount.classList.add("is-ready"));
    start();

    return () => {
      stop();
      io.disconnect();
      ro.disconnect();
      window.removeEventListener("pointermove", onPointer);
      document.removeEventListener("visibilitychange", onVisibility);
      disposables.forEach((d) => d.dispose && d.dispose());
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} className="cel-canvas" aria-hidden="true" />;
}