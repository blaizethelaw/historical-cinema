"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars, Text as DreiText, Environment, Html, MeshDistortMaterial } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette, Noise, SMAA } from "@react-three/postprocessing";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Play, Pause, SkipBack, SkipForward, Volume2, Languages, Sparkles, Theater } from "lucide-react";

export type EnvName =
  | "space"
  | "desert"
  | "sea"
  | "forest"
  | "city"
  | "tundra"
  | "interior"
  | "mountain"
  | "ceremonial"
  | "battlefield";

export type CameraStyle =
  | "dolly-in"
  | "crane-up"
  | "orbit-slow"
  | "handheld"
  | "locked-off"
  | "push-pull";

export interface Scene {
  title: string;
  timePeriod: string;
  location: string;
  oneLine: string;
  narration: string;
  visualKeywords: string[];
  palette: string[];
  environment: EnvName;
  cameraStyle: CameraStyle;
}

export type Locale = "en-US" | "es-ES";

const T: Record<Locale, {
  appTitle: string; appDescription: string; eventPlaceholder: string; beginButton: string; loadingText: string; of: string; returnButton: string; suggestedEventsTitle: string; worldWarII: string; ancientEgypt: string; moonLanding: string; autoplay: string; narration: string; quality: string;
}> = {
  "en-US": {
    appTitle: "🏛️ Historical 3D Amphitheater",
    appDescription:
      "Enter an event and watch iconic moments unfold as immersive 3D dioramas with narration and cinematic effects.",
    eventPlaceholder: "Enter historical event…",
    beginButton: "Begin the chronicle",
    loadingText: "Staging scene",
    of: "of",
    returnButton: "Return",
    suggestedEventsTitle: "Notable events to explore:",
    worldWarII: "World War II",
    ancientEgypt: "Ancient Egypt",
    moonLanding: "Moon Landing",
    autoplay: "Autoplay",
    narration: "Narration",
    quality: "Quality",
  },
  "es-ES": {
    appTitle: "🏛️ Anfiteatro 3D Histórico",
    appDescription:
      "Ingresa un evento y mira cómo se desarrollan momentos icónicos como dioramas 3D inmersivos con narración y efectos cinematográficos.",
    eventPlaceholder: "Ingresa evento histórico…",
    beginButton: "Comenzar la crónica",
    loadingText: "Preparando escena",
    of: "de",
    returnButton: "Regresar",
    suggestedEventsTitle: "Eventos notables para explorar:",
    worldWarII: "Segunda Guerra Mundial",
    ancientEgypt: "Antiguo Egipto",
    moonLanding: "Alunizaje",
    autoplay: "Auto-reproducir",
    narration: "Narración",
    quality: "Calidad",
  },
};

export const SCENE_PROMPT_TEMPLATE: string = `You are a historical dramaturg and cinematic director.
Given a historical event, produce 3 to 5 sequential scenes as JSON.
Each scene must include: {title, timePeriod, location, oneLine, narration, visualKeywords, palette, environment, cameraStyle}.
The visualKeywords should be concrete objects (e.g., pyramid, torchlight, moon dust, flags, uniforms), not abstract words.
The environment is one of: [space, desert, sea, forest, city, tundra, interior, mountain, ceremonial, battlefield].
The cameraStyle is one of: [dolly-in, crane-up, orbit-slow, handheld, locked-off, push-pull].
Keep narration to 1–3 vivid sentences with sensory detail. Use simple, declarative language.`;

