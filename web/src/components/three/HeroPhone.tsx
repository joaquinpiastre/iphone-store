"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Float, Lightformer, RoundedBox } from "@react-three/drei";

const W = 1;
const H = 2.05;
const D = 0.11;

function roundedRectShape(w: number, h: number, r: number) {
  const s = new THREE.Shape();
  const x = -w / 2;
  const y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return s;
}

function makeScreenTexture() {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 1050;
  const g = c.getContext("2d")!;
  const bg = g.createLinearGradient(0, 0, 512, 1050);
  bg.addColorStop(0, "#0b1b4d");
  bg.addColorStop(0.55, "#2b1670");
  bg.addColorStop(1, "#050510");
  g.fillStyle = bg;
  g.fillRect(0, 0, 512, 1050);
  const glow = g.createRadialGradient(380, 300, 10, 380, 300, 380);
  glow.addColorStop(0, "rgba(140,110,255,0.65)");
  glow.addColorStop(1, "rgba(140,110,255,0)");
  g.fillStyle = glow;
  g.fillRect(0, 0, 512, 1050);
  g.fillStyle = "rgba(255,255,255,0.92)";
  g.textAlign = "center";
  g.font = "600 150px system-ui, sans-serif";
  g.fillText("9:41", 256, 330);
  g.font = "400 34px system-ui, sans-serif";
  g.fillStyle = "rgba(255,255,255,0.65)";
  g.fillText("Martes 14 de octubre", 256, 385);
  // isla dinámica
  g.fillStyle = "#000";
  g.beginPath();
  g.roundRect(196, 28, 120, 36, 18);
  g.fill();
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

function Phone({ active }: { active: boolean }) {
  const group = useRef<THREE.Group>(null);
  const screenGeo = useMemo(() => new THREE.ShapeGeometry(roundedRectShape(W - 0.07, H - 0.07, 0.115), 24), []);
  const screenTex = useMemo(() => {
    const t = makeScreenTexture();
    t.repeat.set(1 / (W - 0.07), 1 / (H - 0.07));
    t.offset.set(0.5, 0.5);
    return t;
  }, []);

  const titanium = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#8d8a83", metalness: 1, roughness: 0.28 }),
    [],
  );
  const glassDark = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#05060a", metalness: 0.6, roughness: 0.08 }),
    [],
  );

  useEffect(() => {
    return () => {
      screenGeo.dispose();
      screenTex.dispose();
      titanium.dispose();
      glassDark.dispose();
    };
  }, [screenGeo, screenTex, titanium, glassDark]);

  useFrame((state) => {
    const g = group.current;
    if (!g || !active) return;
    const t = state.clock.elapsedTime;
    const scroll = Math.min(window.scrollY / window.innerHeight, 1.5);
    const targetY = -0.45 + Math.sin(t * 0.35) * 0.18 + state.pointer.x * 0.55 + scroll * Math.PI * 0.9;
    const targetX = -state.pointer.y * 0.3 + scroll * 0.15;
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, targetY, 3.5, 1 / 60);
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, targetX, 3.5, 1 / 60);
  });

  const lens: [number, number][] = [
    [-0.27, 0.75],
    [-0.27, 0.45],
    [0.0, 0.6],
  ];

  return (
    <group ref={group} rotation={[0, -0.45, 0]}>
      <RoundedBox args={[W, H, D]} radius={0.15} smoothness={6} material={titanium} />
      {/* pantalla */}
      <mesh geometry={screenGeo} position={[0, 0, D / 2 + 0.002]}>
        <meshBasicMaterial map={screenTex} toneMapped={false} />
      </mesh>
      {/* isla de cámaras (parte trasera) */}
      <group position={[0, 0, -D / 2 - 0.004]} rotation={[0, Math.PI, 0]}>
        <RoundedBox args={[0.5, 0.55, 0.02]} radius={0.09} smoothness={5} position={[0.2, 0.65, 0]}>
          <meshStandardMaterial color="#9a978f" metalness={1} roughness={0.18} />
        </RoundedBox>
        {lens.map(([x, y], i) => (
          <group key={i} position={[x + 0.4, y + 0.05, 0.02]}>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.085, 0.085, 0.03, 32]} />
              <meshStandardMaterial color="#c9c6be" metalness={1} roughness={0.15} />
            </mesh>
            <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.012]}>
              <cylinderGeometry args={[0.062, 0.062, 0.02, 32]} />
              <primitive object={glassDark} attach="material" />
            </mesh>
          </group>
        ))}
        <mesh position={[0.45, 0.82, 0.02]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.025, 0.025, 0.02, 16]} />
          <meshStandardMaterial color="#f3e9c6" emissive="#f3e9c6" emissiveIntensity={0.4} />
        </mesh>
      </group>
      {/* botones laterales */}
      <mesh position={[W / 2 + 0.006, 0.45, 0]}>
        <boxGeometry args={[0.02, 0.28, 0.05]} />
        <primitive object={titanium} attach="material" />
      </mesh>
      <mesh position={[-W / 2 - 0.006, 0.55, 0]}>
        <boxGeometry args={[0.02, 0.14, 0.05]} />
        <primitive object={titanium} attach="material" />
      </mesh>
      <mesh position={[-W / 2 - 0.006, 0.3, 0]}>
        <boxGeometry args={[0.02, 0.2, 0.05]} />
        <primitive object={titanium} attach="material" />
      </mesh>
    </group>
  );
}

export default function HeroPhone({ active = true }: { active?: boolean }) {
  return (
    <Canvas
      dpr={[1, 1.75]}
      frameloop={active ? "always" : "demand"}
      camera={{ position: [0, 0, 5], fov: 32 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
    >
      <ambientLight intensity={0.25} />
      <directionalLight position={[3, 4, 5]} intensity={1.6} color="#cfd8ff" />
      <directionalLight position={[-4, -2, 3]} intensity={1.1} color="#7a5cff" />
      <Environment resolution={256}>
        <Lightformer form="rect" intensity={4} position={[0, 5, -3]} scale={[10, 2, 1]} />
        <Lightformer form="rect" intensity={2.5} position={[-5, 1, 2]} rotation-y={Math.PI / 2} scale={[6, 4, 1]} />
        <Lightformer form="rect" intensity={2} position={[5, -1, 2]} rotation-y={-Math.PI / 2} scale={[6, 4, 1]} />
      </Environment>
      <Float speed={1.4} rotationIntensity={0.15} floatIntensity={0.6}>
        <Phone active={active} />
      </Float>
    </Canvas>
  );
}
