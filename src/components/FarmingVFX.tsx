import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Leaf, Sparkles, Droplets } from "lucide-react";

interface FarmingVFXProps {
  isDarkMode: boolean;
  isRainActive: boolean;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
}

export default function FarmingVFX({ isDarkMode, isRainActive }: FarmingVFXProps) {
  const [leaves, setLeaves] = useState<Particle[]>([]);
  const [seeds, setSeeds] = useState<Particle[]>([]);
  const [butterflies, setButterflies] = useState<Particle[]>([]);
  const [fireflies, setFireflies] = useState<Particle[]>([]);

  // Initialize particle values safely to avoid hydrations or layout shuffles
  useEffect(() => {
    // Generate 12 leaves
    const generatedLeaves = Array.from({ length: 12 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100, // percentage
      y: -10,
      size: Math.random() * 20 + 10,
      delay: Math.random() * 10,
      duration: Math.random() * 15 + 10,
    }));
    setLeaves(generatedLeaves);

    // Generate 15 seeds
    const generatedSeeds = Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: 110, // float upwards
      size: Math.random() * 6 + 4,
      delay: Math.random() * 5,
      duration: Math.random() * 12 + 8,
    }));
    setSeeds(generatedSeeds);

    // Generate 4 animated butterflies
    const generatedButterflies = Array.from({ length: 4 }).map((_, i) => ({
      id: i,
      x: Math.random() * 80 + 10,
      y: Math.random() * 80 + 10,
      size: Math.random() * 15 + 15,
      delay: Math.random() * 3,
      duration: Math.random() * 20 + 15,
    }));
    setButterflies(generatedButterflies);

    // Generate 18 fireflies for night mode
    const generatedFireflies = Array.from({ length: 18 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 90 + 5,
      size: Math.random() * 4 + 3,
      delay: Math.random() * 5,
      duration: Math.random() * 8 + 4,
    }));
    setFireflies(generatedFireflies);
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
      
      {/* 1. SUNLIGHT RAYS (Only shown during Daytime and when Rain is not intense) */}
      {!isDarkMode && !isRainActive && (
        <motion.div 
          className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-yellow-100/10 blur-3xl"
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.6, 0.8, 0.6]
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      )}
      
      {/* Dynamic sunlight beam angle sweeps */}
      {!isDarkMode && (
        <div className="absolute top-0 right-0 w-[400px] h-[400px] origin-top-right">
          <motion.div
            className="w-full h-full bg-gradient-to-l from-yellow-300/[0.04] to-transparent"
            style={{ clipPath: "polygon(100% 0, 100% 100%, 0 50%)" }}
            animate={{
              rotate: [-2, 3, -2],
              opacity: isRainActive ? 0.05 : [0.4, 0.6, 0.4],
            }}
            transition={{
              duration: 18,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>
      )}

      {/* 2. FLOATING LEAVES (Wind-like sweeping movement from left-to-right) */}
      {leaves.map((leaf) => (
        <motion.div
          key={`leaf-${leaf.id}`}
          className="absolute text-emerald-500/20"
          style={{
            left: `${leaf.x}%`,
            top: `${leaf.y}%`,
            width: leaf.size,
            height: leaf.size,
          }}
          initial={{ y: -50, opacity: 0, rotate: 0 }}
          animate={{
            y: ["0vh", "110vh"],
            x: [`${leaf.x}%`, `${leaf.x + (leaf.id % 2 === 0 ? 15 : -15)}%`],
            rotate: [0, 360 * (leaf.id % 2 === 0 ? 1 : -1)],
            opacity: [0, 0.8, 0.8, 0],
          }}
          transition={{
            duration: leaf.duration,
            delay: leaf.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          <Leaf size={leaf.size} strokeWidth={1.5} className="fill-emerald-400/10" />
        </motion.div>
      ))}

      {/* 3. FLOATING SEEDS (Cottonwood fluffy seeds floating upwards) */}
      {seeds.map((seed) => (
        <motion.div
          key={`seed-${seed.id}`}
          className="absolute bg-white/30 rounded-full"
          style={{
            left: `${seed.x}%`,
            bottom: "-20px",
            width: seed.size,
            height: seed.size,
            boxShadow: "0 0 8px rgba(255, 255, 255, 0.5)",
          }}
          animate={{
            y: ["0vh", "-110vh"],
            x: [`${seed.x}%`, `${seed.x + (seed.id % 2 === 0 ? 8 : -8)}%`],
            opacity: [0, 0.7, 0.5, 0],
          }}
          transition={{
            duration: seed.duration,
            delay: seed.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* 4. FLYING BUTTERFLIES (Flapping scales flying in organic zig-zags) */}
      {butterflies.map((bf) => (
        <motion.div
          key={`bf-${bf.id}`}
          className="absolute flex items-center justify-center"
          style={{
            left: `${bf.x}%`,
            top: `${bf.y}%`,
          }}
          animate={{
            x: [
              `${bf.x}%`, 
              `${(bf.x + 20) % 100}%`, 
              `${(bf.x - 15 + 100) % 100}%`, 
              `${bf.x}%`
            ],
            y: [
              `${bf.y}%`, 
              `${(bf.y - 25 + 100) % 100}%`, 
              `${(bf.y + 15) % 100}%`, 
              `${bf.y}%`
            ],
            rotate: [0, 45, -30, 0],
          }}
          transition={{
            duration: bf.duration,
            delay: bf.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {/* Wings flapping container */}
          <div className="relative flex space-x-[2px] opacity-40 hover:opacity-80 transition-opacity">
            {/* Left Wing */}
            <motion.div
              className={`w-4 h-4 rounded-tl-full rounded-br-md rounded-bl-sm ${
                isDarkMode ? "bg-amber-300" : "bg-emerald-400"
              }`}
              animate={{ rotateY: [0, 80, 0] }}
              transition={{ duration: 0.25, repeat: Infinity, ease: "linear" }}
              style={{ transformOrigin: "right center" }}
            />
            {/* Body */}
            <div className="w-[2px] h-4 bg-gray-800 rounded-full dark:bg-white" />
            {/* Right Wing */}
            <motion.div
              className={`w-4 h-4 rounded-tr-full rounded-bl-md rounded-br-sm ${
                isDarkMode ? "bg-amber-300" : "bg-emerald-400"
              }`}
              animate={{ rotateY: [0, 80, 0] }}
              transition={{ duration: 0.25, repeat: Infinity, ease: "linear" }}
              style={{ transformOrigin: "left center" }}
            />
          </div>
        </motion.div>
      ))}

      {/* 5. RAIN EFFECTS (Canvas-like raindrop streaks falling down vertically) */}
      <AnimatePresence>
        {isRainActive && (
          <div className="absolute inset-0 z-20">
            {Array.from({ length: 40 }).map((_, i) => {
              const startX = Math.random() * 100;
              const delay = Math.random() * 2;
              const duration = Math.random() * 0.8 + 0.6;
              return (
                <motion.div
                  key={`rain-${i}`}
                  className="absolute w-[1.5px] bg-gradient-to-b from-blue-300/40 via-sky-200/50 to-white/0"
                  style={{
                    left: `${startX}%`,
                    top: "-50px",
                    height: `${Math.random() * 40 + 30}px`,
                  }}
                  initial={{ opacity: 0 }}
                  animate={{
                    y: ["0vh", "110vh"],
                    opacity: [0, 1, 1, 0]
                  }}
                  transition={{
                    duration,
                    delay,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />
              );
            })}
          </div>
        )}
      </AnimatePresence>

      {/* 6. FIREFLIES (Only active during Dark / Night Mode) */}
      <AnimatePresence>
        {isDarkMode && (
          <div className="absolute inset-0 z-15">
            {fireflies.map((ff) => (
              <motion.div
                key={`firefly-${ff.id}`}
                className="absolute rounded-full bg-yellow-300"
                style={{
                  left: `${ff.x}%`,
                  top: `${ff.y}%`,
                  width: ff.size,
                  height: ff.size,
                  boxShadow: "0 0 10px #fcd34d, 0 0 20px #fbbf24",
                }}
                animate={{
                  y: [`${ff.y}%`, `${ff.y - 12}%`, `${ff.y + 4}%`, `${ff.y}%`],
                  x: [`${ff.x}%`, `${ff.x + 8}%`, `${ff.x - 6}%`, `${ff.x}%`],
                  opacity: [0.1, 1, 0.3, 1, 0.1],
                  scale: [0.8, 1.2, 0.9, 1.1, 0.8]
                }}
                transition={{
                  duration: ff.duration,
                  delay: ff.delay,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>
        )}
      </AnimatePresence>
      
    </div>
  );
}