function generateScenesLocally(eventName: string): Scene[] {
  const e = (eventName || "").trim().toLowerCase();
  if (e.includes("moon") || e.includes("apollo")) {
    return [
      {
        title: "Trans-Earth Injection",
        timePeriod: "July 1969",
        location: "Low lunar orbit",
        oneLine: "Command Module arcs behind a silent crescent.",
        narration:
          "The spacecraft glides over a silver limb as starlight needles the void. Radio static crackles like distant surf.",
        visualKeywords: ["crescent moon", "command module", "starfield", "dark space"],
        palette: ["#0b1220", "#d0d6e8", "#8aa2ff", "#ffffff"],
        environment: "space",
        cameraStyle: "orbit-slow",
      },
      {
        title: "The Eagle Descends",
        timePeriod: "July 20, 1969",
        location: "Mare Tranquillitatis",
        oneLine: "LM kicks up plumes as it hovers.",
        narration:
          "Dust blooms like slow-moving fog. Engines hiss against the emptiness, and the surface crawls closer.",
        visualKeywords: ["lunar module", "dust plume", "surface craters", "harsh light"],
        palette: ["#0b1220", "#c2b280", "#e0e0e0", "#ffffff"],
        environment: "space",
        cameraStyle: "dolly-in",
      },
      {
        title: "Footprints",
        timePeriod: "July 20, 1969",
        location: "Tranquility Base",
        oneLine: "Boot prints stitch the regolith.",
        narration:
          "A boot presses down and the gray soil keeps its memory. The flag stiffens and winks in the sun.",
        visualKeywords: ["footprints", "American flag", "lander legs", "sun glare"],
        palette: ["#1a1f2b", "#9a9a9a", "#d9d9d9", "#ff2e2e"],
        environment: "space",
        cameraStyle: "locked-off",
      },
    ];
  }
  if (e.includes("egypt")) {
    return [
      {
        title: "Rising of the Pyramids",
        timePeriod: "c. 2560 BCE",
        location: "Giza Plateau",
        oneLine: "Cut stones glow under copper sun.",
        narration:
          "Sand breathes heat. Ropes sing as blocks climb ramps; a thousand hands move in practiced rhythm.",
        visualKeywords: ["pyramid", "ramp", "workers", "sand haze"],
        palette: ["#a26a2b", "#f2d3a2", "#6e4b1f", "#ffffff"],
        environment: "desert",
        cameraStyle: "crane-up",
      },
      {
        title: "Torchlit Corridor",
        timePeriod: "Old Kingdom",
        location: "Inner passage",
        oneLine: "Hieroglyphs flicker alive.",
        narration:
          "Flame halos dance along carved gods. The air tastes like stone and resin.",
        visualKeywords: ["torch", "hieroglyphs", "narrow hallway", "smoke"],
        palette: ["#140c06", "#f7a531", "#8c5a12", "#e7e2d1"],
        environment: "interior",
        cameraStyle: "dolly-in",
      },
      {
        title: "Solar Barge",
        timePeriod: "Mythic time",
        location: "Nile mirage",
        oneLine: "A royal barge slides across gold.",
        narration:
          "River murmurs under reeds. Drums mark a steady heartbeat as sunlight scatters on ripples.",
        visualKeywords: ["barge", "reeds", "sun glitter", "oars"],
        palette: ["#184c45", "#efe3b0", "#b8882d", "#0b132b"],
        environment: "sea",
        cameraStyle: "orbit-slow",
      },
    ];
  }
  if (e.includes("world war") || e.includes("wwii") || e.includes("ww2")) {
    return [
      {
        title: "Storming the Beach",
        timePeriod: "June 6, 1944",
        location: "Normandy",
        oneLine: "Gray surf meets steel and grit.",
        narration:
          "Engines roar, then sudden shallows. The ramp slams; boots churn water and sand under a sky of smoke.",
        visualKeywords: ["landing craft", "barriers", "smoke", "waves"],
        palette: ["#2e3a45", "#9aa4ad", "#c9d1d5", "#2b2b2b"],
        environment: "sea",
        cameraStyle: "handheld",
      },
      {
        title: "City in Blackout",
        timePeriod: "1940",
        location: "London",
        oneLine: "Sirens over dark rooftops.",
        narration:
          "Windows go blind as the sky pulses with searchlights. The ground hums with distant thunder.",
        visualKeywords: ["searchlights", "rooftops", "sirens", "sandbags"],
        palette: ["#0b0f1a", "#e5e7eb", "#6b7280", "#111827"],
        environment: "city",
        cameraStyle: "orbit-slow",
      },
      {
        title: "The Signatures",
        timePeriod: "1945",
        location: "Aboard the USS Missouri",
        oneLine: "Pens press history into paper.",
        narration:
          "Coats rustle, cameras click, and the war finally exhales. Ink dries like a sunrise.",
        visualKeywords: ["table", "documents", "medals", "flags"],
        palette: ["#1f2937", "#9ca3af", "#d1d5db", "#e5e7eb"],
        environment: "interior",
        cameraStyle: "locked-off",
      },
    ];
  }
  return [
    {
      title: `Prologue of ${eventName}`,
      timePeriod: "",
      location: "",
      oneLine: "A hush before history moves.",
      narration:
        "Crowds gather at the edge of change. Air tightens, breaths sync, and the first step arrives.",
      visualKeywords: ["crowd", "banners", "wide plaza", "dawn light"],
      palette: ["#0a0a0a", "#dddddd", "#9c27b0", "#00bcd4"],
      environment: "city",
      cameraStyle: "dolly-in",
    },
    {
      title: `Turning Point of ${eventName}`,
      timePeriod: "",
      location: "",
      oneLine: "Momentum finds its voice.",
      narration: "The world leans forward; wheels, hooves, or engines catch and cascade into change.",
      visualKeywords: ["movement", "flags", "smoke", "structures"],
      palette: ["#101827", "#fbbf24", "#60a5fa", "#fca5a5"],
      environment: "battlefield",
      cameraStyle: "handheld",
    },
    {
      title: `Epilogue of ${eventName}`,
      timePeriod: "",
      location: "",
      oneLine: "What remains becomes memory.",
      narration: "Footsteps fade; the air is different now. The scene keeps an imprint for those who return.",
      visualKeywords: ["empty street", "paper debris", "sunset", "shadows"],
      palette: ["#111827", "#e5e7eb", "#f59e0b", "#ef4444"],
      environment: "city",
      cameraStyle: "orbit-slow",
    },
  ];
}

