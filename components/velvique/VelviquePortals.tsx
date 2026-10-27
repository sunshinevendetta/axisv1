"use client";

/* Five portals, one per question. Adapted from Three Small Worlds by Amir
   Mushich (MIT, github.com/amirmushichge/three-small-worlds), itself based on
   the pmndrs Enter portals example by Paul Henschel. Each portal holds a
   procedural world whose four answer objects are picked from inside it. */

import { createContext, Suspense, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { CameraControls, MeshPortalMaterial, Text, useCursor } from "@react-three/drei";
import * as THREE from "three";

export type PortalWorld =
  | "orbs"
  | "silk"
  | "monolith"
  | "leaves"
  | "prism"
  | "strata"
  | "shards"
  | "ripple"
  | "bloom"
  | "dunes"
  | "embers"
  | "lattice";

export type PortalOption = { id: string; label: string; world: PortalWorld };
export type PortalQuestion = { id: string; dimension: string; options: PortalOption[] };

const FONT = "/fonts/BINGO.TTF";

/* In-scene words. Bingo has no CJK glyphs and fallback fonts would come from
   a CDN mid-event, so Chinese hides scene words; the HUD carries them. */
export type SceneText = { words: boolean; notAnswered: string };
const SceneTextContext = createContext<SceneText>({ words: true, notAnswered: "Not answered yet" });
/* Phones render five live portals, so they get smaller render targets and a lower pixel ratio. */
const COARSE = typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;
const PORTAL_RESOLUTION = COARSE ? 512 : 1024;
const CARD_W = 1;
const CARD_H = 1.61803398875;
const HALF_FOV = Math.tan(THREE.MathUtils.degToRad(30));

/* One monochrome environment per question world. */
const ROOMS = [
  { bg: "#e6e6e6", ink: "#151515" },
  { bg: "#111111", ink: "#f0f0f0" },
  { bg: "#2a2a2a", ink: "#e4e4e4" },
  { bg: "#cfcfcf", ink: "#0d0d0d" },
  { bg: "#1d1d1d", ink: "#e0e0e0" },
];

function roundedCard(width: number, height: number, radius: number) {
  const shape = new THREE.Shape();
  const x = -width / 2;
  const y = -height / 2;
  shape.moveTo(x + radius, y);
  shape.lineTo(x + width - radius, y);
  shape.quadraticCurveTo(x + width, y, x + width, y + radius);
  shape.lineTo(x + width, y + height - radius);
  shape.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  shape.lineTo(x + radius, y + height);
  shape.quadraticCurveTo(x, y + height, x, y + height - radius);
  shape.lineTo(x, y + radius);
  shape.quadraticCurveTo(x, y, x + radius, y);
  return new THREE.ShapeGeometry(shape, 12);
}

function isLight(hex: string) {
  return new THREE.Color(hex).getHSL({ h: 0, s: 0, l: 0 }).l > 0.5;
}

/* Motifs are authored around (0, 0, -2.4) in a ~2.4 unit field; each answer
   cluster re-centres and shrinks one. */
type Motif = {
  count: number;
  geometry: () => ReactNode;
  metalness: number;
  roughness: number;
  wireframe?: boolean;
  place: (i: number, n: number) => { p: [number, number, number]; s: number };
  move: (obj: THREE.Object3D, t: number, i: number, home: THREE.Vector3) => void;
};

const ring = (i: number, n: number, r: number, y = 0, z = -2.4): [number, number, number] => [Math.cos((i / n) * Math.PI * 2) * r, y, z + Math.sin((i / n) * Math.PI * 2) * r];
const rand = (i: number, k: number) => {
  const x = Math.sin(i * 127.1 + k * 311.7) * 43758.5453;
  return x - Math.floor(x);
};

const MOTIFS: Record<PortalWorld, Motif> = {
  prism: {
    count: 7, metalness: 0.9, roughness: 0.12,
    geometry: () => <octahedronGeometry args={[0.36, 0]} />,
    place: (i, n) => ({ p: ring(i, n, 0.9, (rand(i, 1) - 0.5) * 1.2), s: 0.6 + rand(i, 2) * 0.7 }),
    move: (o, t, i, h) => { o.rotation.set(t * 0.6 + i, t * 0.9, 0); o.position.y = h.y + Math.sin(t * 1.4 + i) * 0.15; },
  },
  orbs: {
    count: 10, metalness: 0.2, roughness: 0.25,
    geometry: () => <sphereGeometry args={[0.26, 40, 40]} />,
    place: (i) => ({ p: [(rand(i, 1) - 0.5) * 2, (rand(i, 2) - 0.5) * 2, -2.4 + (rand(i, 3) - 0.5)], s: 0.5 + rand(i, 4) * 1.1 }),
    move: (o, t, i, h) => { o.position.y = h.y + Math.sin(t * 0.7 + i * 1.3) * 0.22; o.position.x = h.x + Math.cos(t * 0.5 + i) * 0.08; },
  },
  monolith: {
    count: 5, metalness: 0.6, roughness: 0.55,
    geometry: () => <boxGeometry args={[0.3, 1.8, 0.3]} />,
    place: (i, n) => ({ p: [(i - (n - 1) / 2) * 0.48, -0.1 + rand(i, 1) * 0.3, -2.4 + (rand(i, 2) - 0.5) * 0.6], s: 0.7 + rand(i, 3) * 0.5 }),
    move: (o, t, i) => { o.rotation.y = Math.sin(t * 0.3 + i) * 0.4; },
  },
  leaves: {
    count: 16, metalness: 0, roughness: 0.8,
    geometry: () => <planeGeometry args={[0.22, 0.5]} />,
    place: (i) => ({ p: [(rand(i, 1) - 0.5) * 2, (rand(i, 2) - 0.5) * 2, -2.4 + (rand(i, 3) - 0.5)], s: 0.7 + rand(i, 4) * 0.8 }),
    move: (o, t, i, h) => { o.rotation.set(Math.sin(t + i) * 0.8, t * 0.4 + i, Math.cos(t * 0.6 + i) * 0.6); o.position.y = h.y - ((t * 0.12 + rand(i, 5)) % 1) * 0.6 + 0.3; },
  },
  ripple: {
    count: 5, metalness: 0.95, roughness: 0.15,
    geometry: () => <torusGeometry args={[0.6, 0.04, 16, 96]} />,
    place: (i) => ({ p: [0, 0, -2.4], s: 0.4 + i * 0.32 }),
    move: (o, t, i) => { o.rotation.set(Math.PI / 2 + Math.sin(t * 0.8 + i * 0.5) * 0.35, Math.cos(t * 0.6 + i * 0.4) * 0.3, 0); },
  },
  strata: {
    count: 7, metalness: 0.3, roughness: 0.7,
    geometry: () => <boxGeometry args={[1.8, 0.1, 1.2]} />,
    place: (i, n) => ({ p: [0, (i - (n - 1) / 2) * 0.28, -2.4], s: 1 - i * 0.06 }),
    move: (o, t, i) => { o.rotation.y = t * 0.15 * (i % 2 ? 1 : -1) + i * 0.2; },
  },
  shards: {
    count: 12, metalness: 0.7, roughness: 0.3,
    geometry: () => <tetrahedronGeometry args={[0.26, 0]} />,
    place: (i) => ({ p: [(rand(i, 1) - 0.5) * 2, (rand(i, 2) - 0.5) * 2, -2.4 + (rand(i, 3) - 0.5) * 0.8], s: 0.6 + rand(i, 4) * 1.2 }),
    move: (o, t, i, h) => { const k = 1 + Math.sin(t * 0.9 + i) * 0.14; o.position.set(h.x * k, h.y * k, h.z); o.rotation.set(t * 1.2 + i, t * 0.7, i); },
  },
  bloom: {
    count: 8, metalness: 0.1, roughness: 0.35,
    geometry: () => <sphereGeometry args={[0.34, 32, 32]} />,
    place: (i, n) => ({ p: [Math.cos((i / n) * Math.PI * 2) * 0.55, Math.sin((i / n) * Math.PI * 2) * 0.55, -2.4], s: 1 }),
    move: (o, t, i) => { const a = (i / 8) * Math.PI * 2 + t * 0.15; const r = 0.55 + Math.sin(t * 0.8) * 0.06; o.position.set(Math.cos(a) * r, Math.sin(a) * r, -2.4); o.scale.set(0.5, 1.3, 0.25); o.rotation.z = a - Math.PI / 2; },
  },
  dunes: {
    count: 25, metalness: 0.15, roughness: 0.5,
    geometry: () => <sphereGeometry args={[0.15, 20, 20]} />,
    place: (i) => ({ p: [((i % 5) - 2) * 0.42, -0.3, -2.4 + (Math.floor(i / 5) - 2) * 0.42], s: 1 }),
    move: (o, t, i, h) => { o.position.y = h.y + Math.sin(t * 1.3 + (i % 5) * 0.7 + Math.floor(i / 5) * 0.5) * 0.22; },
  },
  silk: {
    count: 1, metalness: 0.85, roughness: 0.18,
    geometry: () => <torusKnotGeometry args={[0.6, 0.18, 200, 32, 2, 5]} />,
    place: () => ({ p: [0, 0, -2.4], s: 1 }),
    move: (o, t) => { o.rotation.set(t * 0.2, t * 0.32, 0); },
  },
  embers: {
    count: 28, metalness: 0, roughness: 1,
    geometry: () => <sphereGeometry args={[0.06, 10, 10]} />,
    place: (i) => ({ p: [(rand(i, 1) - 0.5) * 1.6, -1, -2.4 + (rand(i, 2) - 0.5)], s: 0.6 + rand(i, 3) }),
    move: (o, t, i, h) => { const life = (t * (0.18 + rand(i, 4) * 0.2) + rand(i, 5)) % 1; o.position.set(h.x + Math.sin(t + i) * 0.1, -1 + life * 2.2, h.z); o.scale.setScalar(1.4 * (1 - life)); },
  },
  lattice: {
    count: 27, metalness: 0.4, roughness: 0.4, wireframe: true,
    geometry: () => <boxGeometry args={[0.34, 0.34, 0.34]} />,
    place: (i) => ({ p: [((i % 3) - 1) * 0.5, (Math.floor(i / 3) % 3 - 1) * 0.5, -2.4 + (Math.floor(i / 9) - 1) * 0.5], s: 1 }),
    move: (o, t, i) => { o.rotation.set(t * 0.4 + i * 0.1, t * 0.5, 0); o.scale.setScalar(0.7 + Math.sin(t * 1.5 + i * 0.4) * 0.3); },
  },
};

const SLOTS: Array<[number, number, number]> = [
  [-0.38, 0.46, -2.2],
  [0.38, 0.46, -2.2],
  [-0.38, -0.44, -2.2],
  [0.38, -0.44, -2.2],
];
const CLUSTER_SCALE = 0.2;

function AnswerCluster({
  option,
  slot,
  ink,
  interactive,
  selected,
  dimmed,
  onPick,
}: {
  option: PortalOption;
  slot: [number, number, number];
  ink: string;
  interactive: boolean;
  selected: boolean;
  dimmed: boolean;
  onPick: () => void;
}) {
  const motif = MOTIFS[option.world];
  const sceneText = useContext(SceneTextContext);
  const root = useRef<THREE.Group>(null);
  const field = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const homes = useMemo(() => Array.from({ length: motif.count }, (_, i) => motif.place(i, motif.count)), [motif]);
  const vectors = useMemo(() => homes.map((h) => new THREE.Vector3(...h.p)), [homes]);
  useCursor(interactive && hovered);

  useFrame(({ clock }, delta) => {
    const t = clock.getElapsedTime();
    field.current?.children.forEach((child, i) => motif.move(child, t, i, vectors[i]));
    if (root.current) {
      const target = CLUSTER_SCALE * (selected ? 1.3 : hovered && interactive ? 1.12 : dimmed ? 0.82 : 1);
      root.current.scale.setScalar(THREE.MathUtils.damp(root.current.scale.x, target, 7, delta));
      root.current.position.z = THREE.MathUtils.damp(root.current.position.z, selected ? 0.3 : 0, 7, delta);
    }
  });

  return (
    <group position={[slot[0], slot[1], slot[2]]}>
      <group ref={root} scale={CLUSTER_SCALE}>
        <group ref={field} position={[0, 0, 2.4]}>
          {homes.map((home, i) => (
            <mesh key={i} position={home.p} scale={home.s}>
              {motif.geometry()}
              <meshStandardMaterial color={ink} metalness={motif.metalness} roughness={motif.roughness} wireframe={motif.wireframe} transparent opacity={dimmed ? 0.35 : 1} />
            </mesh>
          ))}
        </group>
        <mesh
          visible={false}
          onClick={(event) => {
            if (!interactive) return;
            event.stopPropagation();
            onPick();
          }}
          onPointerOver={(event) => {
            event.stopPropagation();
            setHovered(true);
          }}
          onPointerOut={() => setHovered(false)}
        >
          <sphereGeometry args={[1.5, 16, 16]} />
        </mesh>
      </group>
      {sceneText.words && (
        <Text font={FONT} color={ink} fontSize={0.06} maxWidth={0.8} textAlign="center" anchorX="center" anchorY="top" position={[0, -0.3, 0]} fillOpacity={dimmed ? 0.4 : 1}>
          {option.label}
        </Text>
      )}
    </group>
  );
}

function QuestionWorld({
  question,
  room,
  inside,
  pendingId,
  answerId,
  onPick,
}: {
  question: PortalQuestion;
  room: (typeof ROOMS)[number];
  inside: boolean;
  pendingId: string | null;
  answerId: string | null;
  onPick: (optionId: string) => void;
}) {
  const highlight = pendingId ?? answerId;
  return (
    <>
      <color attach="background" args={[room.bg]} />
      <fog attach="fog" args={[room.bg, 6, 14]} />
      <ambientLight intensity={0.9} />
      <directionalLight position={[-3, 5, 5]} intensity={2.2} />
      <pointLight position={[2, -1, 1]} intensity={4} />
      {question.options.map((option, index) => (
        <AnswerCluster
          key={option.id}
          option={option}
          slot={SLOTS[index]}
          ink={room.ink}
          interactive={inside}
          selected={highlight === option.id}
          dimmed={Boolean(highlight) && highlight !== option.id}
          onPick={() => onPick(option.id)}
        />
      ))}
    </>
  );
}

type Layout = { distance: number; aspect: number; spacing: number; peek: number };

/* Stepper: one world in focus at the center of the stage, its neighbours
   peeking at the sides. The camera frames the focused card plus a sliver of
   each neighbour, whatever the shape of the stage. */
function useLayout(): Layout {
  const { size } = useThree();
  const aspect = size.width / Math.max(1, size.height);
  const spacing = aspect < 1 ? 1.22 : 1.35;
  const distance = Math.max(2.15 / (2 * HALF_FOV), (aspect < 1 ? 1.75 : 2.6) / (2 * HALF_FOV * aspect));
  /* Phones show one neighbour per side, wide screens two. */
  return { distance, aspect, spacing, peek: aspect < 1 ? 1 : 2 };
}

function Frame({
  question,
  index,
  focusIndex,
  layout,
  activeId,
  pendingId,
  answerId,
  onEnter,
  onFocusIndex,
  onPick,
}: {
  question: PortalQuestion;
  index: number;
  focusIndex: number;
  layout: Layout;
  activeId: string | null;
  pendingId: string | null;
  answerId: string | null;
  onEnter: (id: string) => void;
  onFocusIndex: (index: number) => void;
  onPick: (questionId: string, optionId: string) => void;
}) {
  const portal = useRef<{ blend: number } | null>(null);
  const frame = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const active = activeId === question.id;
  const offset = index - focusIndex;
  const sceneText = useContext(SceneTextContext);
  const focused = offset === 0;
  const room = ROOMS[index % ROOMS.length];
  const labelColor = isLight(room.bg) ? "#111111" : "#ffffff";
  const geometry = useMemo(() => roundedCard(CARD_W, CARD_H, 0.08), []);
  const answer = question.options.find((option) => option.id === answerId);
  useCursor(!activeId && hovered);

  useFrame((_, delta) => {
    if (portal.current) portal.current.blend = THREE.MathUtils.damp(portal.current.blend, active ? 1 : 0, 5, delta);
    const g = frame.current;
    if (!g) return;
    /* Slide along the track: focused card front and square, others recede and turn in. */
    const reach = Math.min(Math.abs(offset), layout.peek + 1);
    /* The second neighbour sits further out so the receding cards never stack. */
    const tx = Math.sign(offset) * (reach * layout.spacing + Math.max(0, reach - 1) * 0.55);
    const tz = -reach * 0.55 + (!activeId && hovered && focused ? 0.06 : 0);
    const ts = focused ? 1 : 0.86;
    g.position.x = THREE.MathUtils.damp(g.position.x, tx, 7, delta);
    g.position.z = THREE.MathUtils.damp(g.position.z, tz, 7, delta);
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, -Math.sign(offset) * Math.min(reach, 1) * 0.42, 7, delta);
    g.scale.setScalar(THREE.MathUtils.damp(g.scale.x, ts, 7, delta));
    g.visible = Math.abs(offset) <= layout.peek;
  });

  return (
    <group ref={frame} position={[offset * layout.spacing, 0, 0]}>
      <Text font={FONT} color="#ffffff" fillOpacity={focused ? 1 : 0.5} fontSize={0.075} anchorX="left" anchorY="bottom" position={[-0.5, 0.84, 0]} material-toneMapped={false}>
        {String(index + 1).padStart(2, "0")}
      </Text>
      {sceneText.words && (
        <>
          <Text font={FONT} color={labelColor} fontSize={0.075} maxWidth={0.86} lineHeight={0.95} anchorX="left" anchorY="top" position={[-0.44, 0.75, 0.012]} material-toneMapped={false}>
            {question.dimension.toUpperCase()}
          </Text>
          <Text font={FONT} color="#ffffff" fillOpacity={answer ? 1 : 0.5} fontSize={0.06} maxWidth={1} anchorX="left" anchorY="top" position={[-0.5, -0.86, 0]} material-toneMapped={false}>
            {answer ? answer.label : sceneText.notAnswered}
          </Text>
        </>
      )}
      <mesh
        name={`portal-${question.id}`}
        geometry={geometry}
        onClick={(event) => {
          if (activeId) return;
          event.stopPropagation();
          /* Tapping a neighbour brings it into focus; tapping the focused world enters it. */
          if (focused) onEnter(question.id);
          else onFocusIndex(index);
        }}
        onPointerOver={(event) => {
          event.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={() => setHovered(false)}
      >
        <MeshPortalMaterial ref={portal as never} events={active} side={THREE.DoubleSide} blur={0} resolution={PORTAL_RESOLUTION}>
          <QuestionWorld
            question={question}
            room={room}
            inside={active}
            pendingId={active ? pendingId : null}
            answerId={answerId}
            onPick={(optionId) => onPick(question.id, optionId)}
          />
        </MeshPortalMaterial>
      </mesh>
    </group>
  );
}

function Rig({ activeId, layout }: { activeId: string | null; layout: Layout }) {
  const controls = useRef<CameraControls>(null);
  const { scene } = useThree();

  useEffect(() => {
    const api = controls.current;
    if (!api) return;
    if (!activeId) {
      void api.setLookAt(0, 0, layout.distance, 0, 0, 0, true);
      return;
    }
    const portal = scene.getObjectByName(`portal-${activeId}`);
    if (!portal?.parent) return;
    /* Back off just far enough to frame all four answers and their labels. */
    const reach = Math.max(1.7 / (2 * HALF_FOV), 1.85 / (2 * HALF_FOV * layout.aspect));
    const position = portal.parent.localToWorld(new THREE.Vector3(0, 0, -2.2 + reach));
    const focus = portal.parent.localToWorld(new THREE.Vector3(0, 0, -2.2));
    void api.setLookAt(...position.toArray(), ...focus.toArray(), true);
  }, [activeId, layout, scene]);

  /* The overview is a stepper driven by swipes and taps, so the camera only
     takes drag input once the guest is inside a world. */
  return (
    <CameraControls
      ref={controls}
      makeDefault
      enabled={Boolean(activeId)}
      smoothTime={0.32}
      draggingSmoothTime={0.12}
      minPolarAngle={Math.PI / 3}
      maxPolarAngle={Math.PI / 1.5}
      minAzimuthAngle={-Math.PI / 5}
      maxAzimuthAngle={Math.PI / 5}
      minDistance={activeId ? 0.2 : layout.distance * 0.85}
      maxDistance={activeId ? 4 : layout.distance * 1.15}
      dollySpeed={0.5}
    />
  );
}

type PortalsProps = {
  questions: PortalQuestion[];
  answers: Record<string, string>;
  activeId: string | null;
  pendingId: string | null;
  focusIndex: number;
  onEnter: (id: string) => void;
  onFocusIndex: (index: number) => void;
  onPick: (questionId: string, optionId: string) => void;
  onReady?: () => void;
  sceneText?: SceneText;
};

function Portals(props: PortalsProps) {
  const layout = useLayout();
  const { onReady } = props;
  /* Runs once the suspended fonts and portals have mounted. */
  useEffect(() => onReady?.(), [onReady]);
  return (
    <>
      {props.questions.map((question, index) => (
        <Frame
          key={question.id}
          question={question}
          index={index}
          focusIndex={props.focusIndex}
          layout={layout}
          activeId={props.activeId}
          pendingId={props.pendingId}
          answerId={props.answers[question.id] ?? null}
          onEnter={props.onEnter}
          onFocusIndex={props.onFocusIndex}
          onPick={props.onPick}
        />
      ))}
      <Rig activeId={props.activeId} layout={layout} />
    </>
  );
}

export default function VelviquePortals(props: PortalsProps) {
  return (
    <Canvas
      className="vq-canvas"
      camera={{ fov: 60, position: [0, 0, 6], near: 0.025, far: 200 }}
      dpr={COARSE ? [1, 1.5] : [1, 1.75]}
      gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
    >
      <color attach="background" args={["#000000"]} />
      <Suspense fallback={null}>
        <SceneTextContext.Provider value={props.sceneText ?? { words: true, notAnswered: "Not answered yet" }}>
          <Portals {...props} />
        </SceneTextContext.Provider>
      </Suspense>
    </Canvas>
  );
}
