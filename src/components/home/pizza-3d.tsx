"use client";

import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import { useTheme } from "next-themes";
import { useReducedMotion } from "framer-motion";
import * as THREE from "three";

/* ------------------------------------------------------------------
   Procedural pizza — no downloaded model, so there is no licence
   risk, the bundle stays a few KB, and colours follow the theme.
   ------------------------------------------------------------------ */

type Topping = { x: number; z: number; kind: "pepperoni" | "olive" | "basil"; r: number };

/** Deterministic layout so the pizza looks identical on every render. */
function buildToppings(count: number): Topping[] {
  let seed = 20261121;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };

  const kinds: Topping["kind"][] = ["pepperoni", "pepperoni", "olive", "basil"];
  const result: Topping[] = [];

  for (let i = 0; i < count; i++) {
    // Rejection-sample inside the cheese disc, never on the crust rim.
    const angle = rand() * Math.PI * 2;
    const radius = Math.sqrt(rand()) * 1.15;
    result.push({
      x: Math.cos(angle) * radius,
      z: Math.sin(angle) * radius,
      kind: kinds[i % kinds.length]!,
      r: 0.11 + rand() * 0.05,
    });
  }
  return result;
}

function Pizza({ lowPower }: { lowPower: boolean }) {
  const group = useRef<THREE.Group>(null);
  const { resolvedTheme } = useTheme();
  const reduce = useReducedMotion();

  const toppings = useMemo(() => buildToppings(lowPower ? 9 : 16), [lowPower]);

  // One slow, continuous spin — the only ambient motion on the page.
  useFrame(({ clock }) => {
    if (!group.current || reduce) return;
    const t = clock.elapsedTime;
    group.current.rotation.y = t * 0.32;
    group.current.position.y = Math.sin(t * 0.9) * 0.08;
  });

  const dark = resolvedTheme === "dark";

  const crust = dark ? "#c98a4b" : "#d99a52";
  const sauce = dark ? "#b8322c" : "#c8352c";
  const cheese = dark ? "#f0c14f" : "#f4cf6a";
  const crustEdge = dark ? "#a76d38" : "#b87b3f";

  // +x tilt tips the top face TOWARD the camera; a negative value
  // would show the underside instead.
  return (
    <group ref={group} rotation={[0.5, 0, 0.1]} scale={lowPower ? 0.92 : 1}>
      {/* crust base */}
      <mesh castShadow>
        <cylinderGeometry args={[1.5, 1.42, 0.2, lowPower ? 32 : 64]} />
        <meshStandardMaterial color={crust} roughness={0.85} />
      </mesh>

      {/* raised crust rim — torus lies in XY by default, so rotate it
          flat into the same XZ plane as the crust disc */}
      <mesh position={[0, 0.13, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.4, 0.17, 12, lowPower ? 40 : 72]} />
        <meshStandardMaterial color={crustEdge} roughness={0.9} />
      </mesh>

      {/* sauce */}
      <mesh position={[0, 0.11, 0]}>
        <cylinderGeometry args={[1.32, 1.32, 0.05, lowPower ? 32 : 64]} />
        <meshStandardMaterial color={sauce} roughness={0.7} />
      </mesh>

      {/* melted cheese */}
      <mesh position={[0, 0.15, 0]}>
        <cylinderGeometry args={[1.24, 1.24, 0.06, lowPower ? 32 : 64]} />
        <meshStandardMaterial color={cheese} roughness={0.55} metalness={0.05} />
      </mesh>

      {toppings.map((topping, i) => {
        const y = 0.21;
        if (topping.kind === "basil") {
          return (
            <mesh key={i} position={[topping.x, y, topping.z]} rotation={[0, i, 0]} scale={[1, 0.25, 1]}>
              <sphereGeometry args={[topping.r * 1.5, 12, 12]} />
              <meshStandardMaterial color="#2d6a4f" roughness={0.6} />
            </mesh>
          );
        }
        if (topping.kind === "olive") {
          // olive slice lying flat on the cheese, like the pepperoni
          return (
            <mesh
              key={i}
              position={[topping.x, y, topping.z]}
              rotation={[Math.PI / 2, 0, 0]}
            >
              <torusGeometry args={[topping.r * 0.8, topping.r * 0.32, 8, 16]} />
              <meshStandardMaterial color="#2b2118" roughness={0.5} />
            </mesh>
          );
        }
        return (
          <mesh key={i} position={[topping.x, y, topping.z]}>
            <cylinderGeometry args={[topping.r, topping.r, 0.045, 16]} />
            <meshStandardMaterial color="#c0392b" roughness={0.6} />
          </mesh>
        );
      })}
    </group>
  );
}

interface Props {
  className?: string;
}

/**
 * Hero canvas. `dynamic(..., { ssr: false })` is applied by the caller
 * because WebGL cannot render on the server.
 */
export function Pizza3D({ className }: Props) {
  const { resolvedTheme } = useTheme();
  const reduce = useReducedMotion();
  const dark = resolvedTheme === "dark";

  return (
    <div className={className}>
      <Canvas
        dpr={[1, 1.75]}
        shadows="basic"
        camera={{ position: [0, 1.5, 4.6], fov: 38 }}
        gl={{ antialias: true, alpha: true }}
        style={{ width: "100%", height: "100%" }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={dark ? 0.55 : 0.85} />
          <directionalLight
            position={[4, 7, 3]}
            intensity={dark ? 2.2 : 2.6}
            castShadow
            shadow-mapSize={[1024, 1024]}
          />
          <pointLight position={[-4, 2, -3]} intensity={dark ? 6 : 4} color="#f4a261" />

          <Float
            speed={reduce ? 0 : 1.4}
            rotationIntensity={reduce ? 0 : 0.35}
            floatIntensity={reduce ? 0 : 0.8}
            floatingRange={[-0.1, 0.1]}
          >
            <Pizza lowPower={false} />
          </Float>
        </Suspense>
      </Canvas>
    </div>
  );
}