function speak(text: string | undefined, enabled: boolean, lang: Locale = "en-US") {
  if (!enabled || typeof window === "undefined" || !(window as any).speechSynthesis) return;
  try {
    (window as any).speechSynthesis.cancel();
    const u = new (window as any).SpeechSynthesisUtterance(text ?? "");
    u.lang = lang;
    u.rate = 1.0;
    u.pitch = 1.0;
    (window as any).speechSynthesis.speak(u);
  } catch {}
}

function KeyLights({ intensity = 1 }: { intensity?: number }) {
  return (
    <>
      <ambientLight intensity={0.4 * intensity} />
      <directionalLight position={[5, 10, 5]} intensity={0.8 * intensity} castShadow />
      <directionalLight position={[-5, 5, -5]} intensity={0.5 * intensity} />
      <spotLight position={[0, 15, 10]} angle={0.3} penumbra={0.4} intensity={0.7 * intensity} />
    </>
  );
}

function Ground({ color = "#111", roughness = 0.9 }: { color?: string; roughness?: number }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[150, 150, 1, 1]} />
      <meshStandardMaterial color={color} roughness={roughness} />
    </mesh>
  );
}

function Pyramid({ position = [0, 0, 0], color = "#c2a878", scale = 3 }: { position?: [number, number, number]; color?: string; scale?: number }) {
  return (
    <mesh position={position} castShadow receiveShadow scale={scale}>
      <coneGeometry args={[1, 1, 4]} />
      <meshStandardMaterial color={color} roughness={0.8} metalness={0.1} />
    </mesh>
  );
}

function Flag({ position = [0, 0, 0], color = "#ffffff" }: { position?: [number, number, number]; color?: string }) {
  const t = useRef(0);
  const flag = useRef<THREE.Mesh | null>(null);
  useFrame((_, dt) => {
    t.current = (t.current ?? 0) + dt;
    if (flag.current) flag.current.position.x = position[0] + Math.sin((t.current as number) * 2) * 0.1;
  });
  return (
    <group>
      <mesh position={position} castShadow>
        <cylinderGeometry args={[0.03, 0.03, 2, 16]} />
        <meshStandardMaterial color="#888" />
      </mesh>
      <mesh ref={flag} position={[position[0] + 0.6, position[1] + 0.7, position[2]]} castShadow>
        <planeGeometry args={[1.2, 0.6, 10, 5]} />
        <meshStandardMaterial color={color} side={2} />
      </mesh>
    </group>
  );
}

function Footprints({ count = 8, start = [0, 0.002, -3], dir = [0.6, 0, 0.9] }: { count?: number; start?: [number, number, number]; dir?: [number, number, number] }) {
  const items = Array.from({ length: count });
  return (
    <group>
      {items.map((_, i) => (
        <mesh key={i} position={[start[0] + dir[0] * i, start[1], start[2] + dir[2] * i]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.08, 0.12, 24]} />
          <meshStandardMaterial color="#777" roughness={1} />
        </mesh>
      ))}
    </group>
  );
}

