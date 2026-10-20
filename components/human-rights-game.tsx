"use client";

import { useEffect, useRef } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp, RotateCcw } from "lucide-react";

const stops: Array<[number, number]> = [
  [0, 15.5], [0, 13.5], [0, 11.5], [0, 9.5], [0, 7.5], [0, 5.5], [0, 3.5], [0, 1.5], [0, -0.5], [0, -2.5], [0, -4.5],
  [0, -6.5], [0, -8.5], [0, -10.5], [0, -12.5], [0, -14.5], [0, -16.2], [2.3, -17.45], [4.65, -16.3], [4.65, -14.1], [4.65, -11.9], [4.65, -9.7], [4.65, -7.5],
];

type GameProps = {
  label: string;
  keys: string;
  moveForward: string;
  moveBack: string;
  turnLeft: string;
  turnRight: string;
  resetLabel: string;
  initialIndex: number;
  onVisit: (index: number) => void;
};

export default function HumanRightsGame({ label, keys, moveForward, moveBack, turnLeft, turnRight, resetLabel, initialIndex, onVisit }: GameProps) {
  const host = useRef<HTMLDivElement>(null);
  const onVisitRef = useRef(onVisit);
  onVisitRef.current = onVisit;
  const latestIndex = useRef(initialIndex);
  latestIndex.current = initialIndex;

  useEffect(() => {
    let cancelled = false;
    const inputEvents = new AbortController();
    let frame = 0;
    let renderer: import("three").WebGLRenderer | undefined;
    let observer: ResizeObserver | undefined;
    let scene: import("three").Scene | undefined;
    let camera: import("three").PerspectiveCamera | undefined;
    const pressed = new Set<string>();
    const obstacles: Array<{ minX: number; maxX: number; minZ: number; maxZ: number }> = [];
    let yaw = initialIndex >= 18 ? Math.PI : 0;
    let pitch = 0;
    let dragPointer: number | null = null;
    let lastX = 0;
    let lastY = 0;
    let lastTime = performance.now();
    let lastVisitCheck = 0;
    let lastVisited = initialIndex;
    let eye = { x: stops[initialIndex][0], y: 1.62, z: stops[initialIndex][1] };

    const init = async () => {
      try {
        const THREE = await import("three");
        const element = host.current;
        if (cancelled || !element) return;

        scene = new THREE.Scene();
        scene.background = new THREE.Color("#d8e0e4");
        scene.fog = new THREE.Fog("#d8e0e4", 27, 48);
        camera = new THREE.PerspectiveCamera(72, 1, 0.08, 100);
        renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        element.appendChild(renderer.domElement);

        scene.add(new THREE.HemisphereLight("#f4f7ff", "#968d7d", 1.45));
        const roomLight = new THREE.DirectionalLight("#fff4dd", 1.7);
        roomLight.position.set(-8, 13, 9);
        roomLight.castShadow = true;
        roomLight.shadow.mapSize.set(1024, 1024);
        scene.add(roomLight);
        scene.add(new THREE.AmbientLight("#ffffff", 0.55));

        const standard = (color: string, roughness = 0.8, metalness = 0) => new THREE.MeshStandardMaterial({ color, roughness, metalness });
        const floorMat = standard("#d7d4ce", 0.95);
        const wallMat = standard("#e8e5de", 0.9);
        const trimMat = standard("#a6a09a", 0.6, 0.25);
        const shelfMat = standard("#493a31", 0.78);
        const spineColors = ["#7c3437", "#36596c", "#527051", "#b18a4c", "#666b73", "#813f27", "#302e32", "#bdab87", "#496d78", "#8b775d"];
        const boxGeo = new THREE.BoxGeometry(1, 1, 1);

        const box = (x: number, y: number, z: number, w: number, h: number, d: number, material: import("three").Material, castShadow = true) => {
          const mesh = new THREE.Mesh(boxGeo, material);
          mesh.position.set(x, y, z);
          mesh.scale.set(w, h, d);
          mesh.castShadow = castShadow;
          mesh.receiveShadow = true;
          scene?.add(mesh);
          return mesh;
        };
        const addObstacle = (x: number, z: number, w: number, d: number) => obstacles.push({ minX: x - w / 2, maxX: x + w / 2, minZ: z - d / 2, maxZ: z + d / 2 });

        box(0, -0.15, 0, 20, 0.3, 38, floorMat, false);
        box(0, 3.8, 0, 20, 0.22, 38, wallMat, false);
        box(-10, 1.9, 0, 0.35, 3.8, 38, wallMat, false);
        box(10, 1.9, 0, 0.35, 3.8, 38, wallMat, false);
        box(0, 1.9, -18.9, 20, 3.8, 0.35, wallMat, false);
        box(-8.25, 1.9, 18.9, 3.5, 3.8, 0.35, wallMat, false);
        box(8.25, 1.9, 18.9, 3.5, 3.8, 0.35, wallMat, false);
        box(0, 3.45, 18.9, 13, 0.7, 0.35, wallMat, false);

        // Entrance-side study tables and low counters, based on the submitted panoramas.
        for (const x of [-6.5, 6.5]) {
          for (const z of [8, 14]) {
            box(x, 0.82, z, 3.0, 0.14, 1.5, standard("#b5a38c"));
            for (const dx of [-1.25, 1.25]) for (const dz of [-0.55, 0.55]) box(x + dx, 0.42, z + dz, 0.08, 0.8, 0.08, trimMat, false);
            addObstacle(x, z, 3.0, 1.5);
            for (const dx of [-1, 1]) {
              box(x + dx, 0.48, z + 1.28, 0.58, 0.12, 0.58, standard("#555d62"));
              box(x + dx, 0.82, z + 1.55, 0.58, 0.62, 0.08, standard("#555d62"));
              addObstacle(x + dx, z + 1.4, 0.66, 0.72);
            }
          }
        }
        box(0, 1.35, 16.8, 5.7, 0.16, 0.42, trimMat);
        box(0, 0.88, 16.8, 5.4, 0.76, 0.3, wallMat);
        box(0, 2.08, 16.8, 4.5, 0.38, 0.12, standard("#59656a"));

        // A few windows and fluorescent ceiling panels suggest the open corridor in the photos.
        for (const z of [3, 8, 13]) {
          box(9.78, 2.15, z, 0.08, 1.75, 3.8, standard("#b7c8cc", 0.24, 0.12), false);
          box(9.68, 2.15, z, 0.06, 1.9, 0.09, trimMat, false);
          box(9.68, 2.15, z - 1.9, 0.06, 1.9, 0.09, trimMat, false);
        }
        for (const z of [14, 7, 0, -8, -14]) {
          box(0, 3.63, z, 3.8, 0.08, 0.72, standard("#fff4d6", 0.35, 0), false);
          const glow = new THREE.Mesh(new THREE.PlaneGeometry(3.25, 0.48), new THREE.MeshBasicMaterial({ color: "#fff8df" }));
          glow.rotation.x = Math.PI / 2;
          glow.position.set(0, 3.575, z);
          scene.add(glow);
        }

        // Shelf rows have real volume and collision. The middle aisle connects the hallway to the stacks.
        const bookMatrices: Array<{ x: number; y: number; z: number; w: number; h: number; color: string }> = [];
        const shelfXs = [-6.9, -2.35, 2.35, 6.9];
        const shelfStart = -5.45;
        const shelfEnd = -16.85;
        const shelfLength = shelfStart - shelfEnd;
        let seed = 321;
        const random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };

        shelfXs.forEach((x, row) => {
          const zMid = (shelfStart + shelfEnd) / 2;
          box(x, 1.35, zMid, 0.16, 2.7, shelfLength, shelfMat);
          addObstacle(x, zMid, 0.9, shelfLength + 0.25);
          for (const side of [-1, 1]) {
            for (let level = 0; level < 5; level++) {
              const y = 0.18 + level * 0.51;
              box(x + side * 0.43, y, zMid, 0.72, 0.065, shelfLength, trimMat, false);
              for (let i = 0; i < 72; i++) {
                const z = shelfStart - 0.18 - i * ((shelfLength - 0.35) / 72);
                const h = 0.34 + random() * 0.11;
                const w = 0.07 + random() * 0.045;
                bookMatrices.push({ x: x + side * 0.4, y: y + 0.04 + h / 2, z, w, h, color: spineColors[Math.floor(random() * spineColors.length)] });
              }
            }
          }
          for (const z of [shelfStart, shelfEnd]) box(x, 1.35, z, 0.88, 2.7, 0.13, shelfMat, false);
          // Row plaques help the space read as a library instead of a generic maze.
          const plaqueCanvas = document.createElement("canvas");
          plaqueCanvas.width = 384; plaqueCanvas.height = 120;
          const g = plaqueCanvas.getContext("2d");
          if (g) { g.fillStyle = "#273b43"; g.fillRect(0, 0, 384, 120); g.fillStyle = "#fff"; g.font = "600 50px sans-serif"; g.textAlign = "center"; g.fillText(`인권자료 ${String.fromCharCode(65 + row)}`, 192, 76); }
          const plaque = new THREE.Mesh(new THREE.PlaneGeometry(1.65, 0.5), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(plaqueCanvas) }));
          plaque.position.set(x + 0.52, 2.45, -7.2);
          plaque.rotation.y = sideFacing(x);
          scene?.add(plaque);
        });

        const bookGeo = new THREE.BoxGeometry(1, 1, 1);
        const bookMesh = new THREE.InstancedMesh(bookGeo, standard("#ffffff", 0.85), bookMatrices.length);
        const matrix = new THREE.Matrix4();
        const quaternion = new THREE.Quaternion();
        bookMatrices.forEach((b, i) => {
          matrix.compose(new THREE.Vector3(b.x, b.y, b.z), quaternion, new THREE.Vector3(0.39, b.h, b.w));
          bookMesh.setMatrixAt(i, matrix);
          bookMesh.setColorAt(i, new THREE.Color(b.color));
        });
        bookMesh.instanceMatrix.needsUpdate = true;
        if (bookMesh.instanceColor) bookMesh.instanceColor.needsUpdate = true;
        bookMesh.castShadow = true;
        scene.add(bookMesh);

        // Start/end route lanterns and small wayfinding signs.
        const sign = (text: string, x: number, y: number, z: number) => {
          const c = document.createElement("canvas"); c.width = 640; c.height = 128;
          const g = c.getContext("2d");
          if (g) { g.fillStyle = "#17252b"; g.fillRect(0, 0, c.width, c.height); g.fillStyle = "#ffffff"; g.font = "600 46px sans-serif"; g.textAlign = "center"; g.fillText(text, 320, 82); }
          const mesh = new THREE.Mesh(new THREE.PlaneGeometry(3.0, 0.6), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c) }));
          mesh.position.set(x, y, z); scene?.add(mesh);
        };
        sign("인권자료실 · HUMAN RIGHTS", 0, 3.05, -4.7);
        sign("통로 끝에서 서가로 이어집니다", 0, 2.9, 17.9);

        const canOccupy = (x: number, z: number) => {
          const radius = 0.28;
          if (x < -9.45 || x > 9.45 || z < -18.25 || z > 18.2) return false;
          return !obstacles.some((o) => x + radius > o.minX && x - radius < o.maxX && z + radius > o.minZ && z - radius < o.maxZ);
        };
        const applyLook = () => {
          if (!camera) return;
          const cp = Math.cos(pitch);
          camera.position.set(eye.x, eye.y, eye.z);
          camera.lookAt(eye.x + Math.sin(yaw) * cp, eye.y + Math.sin(pitch), eye.z - Math.cos(yaw) * cp);
        };
        const onPointerDown = (event: PointerEvent) => {
          if (!renderer?.domElement) return;
          element.focus({ preventScroll: true });
          dragPointer = event.pointerId; lastX = event.clientX; lastY = event.clientY;
          renderer.domElement.setPointerCapture(event.pointerId);
        };
        const onPointerMove = (event: PointerEvent) => {
          if (dragPointer !== event.pointerId) return;
          yaw -= (event.clientX - lastX) * 0.0045;
          pitch = Math.max(-0.8, Math.min(0.8, pitch + (event.clientY - lastY) * 0.004));
          lastX = event.clientX; lastY = event.clientY;
          applyLook();
        };
        const onPointerUp = (event: PointerEvent) => { if (dragPointer === event.pointerId) dragPointer = null; };
        const keyName = (key: string) => key.toLowerCase();
        const onKeyDown = (event: KeyboardEvent) => {
          const key = keyName(event.key);
          if (key === "home") { eye = { x: stops[initialIndex][0], y: 1.62, z: stops[initialIndex][1] }; yaw = initialIndex >= 18 ? Math.PI : 0; pitch = 0; applyLook(); return; }
          if (["w", "a", "s", "d", "arrowup", "arrowdown", "arrowleft", "arrowright"].includes(key)) { event.preventDefault(); pressed.add(key); }
        };
        const onKeyUp = (event: KeyboardEvent) => pressed.delete(keyName(event.key));
        const onBlur = () => pressed.clear();
        const resize = () => {
          if (!host.current || !renderer || !camera) return;
          const width = host.current.clientWidth;
          const height = host.current.clientHeight;
          renderer.setSize(width, height, false);
          camera.aspect = width / Math.max(height, 1);
          camera.updateProjectionMatrix();
        };
        renderer.domElement.addEventListener("pointerdown", onPointerDown);
        renderer.domElement.addEventListener("pointermove", onPointerMove);
        renderer.domElement.addEventListener("pointerup", onPointerUp);
        renderer.domElement.addEventListener("pointercancel", onPointerUp);
        element.addEventListener("keydown", onKeyDown);
        window.addEventListener("keyup", onKeyUp, { signal: inputEvents.signal });
        window.addEventListener("blur", onBlur, { signal: inputEvents.signal });
        observer = new ResizeObserver(resize); observer.observe(element); resize();
        applyLook();

        const tick = (now: number) => {
          if (cancelled || !renderer || !scene || !camera) return;
          frame = requestAnimationFrame(tick);
          const dt = Math.min(0.05, Math.max(0, (now - lastTime) / 1000));
          lastTime = now;
          const turnRate = 1.8 * dt;
          if (pressed.has("arrowleft")) yaw += turnRate;
          if (pressed.has("arrowright")) yaw -= turnRate;
          let forward = Number(pressed.has("w") || pressed.has("arrowup")) - Number(pressed.has("s") || pressed.has("arrowdown"));
          let strafe = Number(pressed.has("d")) - Number(pressed.has("a"));
          const length = Math.hypot(forward, strafe) || 1;
          forward /= length; strafe /= length;
          const speed = 3.2 * dt;
          const dx = (Math.sin(yaw) * forward + Math.cos(yaw) * strafe) * speed;
          const dz = (-Math.cos(yaw) * forward + Math.sin(yaw) * strafe) * speed;
          if (canOccupy(eye.x + dx, eye.z)) eye.x += dx;
          if (canOccupy(eye.x, eye.z + dz)) eye.z += dz;
          applyLook();
          if (now - lastVisitCheck > 220) {
            lastVisitCheck = now;
            let best = -1; let bestDistance = 1.45;
            stops.forEach(([x, z], index) => { const d = Math.hypot(eye.x - x, eye.z - z); if (d < bestDistance) { best = index; bestDistance = d; } });
            if (best >= 0 && best !== lastVisited) { lastVisited = best; onVisitRef.current(best); }
          }
          renderer.render(scene, camera);
        };
        lastTime = performance.now();
        tick(lastTime);
      } catch {
        // Keep the fallback accessible if WebGL is unavailable.
      }
    };

    void init();
    return () => {
      cancelled = true;
      inputEvents.abort();
      cancelAnimationFrame(frame);
      observer?.disconnect();
      pressed.clear();
      scene?.traverse((object) => {
        const resource = object as unknown as { geometry?: { dispose: () => void }; material?: import("three").Material | import("three").Material[] };
        resource.geometry?.dispose();
        const materials = Array.isArray(resource.material) ? resource.material : resource.material ? [resource.material] : [];
        materials.forEach((material) => { (material as import("three").MeshBasicMaterial).map?.dispose(); material.dispose(); });
      });
      renderer?.dispose();
      if (renderer?.domElement.parentElement) renderer.domElement.parentElement.removeChild(renderer.domElement);
    };
    // Scene is mounted when switching into 3D mode; its starting location is the selected photo point.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const press = (key: string) => (event: ReactPointerEvent<HTMLButtonElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    host.current?.focus({ preventScroll: true });
    // The key is passed to the scene as a synthetic keyboard movement.
    const down = new KeyboardEvent("keydown", { key, bubbles: true });
    host.current?.dispatchEvent(down);
  };
  const release = (key: string) => () => host.current?.dispatchEvent(new KeyboardEvent("keyup", { key, bubbles: true }));

  return (
    <div className="hr-panorama-stage hr-game-stage" ref={host} tabIndex={0} aria-label={label}>
      <span className="hr-viewer-label"><span className="hr-game-dot" /> 3D · {label}</span>
      <span className="hr-viewer-help">{keys}</span>
      <div className="hr-game-controls" aria-label={label}>
        <button type="button" aria-label={turnLeft} title={turnLeft} onPointerDown={press("ArrowLeft")} onPointerUp={release("ArrowLeft")} onPointerCancel={release("ArrowLeft")} onLostPointerCapture={release("ArrowLeft")}><ChevronLeft size={17} /></button>
        <button type="button" aria-label={moveBack} title={moveBack} onPointerDown={press("s")} onPointerUp={release("s")} onPointerCancel={release("s")} onLostPointerCapture={release("s")}><ChevronDown size={17} /></button>
        <button type="button" className="hr-game-forward" aria-label={moveForward} title={moveForward} onPointerDown={press("w")} onPointerUp={release("w")} onPointerCancel={release("w")} onLostPointerCapture={release("w")}><ChevronUp size={19} /></button>
        <button type="button" aria-label={turnRight} title={turnRight} onPointerDown={press("ArrowRight")} onPointerUp={release("ArrowRight")} onPointerCancel={release("ArrowRight")} onLostPointerCapture={release("ArrowRight")}><ChevronRight size={17} /></button>
        <button type="button" className="hr-game-reset" aria-label={resetLabel} title={resetLabel} onClick={() => { host.current?.focus({ preventScroll: true }); host.current?.dispatchEvent(new KeyboardEvent("keydown", { key: "Home", bubbles: true })); }}><RotateCcw size={15} /></button>
      </div>
    </div>
  );
}

function sideFacing(x: number) {
  return x < 0 ? -Math.PI / 2 : Math.PI / 2;
}
