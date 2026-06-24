import React from "react";
import { motion } from "motion/react";

interface VoiceWaveformProps {
  isListening: boolean;
  isThinking: boolean;
  isSpeaking: boolean;
  activeColor?: string;
}

export default function VoiceWaveform({ isListening, isThinking, isSpeaking, activeColor }: VoiceWaveformProps) {
  const bars = Array.from({ length: 18 });

  if (!isListening && !isThinking && !isSpeaking) {
    return (
      <div className="h-10 flex items-center justify-center space-x-1 opacity-20">
        {bars.map((_, i) => (
          <div key={i} className="w-[3px] h-2 bg-emerald-600 rounded-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="h-16 flex items-end justify-center space-x-1.5 px-4 bg-emerald-50/50 dark:bg-emerald-950/20 py-2 rounded-full border border-emerald-100/50 dark:border-emerald-900/10 backdrop-blur-md">
      {bars.map((_, i) => {
        // Generate pseudo-random animations or synchronized heights
        let duration = 0.5 + Math.random() * 0.7;
        let scaleRange = [0.3, 1, 0.3];
        
        if (isThinking) {
          // Sync pulse
          duration = 1.2;
          scaleRange = [0.2, 0.6, 1, 0.6, 0.2];
        } else if (isSpeaking) {
          duration = 0.4 + (i % 4) * 0.15;
          scaleRange = [0.1, 1.3, 0.1];
        } else if (isListening) {
          duration = 0.3 + (i % 3) * 0.12;
          scaleRange = [0.2, 1.5, 0.2];
        }

        return (
          <motion.div
            key={i}
            className={`w-[4px] rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)] ${
              isThinking 
                ? "bg-amber-400" 
                : isSpeaking 
                ? "bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.5)]" 
                : "bg-emerald-500"
            }`}
            style={{ height: "100%" }}
            animate={{
              scaleY: scaleRange,
            }}
            transition={{
              duration,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.04,
            }}
          />
        );
      })}
    </div>
  );
}