function WaterPlane({ color = "#184c45", distortion = 0.12, speed = 0.35 }: { color?: string; distortion?: number; speed?: number }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[200, 200, 256, 256]} />
      <MeshDistortMaterial color={color} distort={distortion} speed={speed} />
    </mesh>
  );
}

function Starscape() {
  return <Stars radius={120} depth={50} count={8000} factor={3} fade speed={0.6} />;
}

function CameraRig({ mode = "orbit-slow" as CameraStyle }: { mode?: CameraStyle }) {
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const k = 0.5;
    const cam = state.camera;
    switch (mode) {
      case "dolly-in":
        cam.position.lerp(new THREE.Vector3(0, 1.5, 4 + Math.cos(t * 0.25) * 0.4), k * 0.02);
        break;
      case "crane-up":
        cam.position.lerp(new THREE.Vector3(0.6 * Math.sin(t * 0.3), 2 + Math.sin(t * 0.15), 6), k * 0.02);
        break;
      case "handheld":
        cam.position.x += (Math.random() - 0.5) * 0.01;
        cam.position.y += (Math.random() - 0.5) * 0.01;
        cam.rotation.z += (Math.random() - 0.5) * 0.002;
        break;
      case "locked-off":
        cam.position.lerp(new THREE.Vector3(0, 1.6, 6), k * 0.05);
        cam.lookAt(0, 1, 0);
        break;
      case "orbit-slow":
      default:
        cam.position.x = Math.sin(t * 0.1) * 6;
        cam.position.z = Math.cos(t * 0.1) * 6;
        cam.position.y = 2;
        cam.lookAt(0, 1.2, 0);
        break;
    }
  });
  return null;
}

function Diorama({ scene }: { scene: Scene }) {
  const base: Record<EnvName, { ground: string }> = useMemo(
    () => ({
      space: { ground: "#1b2333" },
      desert: { ground: "#4d3b22" },
      city: { ground: "#222" },
      interior: { ground: "#222" },
      battlefield: { ground: "#2a2a2a" },
      sea: { ground: "#0b3d3a" },
      forest: { ground: "#1f2d1f" },
      tundra: { ground: "#dfe6ef" },
      mountain: { ground: "#2b2f3a" },
      ceremonial: { ground: "#33221b" },
    }),
    []
  );
  const groundColor = base[scene.environment].ground;
  return (
    <group>
      {scene.environment === "space" && <Starscape />}
      {scene.environment !== "space" && <Environment preset="sunset" />}
      {scene.environment === "sea" ? (
        <WaterPlane color={groundColor} />
      ) : (
        <Ground color={groundColor} />
      )}
      {scene.visualKeywords?.includes("pyramid") && <Pyramid position={[0, 0.5, -1]} />}
      {scene.visualKeywords?.includes("flag") && <Flag position={[1.5, 1, -0.5]} color="#ff2e2e" />}
      {scene.visualKeywords?.includes("footprints") && <Footprints />}
      {scene.environment === "space" && (
        <mesh position={[0, 0.2, 0]} rotation={[0, Math.PI * 0.25, 0]} castShadow receiveShadow>
          <sphereGeometry args={[2, 64, 64]} />
          <meshStandardMaterial color="#8f8f8f" roughness={1} metalness={0} />
        </mesh>
      )}
      <DreiText
        position={[0, 2.6, 0]}
        fontSize={0.34}
        color={scene.palette?.[3] || "#fff"}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.006}
        outlineColor="#000"
      >
        {scene.title}
      </DreiText>
    </group>
  );
}

function PostFX({ quality = 1 as 0 | 1 | 2 }: { quality?: 0 | 1 | 2 }) {
  return (
    <EffectComposer multisampling={Math.max(0, Math.floor(2 * quality))}>
      <SMAA />
      <Bloom intensity={0.6 + 0.6 * quality} luminanceThreshold={0.2} luminanceSmoothing={0.8} height={480} />
      <Vignette eskil offset={0.3} darkness={0.7} />
      <Noise premultiply opacity={0.05} />
    </EffectComposer>
  );
}

