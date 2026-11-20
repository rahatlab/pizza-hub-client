"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, ContactShadows, Environment } from "@react-three/drei";
import { AnimatePresence, motion } from "framer-motion";
import { useSpring, animated } from "@react-spring/three";
import * as THREE from "three";

type FeaturedPizza = {
  id: string;
  name: string;
  toppingColor: string;
  crustColor: string;
};

const PIZZAS: FeaturedPizza[] = [
  { id: "1", name: "Margherita", toppingColor: "#ff0000", crustColor: "#d2691e" },
  { id: "2", name: "Pepperoni", toppingColor: "#ff4500", crustColor: "#cd853f" },
  { id: "3", name: "Veggie Supreme", toppingColor: "#228b22", crustColor: "#deb887" },
  { id: "4", name: "Meat Lovers", toppingColor: "#8b0000", crustColor: "#d2691e" },
  { id: "5", name: "Hawaiian", toppingColor: "#ffd700", crustColor: "#cd853f" },
];

export function PizzaHeroSlider() {
  const [index, setIndex] = useState(0);
  const canvasRef = useRef<HTMLDivElement>(null);
  const pizzaRef = useRef<THREE.Mesh>(null);
  const crustRef = useRef<THREE.Mesh>(null);

  // Auto-rotate + pause on hover/focus
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % PIZZAS.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [isPaused]);

  // 3D pizza morphs with slide
  useEffect(() => {
    const pizza = PIZZAS[index];
    if (pizzaRef.current) {
      pizzaRef.current.material.color.set(pizza.toppingColor);
    }
    if (crustRef.current) {
      crustRef.current.material.color.set(pizza.crustColor);
    }
  }, [index]);

  // Handle prefers-reduced-motion
  const media = useCallback(() => {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  return (
    <div className="relative h-[400px] w-full lg:w-[400px] bg-background/20 rounded-2xl overflow-hidden border border-border">
      {/* Static fallback for reduced motion */}
      {media() ? (
        <div className="h-full w-full flex items-center justify-center bg-surface">
          <div className="text-center">
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <svg className="w-12 h-12 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="12" r="3" />
                <path d="M12 8v4M12 16h.01M8 12h.01M16 12h.01M9.29 9.29l.01.01M17.71 17.71l.01.01M4.93 4.93l.01.01M19.07 19.07l.01.01" />
              </svg>
            </div>
            <p className="text-body-sm text-muted-foreground">{PIZZAS[index].name}</p>
          </div>
        </div>
      ) : (
        <Canvas
          ref={canvasRef}
          shadows
          camera={{ position: [0, 0, 6], fov: 45 }}
          frameloop={isPaused ? "demand" : "always"}
        >
          <Environment preset="city" intensity={0.5} />
          <ContactShadows opacity={0.3} scale={10} blur={2} far={10} />
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            autoRotate={!isPaused}
            autoRotateSpeed={0.5}
            maxPolarAngle={Math.PI / 2 - 0.1}
            minPolarAngle={Math.PI / 4}
          />
          <pointLight position={[5, 5, 5]} intensity={1} />
          <ambientLight intensity={0.5} />

          {/* Pizza base */}
          <mesh ref={crustRef} rotation={[-Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[1.4, 1.4, 0.25, 32]} />
            <meshStandardMaterial color="#cd853f" />
          </mesh>

          {/* Cheese/topping */}
          <mesh ref={pizzaRef} position={[0, 0.14, 0]}>
            <cylinderGeometry args={[1.25, 1.25, 0.05, 32]} />
            <meshStandardMaterial color="#ff4500" />
          </mesh>

          {/* Topping dots */}
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <mesh key={i} position={[Math.cos((i / 8) * Math.PI * 2) * 0.85, 0.15, Math.sin((i / 8) * Math.PI * 2) * 0.85]}>
              <circleGeometry args={[0.12, 16]} />
              <meshStandardMaterial color="#d2691e" />
            </mesh>
          ))}
        </Canvas>
      )}

      {/* Pizza name overlay */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center">
        <motion.h2
          className="text-h3 font-bold text-foreground"
          key={index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          {PIZZAS[index].name}
        </motion.h2>
      </div>

      {/* Controls */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        <AnimatePresence mode="wait">
          {PIZZAS.map((_, i) => (
            <motion.button
              key={i}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIndex(i)}
              className={`w-2 h-2 rounded-full transition-colors ${i === index ? "bg-primary" : "bg-border/50"}`}
              aria-label={`Slide to pizza ${i + 1}`}
            />
          ))}
        </AnimatePresence>
      </div>

      <button
        onClick={() => setIsPaused((p) => !p)}
        className="absolute top-4 right-4 p-2 rounded-full bg-background/80 backdrop-blur text-foreground hover:bg-background"
        aria-label={isPaused ? "Resume autoplay" : "Pause autoplay"}
      >
        {isPaused ? "▶" : "⏸"}
      </button>
    </div>
  );
}
