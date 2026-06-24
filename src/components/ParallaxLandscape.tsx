import React from "react";
import { motion } from "motion/react";

interface ParallaxLandscapeProps {
  isDarkMode: boolean;
  growProgress: number; // 0 to 100 representing crop maturity
}

export default function ParallaxLandscape({ isDarkMode, growProgress }: ParallaxLandscapeProps) {
  // Normalize crop height
  const scaleY = 0.4 + (growProgress / 100) * 0.6; // Scale crop size dynamically with user history!

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
      
      {/* 1. SKY BASE WITH INCREDIBLY BEAUTIFUL DAY & NIGHT PALETTES */}
      <div 
        className={`absolute inset-0 transition-all duration-[2000ms] ease-in-out ${
          isDarkMode 
            ? "bg-gradient-to-b from-[#06140a] via-[#092211] to-[#0c3017]" // Clean dark forest backdrop
            : "bg-gradient-to-b from-[#EBFBEF] via-[#F5FFF5] to-white" // Ultra-clean agricultural fresh morning sky (light fresh mint green)
        }`}
      />

      {/* Sun Ray Atmospheric Flare Effect */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Golden glow from top right corner */}
        <div className={`absolute top-[-20%] right-[-10%] w-[700px] h-[700px] rounded-full blur-[120px] transition-all duration-[2000ms] ${
          isDarkMode 
            ? "bg-emerald-500/10" 
            : "bg-gradient-to-br from-amber-200/40 via-yellow-100/20 to-transparent"
        }`} />
        
        {/* Soft emerald light source from bottom left */}
        <div className={`absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full blur-[100px] transition-all duration-[2000ms] ${
          isDarkMode 
            ? "bg-emerald-900/25" 
            : "bg-[#2E7D32]/5"
        }`} />
      </div>

      {/* 2. SOLAR CELESTIAL ORBIT (SOL/LUNA) */}
      <motion.div
        className="absolute left-1/2 -translate-x-1/2 origin-bottom pointer-events-none"
        style={{ bottom: "25vh" }}
        animate={{
          y: isDarkMode ? 60 : 0, 
          opacity: [0.9, 1, 0.9],
        }}
        transition={{ duration: 2, ease: "easeInOut" }}
      >
        {!isDarkMode ? (
          // Radiant Morning Sun
          <div className="relative flex items-center justify-center">
            <motion.div 
              className="absolute w-36 h-36 rounded-full bg-amber-200/20 blur-xl"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div 
              className="absolute w-28 h-28 rounded-full bg-yellow-300/40 blur-md"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-200 shadow-[0_0_40px_rgba(251,191,36,0.6)]" />
          </div>
        ) : (
          // Radiant Harvesting Pearl Moon
          <div className="relative flex items-center justify-center">
            <motion.div 
              className="absolute w-32 h-32 rounded-full bg-emerald-200/10 blur-xl"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            />
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-slate-200 to-emerald-50 shadow-[0_0_30px_rgba(255,255,255,0.4)]" />
          </div>
        )}
      </motion.div>

      {/* 3. CLOUDS SLOW PATROL */}
      <div className="absolute inset-x-0 top-[10vh] h-[20vh] overflow-hidden">
        {/* Cloud 1 */}
        <motion.div
          className="absolute opacity-30 dark:opacity-10"
          initial={{ x: "-200px" }}
          animate={{ x: "100vw" }}
          transition={{ duration: 180, repeat: Infinity, ease: "linear" }}
        >
          <svg className="w-48 h-16 text-white" viewBox="0 0 100 40" fill="currentColor">
            <path d="M 20 30 a 10 10 0 0 1 10 -10 a 15 15 0 0 1 25 -5 a 12 12 0 0 1 20 5 a 10 10 0 0 1 5 10 z" />
          </svg>
        </motion.div>
        
        {/* Cloud 2 */}
        <motion.div
          className="absolute opacity-20 dark:opacity-5"
          initial={{ x: "-300px" }}
          animate={{ x: "100vw" }}
          transition={{ duration: 130, repeat: Infinity, ease: "linear", delay: 40 }}
        >
          <svg className="w-64 h-24 text-white" viewBox="0 0 100 40" fill="currentColor">
            <path d="M 15 35 a 12 12 0 0 1 12 -12 a 18 18 0 0 1 30 -7 a 15 15 0 0 1 22 7 a 12 12 0 0 1 8 12 z" />
          </svg>
        </motion.div>
      </div>

      {/* 4. DISTANT HILLS & AGRICULTURAL TERRACES */}
      <div className="absolute inset-x-0 bottom-0 h-[45vh] pointer-events-none">
        {/* Far Hills Layer */}
        <div className="absolute bottom-0 w-full h-[300px] z-0 overflow-hidden">
          <svg 
            className={`w-full h-full preserve-3d transition-all duration-[2000ms] ease-in-out opacity-45 ${
              isDarkMode ? "text-[#061e0d]" : "text-[#81C784]"
            }`} 
            viewBox="0 0 1440 300" 
            preserveAspectRatio="none"
            fill="currentColor"
          >
            <path d="M0,150 Q360,50 720,150 Q1080,250 1440,150 L1440,300 L0,300 Z" />
          </svg>
        </div>

        {/* Mid Hills Crop Terrace Layer */}
        <div className="absolute bottom-0 w-full h-[220px] z-10 overflow-hidden">
          <svg 
            className={`w-full h-full preserve-3d transition-all duration-[2000ms] ease-in-out opacity-65 ${
              isDarkMode ? "text-[#0d2d14]" : "text-[#4CAF50]"
            }`} 
            viewBox="0 0 1440 220" 
            preserveAspectRatio="none"
            fill="currentColor"
          >
            <path d="M0,110 Q300,30 600,110 Q900,190 1440,110 L1440,220 L0,220 Z" />
          </svg>
        </div>

        {/* Near Field Gradient Overlay */}
        <div className={`absolute bottom-0 inset-x-0 h-40 z-20 bg-gradient-to-t transition-all duration-[2000ms] ${
          isDarkMode 
            ? "from-[#0c3017] via-[#0d2d14]/40 to-transparent" 
            : "from-[#F5FFF5] via-[#E8F5E9]/40 to-transparent"
        }`} />
      </div>

      {/* 5. MIDDLE GROUND SWAYING WHEAT FIELD (Animated naturally) */}
      <div className="absolute inset-x-0 bottom-0 h-[22vh] z-30">
        <svg 
          className={`w-full h-full transition-colors duration-[2000ms] ${
            isDarkMode ? "text-[#0e3b1a]" : "text-[#2e7d32]/90"
          }`}
          viewBox="0 0 1440 200" 
          preserveAspectRatio="none"
          fill="currentColor"
        >
          {/* Subtle sway motion */}
          <motion.path 
            d="M0,120 L120,110 C240,100 480,80 720,95 C960,110 1200,130 1320,140 L1440,150 L1440,200 L0,200 Z" 
            animate={{
              d: [
                "M0,120 L120,110 C240,100 480,80 720,95 C960,110 1200,130 1320,140 L1440,150 L1440,200 L0,200 Z",
                "M0,115 L120,118 C240,95 480,85 720,90 C960,115 1200,125 1320,135 L1440,155 L1440,200 L0,200 Z",
                "M0,120 L120,110 C240,100 480,80 720,95 C960,110 1200,130 1320,140 L1440,150 L1440,200 L0,200 Z"
              ]
            }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          />
        </svg>

        {/* Individual swaying paddy crops representing "planting crops like paddy" */}
        <div className="absolute inset-x-0 top-0 bottom-0 flex justify-around items-end overflow-hidden z-20">
          {Array.from({ length: 12 }).map((_, i) => {
            const height = 65 + (i % 3) * 12;
            const swayDuration = 3 + (i % 4) * 0.8;
            const swayDelay = -i * 0.4;
            
            return (
              <motion.div
                key={`paddy-${i}`}
                className="w-1 relative"
                style={{ height: `${height}px`, transformOrigin: "bottom center" }}
                animate={{
                  rotate: [-2, 3, -2],
                }}
                transition={{
                  duration: swayDuration,
                  delay: swayDelay,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                {/* Paddy Seedling Pairs (Vibrant Green Blades with water ripple circle) */}
                <svg
                  className={`absolute bottom-0 -left-4 w-9 h-full transition-colors duration-[2000ms] ${
                    isDarkMode ? "text-emerald-500/40" : "text-emerald-600/90"
                  }`}
                  viewBox="0 0 40 120"
                  fill="currentColor"
                >
                  <path d="M20,120 L20,60" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                  {/* Rice seedlings pointing outwards */}
                  <path d="M20,95 Q10,75 5,55 Q13,70 20,95 Z" fill="currentColor" />
                  <path d="M20,95 Q30,75 35,55 Q27,70 20,95 Z" fill="currentColor" />
                  
                  <path d="M20,110 Q12,90 8,75 Q16,85 20,110 Z" fill="currentColor" />
                  <path d="M20,110 Q28,90 32,75 Q24,85 20,110 Z" fill="currentColor" />
                </svg>

                {/* Sparkling water ripple at the base of the paddy plants */}
                <motion.div 
                  className="absolute bottom-[-2px] left-[-16px] w-[34px] h-[6px] border border-emerald-400/30 rounded-full"
                  animate={{
                    scale: [0.8, 1.4, 0.8],
                    opacity: [0.3, 0.7, 0.3]
                  }}
                  transition={{
                    duration: swayDuration + 1,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* 6. FRONT GROUND INTERACTIVE THEMED MODULES (PADDY FIELD, TREE PLANTING, WASTE REMOVAL AREA) */}
      <div className="absolute inset-x-0 bottom-0 h-[24vh] z-40 pointer-events-none flex justify-between items-end px-6 md:px-16 pb-2">
        
        {/* Module A: Planting Crops like Paddy (Flooded Terrace with Row Layout) */}
        <div className="flex flex-col items-center select-none">
          <div className="flex gap-2 mb-1">
            {/* Flooded water paddy terrace rows */}
            <div className="bg-sky-400/20 dark:bg-emerald-500/10 border border-sky-400/40 backdrop-blur-sm px-2.5 py-1 rounded-xl flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
              <span className="text-[10px] font-bold text-sky-800 dark:text-sky-300 uppercase tracking-wider">Paddy Terrace</span>
            </div>
            <div className="hidden md:flex bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-xl items-center gap-1">
              <span className="text-[10px] font-semibold text-emerald-800 dark:text-emerald-300">Auto Water Table</span>
            </div>
          </div>

          <div className="relative w-44 h-16 bg-gradient-to-b from-[#80deea]/30 to-[#4dd0e1]/30 dark:from-[#0d47a1]/20 dark:to-[#006064]/20 rounded-t-3xl border-t border-sky-300/40 dark:border-sky-500/20 shadow-lg flex items-center justify-around px-3">
            {/* Row Seedlings */}
            {[0, 1, 2].map((idx) => (
              <motion.div 
                key={`paddy-field-item-${idx}`}
                animate={{ rotate: [-4, 4, -4] }}
                transition={{ duration: 2.5 + idx * 0.4, repeat: Infinity, ease: "easeInOut" }}
                className="flex flex-col items-center justify-end h-10"
              >
                {/* Cute paddy plant seedling bundle */}
                <svg className="w-7 h-8 text-[#4CAF50] dark:text-[#81C784]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12,24 C12,24 8,14 4,11 C7,12 10,13 12,18 C14,13 17,12 20,11 C16,14 12,24 12,24 Z" />
                  <path d="M12,24 C12,14 10,7 6,5 C9,6 11,9 12,14 C13,9 15,6 18,5 C14,7 12,24 12,24 Z" opacity="0.8" />
                </svg>
                {/* Concave water ripples */}
                <span className="w-6 h-1.5 border border-sky-400/55 rounded-full absolute bottom-1 animate-ping" style={{ animationDuration: "3s" }} />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Module B: Planting Trees (Live growing Sapling under soil support) */}
        <div className="flex flex-col items-center select-none">
          <div className="flex gap-2 mb-1">
            <div className="bg-amber-500/15 border border-amber-500/20 backdrop-blur-sm px-2.5 py-1 rounded-xl flex items-center gap-1">
              <span className="text-[10px] font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider flex items-center gap-1">
                🌳 Tree Planting
              </span>
            </div>
            {growProgress > 50 && (
              <div className="hidden md:flex bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded text-[9px] text-[#2E7D32] dark:text-emerald-300 font-semibold">
                Fertile
              </div>
            )}
          </div>

          <div className="relative w-44 h-20 bg-gradient-to-t from-[#5d4037]/90 to-[#8d6e63]/80 rounded-t-[32px] border-t-2 border-amber-800/30 flex flex-col justify-end items-center shadow-lg pt-1">
            {/* Animated growing sapling */}
            <motion.div 
              style={{ scaleY }} 
              className="origin-bottom flex flex-col items-center -mb-1 z-30"
            >
              {/* Fresh Sapling Tree leaves */}
              <svg className="w-12 h-12 text-[#2E7D32] dark:text-[#66BB6A] drop-shadow-md" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12,2 C12,2 5,8 5,13 C5,17 8,19 12,19 C16,19 19,17 19,13 C19,8 12,2 12,2 Z" />
                <path d="M12,5 Q14,8 16,12 Q14,14 12,15 Q10,14 8,12 Q10,8 12,5 Z" fill="#81C784" />
              </svg>
              {/* Supportive wooden stake */}
              <div className="absolute bottom-0 w-[4px] h-10 bg-amber-900 border-r border-amber-700 rounded-sm translate-x-2 rotate-12 opacity-80" />
            </motion.div>

            {/* Spade Tool leaning against the planting mound */}
            <svg className="absolute bottom-1 right-2 w-6 h-6 text-slate-300 drop-shadow rotate-[15deg] opacity-90" viewBox="0 0 24 24" fill="currentColor">
              <rect x="11" y="2" width="2" height="12" fill="#8d6e63" />
              <path d="M8,14 L16,14 L14,21 L10,21 Z" fill="#78909c" />
              <circle cx="12" cy="2" r="2" fill="#5d4037" />
            </svg>
            
            {/* Compost nutrient rich tag */}
            <div className="absolute bottom-5 left-2 text-[8px] font-mono font-bold tracking-tight text-amber-200/90 whitespace-nowrap bg-black/30 px-1 rounded">
              CO₂ OFFSET
            </div>
          </div>
        </div>

        {/* Module C: Remote waste from Field & Keep it clean (Zero waste system) */}
        <div className="flex flex-col items-center select-none">
          <div className="flex gap-2 mb-1">
            <div className="bg-[#2E7D32]/10 dark:bg-emerald-500/10 border border-[#2E7D32]/20 dark:border-emerald-500/20 backdrop-blur-sm px-2.5 py-1 rounded-xl flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold text-[#2E7D32] dark:text-emerald-300 uppercase tracking-wider">Pristine Field</span>
            </div>
          </div>

          <div className="relative w-44 h-16 bg-gradient-to-b from-[#3e2723]/95 to-[#1b0000]/95 rounded-t-3xl border-t border-emerald-500/30 flex items-center justify-center p-2 shadow-xl">
            {/* Grid rows representing ultra clean, perfectly managed, waste-free soil */}
            <div className="absolute inset-0 flex flex-col justify-around py-2 opacity-35">
              <div className="h-[2px] w-full bg-emerald-500/25" />
              <div className="h-[2px] w-full bg-emerald-500/25" />
              <div className="h-[2px] w-full bg-emerald-500/25" />
            </div>

            {/* Sparkle effects popping from clean soil as dynamic confirmation of no waste */}
            <div className="absolute top-1 left-4">
              <motion.span 
                animate={{ scale: [0.3, 1, 0.3], opacity: [0, 1, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-yellow-300 text-xs block"
              >
                ✦
              </motion.span>
            </div>
            <div className="absolute top-3 right-6">
              <motion.span 
                animate={{ scale: [0.3, 1.2, 0.3], opacity: [0, 1, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
                className="text-yellow-300 text-[10px] block"
              >
                ✦
              </motion.span>
            </div>

            {/* Clean farm rake & organic sorting bin logo */}
            <div className="flex items-center space-x-2.5 z-10 bg-black/45 px-3 py-1.5 rounded-2xl border border-emerald-500/25">
              <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <div className="flex flex-col">
                <span className="text-[8px] font-bold text-white uppercase tracking-wider leading-none">Discarded Waste</span>
                <span className="text-[7px] text-emerald-300 font-mono font-medium leading-none mt-0.5">0% Clean</span>
              </div>
            </div>
          </div>
        </div>

      </div>
      
    </div>
  );
}