function SceneStage({ scene, cameraStyle, quality }: { scene: Scene; cameraStyle: CameraStyle; quality: 0 | 1 | 2 }) {
  return (
    <>
      <KeyLights intensity={quality === 0 ? 0.7 : 1} />
      <Diorama scene={scene} />
      <CameraRig mode={cameraStyle} />
      <PostFX quality={quality} />
      <OrbitControls enablePan={false} enableZoom={false} enableRotate={false} />
    </>
  );
}

function LoaderOverlay({ label }: { label: string }) {
  return (
    <Html center>
      <div className="backdrop-blur-md bg-black/30 px-4 py-2 rounded-2xl text-white shadow-xl">
        {label}…
      </div>
    </Html>
  );
}

export default function HistoricalCinema3D() {
  const [locale, setLocale] = useState<Locale>("en-US");
  const t = T[locale];
  const [eventName, setEventName] = useState<string>("");
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [active, setActive] = useState<number>(0);
  const [playing, setPlaying] = useState<boolean>(false);
  const [autoplay, setAutoplay] = useState<boolean>(true);
  const [narration, setNarration] = useState<boolean>(true);
  const [quality, setQuality] = useState<0 | 1 | 2>(1);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    return () => {
      try {
        (window as any).speechSynthesis?.cancel();
      } catch {}
    };
  }, []);

  async function startShow(evtName?: string) {
    const name = (evtName ?? eventName).trim();
    if (!name) return;
    setLoading(true);
    try {
      const local = generateScenesLocally(name);
      setScenes(local);
      setActive(0);
      setPlaying(true);
      speak(local[0]?.narration, narration, locale);
    } catch (e) {
      console.error(e);
      alert("Failed to generate scenes. Try another event.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!playing || !autoplay || scenes.length === 0) return;
    const handle = window.setInterval(() => {
      setActive((i) => {
        const next = (i + 1) % scenes.length;
        speak(scenes[next]?.narration, narration, locale);
        return next;
      });
    }, 6800);
    return () => window.clearInterval(handle);
  }, [playing, autoplay, scenes, narration, locale]);

  const currentScene = scenes[active];

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-slate-900 via-black to-slate-950 text-white">
      <header className="mx-auto max-w-6xl px-4 pt-8 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Theater className="w-8 h-8" />
          <div className="leading-tight">
            <h1 className="text-2xl md:text-3xl font-bold drop-shadow-sm">{t.appTitle}</h1>
            <p className="text-sm text-slate-300">{t.appDescription}</p>
          </div>
        </div>
        <Select value={locale} onValueChange={(v: Locale) => setLocale(v)}>
          <SelectTrigger className="w-40">
            <Languages className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Language" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="en-US">English</SelectItem>
            <SelectItem value="es-ES">Español</SelectItem>
          </SelectContent>
        </Select>
      </header>

      <div className="mx-auto max-w-6xl px-4 grid md:grid-cols-3 gap-4">
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4 flex flex-col gap-3">
            <div className="flex gap-2">
              <Input
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                placeholder={t.eventPlaceholder}
                className="bg-black/40 border-white/10"
              />
              <Button onClick={() => startShow()} className="gap-2">
                <Sparkles className="h-4 w-4" /> {t.beginButton}
              </Button>
            </div>

            <div className="flex items-center gap-3 text-slate-300">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="accent-white" checked={autoplay} onChange={(e) => setAutoplay(e.target.checked)} />
                {t.autoplay}
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" className="accent-white" checked={narration} onChange={(e) => setNarration(e.target.checked)} />
                {t.narration}
              </label>
              <div className="flex items-center gap-2 ml-auto">
                <Volume2 className="w-4 h-4" />
                <span className="text-xs uppercase tracking-wider text-slate-400">{t.quality}</span>
                <div className="w-32">
                  <Slider value={[quality]} onValueChange={(v) => setQuality((v?.[0] as 0 | 1 | 2) ?? 1)} min={0} max={2} step={1} />
                </div>
              </div>
            </div>

            {scenes.length === 0 && (
              <div className="text-slate-400 text-sm">
                <p className="mb-2 font-medium">{t.suggestedEventsTitle}</p>
                <div className="flex flex-wrap gap-2">
                  {[t.moonLanding, t.ancientEgypt, t.worldWarII].map((x) => (
                    <Button
                      key={x}
                      variant="secondary"
                      className="bg-white/10 border-white/10 hover:bg-white/20"
                      onClick={() => {
                        setEventName(x);
                        startShow(x);
                      }}
                    >
                      {x}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {scenes.length > 0 && (
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  className="bg-white/10 border-white/10 hover:bg-white/20"
                  onClick={() => {
                    setActive((i) => {
                      const idx = (i - 1 + scenes.length) % scenes.length;
                      speak(scenes[idx]?.narration, narration, locale);
                      return idx;
                    });
                  }}
                >
                  <SkipBack className="h-4 w-4" />
                </Button>
                <Button
                  variant="secondary"
                  className="bg-white/10 border-white/10 hover:bg-white/20"
                  onClick={() => setPlaying((p) => !p)}
                >
                  {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
                <Button
                  variant="secondary"
                  className="bg-white/10 border-white/10 hover:bg-white/20"
                  onClick={() => {
                    setActive((i) => {
                      const idx = (i + 1) % scenes.length;
                      speak(scenes[idx]?.narration, narration, locale);
                      return idx;
                    });
                  }}
                >
                  <SkipForward className="h-4 w-4" />
                </Button>
                <div className="flex-1 px-3">
                  <Slider value={[active]} onValueChange={(v) => setActive((v?.[0] as number) ?? 0)} min={0} max={Math.max(0, scenes.length - 1)} step={1} />
                </div>
                <span className="text-xs text-slate-400">
                  {active + 1} {t.of} {Math.max(1, scenes.length)}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="md:col-span-2">
          <div className="w-full aspect-video rounded-2xl overflow-hidden ring-1 ring-white/10 bg-black shadow-2xl">
            <Canvas shadows gl={{ antialias: true }} dpr={[1, 2]} camera={{ position: [0, 2, 8], fov: 45 }}>
              {loading && <LoaderOverlay label={t.loadingText} />}
              {currentScene ? (
                <SceneStage scene={currentScene} cameraStyle={currentScene.cameraStyle} quality={quality} />
              ) : (
                <>
                  <KeyLights />
                  <Environment preset="sunset" />
                  <Ground />
                  <DreiText position={[0, 2.2, 0]} fontSize={0.34} color="#fff" outlineWidth={0.006} outlineColor="#000" anchorX="center" anchorY="middle">
                    {t.appTitle}
                  </DreiText>
                  <DreiText position={[0, 1.6, 0]} fontSize={0.18} color="#d1d5db" anchorX="center" anchorY="middle">
                    {t.appDescription}
                  </DreiText>
                </>
              )}
            </Canvas>
          </div>

          {currentScene && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mt-3 grid md:grid-cols-3 gap-3">
              <Card className="bg-white/5 border-white/10 md:col-span-2">
                <CardContent className="p-4">
                  <div className="text-sm uppercase tracking-wider text-slate-400">
                    {currentScene.timePeriod} · {currentScene.location}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{currentScene.title}</h3>
                  <p className="text-slate-300 leading-relaxed">{currentScene.narration}</p>
                </CardContent>
              </Card>
              <Card className="bg-white/5 border-white/10">
                <CardContent className="p-4">
                  <div className="text-sm uppercase tracking-wider text-slate-400 mb-2">Visual notes</div>
                  <div className="flex flex-wrap gap-1">
                    {currentScene.visualKeywords?.map((k) => (
                      <span key={k} className="text-xs bg-white/10 border border-white/10 rounded-full px-2 py-1 text-slate-200">
                        {k}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>

      <footer className="mx-auto max-w-6xl px-4 py-8 text-xs text-slate-400 flex items-center justify-between">
        <span>Built with React · React Three Fiber · Postprocessing · Web Speech</span>
        <span>Tip: toggle Narration for voiceover</span>
      </footer>
    </div>
  );
}

/*
 * HOW TO PLUG YOUR LLM (optional)
 * --------------------------------
 * 1) Replace generateScenesLocally with a fetch call to your backend.
 * 2) Your backend should call your preferred model with SCENE_PROMPT_TEMPLATE and the user's event name.
 * 3) Return an array of scenes matching the Scene interface above.
 * 4) Keep narration short; visualKeywords drive the diorama props.
 *
 * Expected response example:
 * [
 *   { title, timePeriod, location, oneLine, narration, visualKeywords:["pyramid","torch"], palette:["#..."], environment:"desert", cameraStyle:"crane-up" }
 * ]
 */
npm install
npm run dev
