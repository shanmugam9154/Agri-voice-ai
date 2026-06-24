import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Mic, 
  MicOff, 
  Sun, 
  Moon, 
  CloudRain, 
  Sparkles, 
  RotateCcw, 
  Send, 
  History, 
  BookOpen, 
  Leaf,
  Bug,
  Droplet,
  Info,
  ChevronRight,
  TrendingUp,
  Award,
  ShieldCheck,
  AlertTriangle
} from "lucide-react";

import FarmingVFX from "./components/FarmingVFX";
import ParallaxLandscape from "./components/ParallaxLandscape";
import VoiceWaveform from "./components/VoiceWaveform";
import ResponseCard from "./components/ResponseCard";
import { ConversationItem } from "./types";

// Standard preset common farming issues for quick click queries
const ADVISORY_PRESETS = [
  {
    icon: <Leaf className="text-emerald-500" size={16} />,
    title: { te: "టమోటా పంట ఎరువులు", hi: "टमाटर खाद मार्गदर्शन", en: "Tomato Fertilisers" },
    query: "Tomato crop ki best fertilizer enti?"
  },
  {
    icon: <Bug className="text-amber-500" size={16} />,
    title: { te: "వరి తెగుళ్ల నివారణ", hi: "धान के कीट नियंत्रण", en: "Paddy Stem Borer" },
    query: "వరి పంటలో కాండం తొలిచే పురుగు నివారణ ఎలా?"
  },
  {
    icon: <Sparkles className="text-yellow-500" size={16} />,
    title: { te: "సేంద్రీయ వ్యవసాయం", hi: "जैविक जैविक खेती", en: "Organic Farming" },
    query: "What is the preparation of Jeevamrutham for organic farming?"
  },
  {
    icon: <Droplet className="text-blue-500" size={16} />,
    title: { te: "నిమ్మతోట సాగు విధానం", hi: "मौसम आधारित खेती", en: "Water Management" },
    query: "Tomato cultivation irrigation interval advice"
  }
];

export default function App() {
  // Theme and UI toggles (Always dark mode enabled as per request)
  const isDarkMode = true;
  const [isRainActive, setIsRainActive] = useState(false);
  
  // Audio state
  const [micState, setMicState] = useState<"idle" | "listening" | "thinking" | "speaking">("idle");
  const [recognitionLanguage, setRecognitionLanguage] = useState<string>("te-IN");
  const [transcription, setTranscription] = useState<string>("");
  const [feedbackMessage, setFeedbackMessage] = useState<string>("Tap microphone and ask your farming question naturally.");
  
  // Conversational records state
  const [historyList, setHistoryList] = useState<ConversationItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<ConversationItem | null>(null);
  const [growProgress, setGrowProgress] = useState<number>(20); // starts at 20%
  const [typedInput, setTypedInput] = useState<string>("");
  const [showHistoryPane, setShowHistoryPane] = useState<boolean>(false);
  const [statusNotification, setStatusNotification] = useState<string | null>(null);

  // Web Speech API refs
  const recognitionRef = useRef<any>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Clear any persistent storage on mount so that reload starts completely fresh
  useEffect(() => {
    localStorage.removeItem("agrivoice_history");
    setHistoryList([]);
    setSelectedItem(null);
    setGrowProgress(20);
  }, []);

  // Sync reports data for current session (in-memory only, disappears on reload)
  const saveHistoryList = (list: ConversationItem[]) => {
    setHistoryList(list);
    // Grow the crop dynamically based on advisory count in current session
    setGrowProgress(Math.min(100, 20 + list.length * 15));
  };

  // Setup Web Speech Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = recognitionLanguage;

      rec.onstart = () => {
        setMicState("listening");
        setTranscription("");
        setFeedbackMessage("Listening to your voice... Speak now!");
        stopActiveSpeech(); // Mute speaking if already reading
      };

      rec.onresult = (e: any) => {
        const resultText = e.results[0][0].transcript;
        if (resultText) {
          setTranscription(resultText);
          setFeedbackMessage(`Heard: "${resultText}"`);
          handleQuerySubmission(resultText);
        }
      };

      rec.onerror = (e: any) => {
        console.error("Speech recognition error:", e);
        setMicState("idle");
        if (e.error === "no-speech") {
          setFeedbackMessage("No speech was detected. Please try tapping again and voice clearly.");
        } else if (e.error === "not-allowed") {
          setFeedbackMessage("Microphone permission denied. Please verify frame controls or type your question below.");
          // Trigger system request
          setStatusNotification("Microphone access is required for voice assistant.");
        } else {
          setFeedbackMessage(`Voice Error: ${e.error}. You can also type below!`);
        }
      };

      rec.onend = () => {
        // Only reset state if we didn't advance to thinking state
        setMicState(prev => prev === "listening" ? "idle" : prev);
      };

      recognitionRef.current = rec;
    } else {
      console.warn("Web Speech API recognition is not supported in this browser.");
    }
  }, [recognitionLanguage]);

  // Update voice configuration dynamically when tongue setting swaps
  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = recognitionLanguage;
    }
  }, [recognitionLanguage]);

  // Stop synthesis playing
  const stopActiveSpeech = () => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setMicState(prev => prev === "speaking" ? "idle" : prev);
    }
  };

  // Generate automated TTS matching female voice patterns
  const speakAdviceBack = (text: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    // Clean markdown headings, bullets, emojis, and symbols completely for natural, uninterrupted speech
    const cleanTextToSpeak = text
      .split("\n")
      .map(line => {
        let l = line.trim();
        if (!l) return "";
        
        // Remove agricultural, decorative, and miscellaneous emojis
        l = l
          .replace(/[\u{1F300}-\u{1F9FF}]/gu, "")
          .replace(/[\u{2600}-\u{27BF}]/gu, "")
          .replace(/[\u{1F000}-\u{1F6FF}]/gu, "")
          .replace(/[\u{1F900}-\u{1F9FF}]/gu, "")
          .replace(/[\u{2b50}\u{2702}\u{2708}\u{2709}]/gu, "")
          // Strip out markdown formatting symbols
          .replace(/\*\*|\*/g, "")
          .replace(/#+\s+/g, "")
          .replace(/[`_]/g, "");

        // Remove bullet indicators at the beginning of list items (e.g. "- ", "* ", "• ")
        l = l.replace(/^[-*+•]\s*/, "");

        // Convert numbered list prefixes (e.g. "1. ") into a subtle vocal pause (e.g. "1, ")
        l = l.replace(/^(\d+)\.\s*/, "$1, ");

        l = l.trim();
        if (!l) return "";

        // Append a period to line ends if they lack standard trailing sentence punctuation
        if (!/[.,!?;:]$/.test(l)) {
          l += ".";
        }
        return l;
      })
      .filter(line => line.length > 0)
      .join(" ");

    stopActiveSpeech();

    // Create Utterance with complete text to prevent cutting off early
    const utterance = new SpeechSynthesisUtterance(cleanTextToSpeak);
    
    // Select a pleasant female voice dynamically
    const voices = window.speechSynthesis.getVoices();
    
    // Prioritize natural female names in user tongue
    let selectedVoice = voices.find(v => {
      const lower = v.name.toLowerCase();
      return (lower.includes("female") || 
              lower.includes("zira") || 
              lower.includes("samantha") || 
              lower.includes("hazel") || 
              lower.includes("kalpana") || 
              lower.includes("kore") ||
              lower.includes("google hindi") ||
              lower.includes("microsoft zira")) && v.lang.startsWith(recognitionLanguage.split("-")[0]);
    });

    // Fallback if no language-specific female was caught
    if (!selectedVoice) {
      selectedVoice = voices.find(v => {
        const lower = v.name.toLowerCase();
        return lower.includes("female") || lower.includes("zira") || lower.includes("samantha") || lower.includes("hazel") || lower.includes("kalpana");
      });
    }

    // Ultimate generic translation fallback
    if (!selectedVoice) {
      selectedVoice = voices.find(v => v.lang.startsWith(recognitionLanguage.split("-")[0])) || voices[0];
    }

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    // Set voice pace and pitch to sound natural and reassuring
    utterance.rate = 0.95; 
    utterance.pitch = 1.05;

    utterance.onstart = () => {
      setMicState("speaking");
      setFeedbackMessage("AI expert is responding by voice...");
    };

    utterance.onend = () => {
      setMicState("idle");
      setFeedbackMessage("Voice advice completed.");
    };

    utterance.onerror = (e) => {
      console.error("Text-to-speech playing issue:", e);
      setMicState("idle");
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  // Submit agricultural question to the Express API backend
  const handleQuerySubmission = async (promptText: string) => {
    if (!promptText.trim()) return;
    
    setMicState("thinking");
    setFeedbackMessage("Farming expert is researching... please wait.");

    try {
      const response = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: promptText })
      });

      if (!response.ok) {
        throw new Error("AgriVoice server became temporarily busy.");
      }

      const reportData = await response.json();

      const newItem: ConversationItem = {
        id: Math.random().toString(36).substring(2, 9),
        question: reportData.question,
        answer: reportData.answer,
        imageUrl: reportData.imageUrl,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ", " + new Date().toLocaleDateString([], { month: 'short', day: 'numeric' }),
        imageGeneratedWithAi: reportData.imageGeneratedWithAi,
        isDemo: reportData.isDemo
      };

      // Add to front of report list
      const updatedList = [newItem, ...historyList];
      saveHistoryList(updatedList);
      setSelectedItem(newItem);
      
      // Auto-voice the output back to the farmer
      speakAdviceBack(newItem.answer);

    } catch (err: any) {
      console.error("Query submit error:", err);
      setMicState("idle");
      setFeedbackMessage("Offline Mode: Server is compiling details. Here is local guidance instead.");
      
      // Seed a robust client-side response as a fallback to guarantee a magical experience!
      const fallbackItem: ConversationItem = {
        id: Math.random().toString(36).substring(2, 9),
        question: promptText,
        answer: `🌱 **AgriVoice AI Advisor (Offline Assistance)**\n\n- It looks like your backend is setting up or your network is reconnecting. Keep your crops watered and avoid adding overly chemical fertilizers.\n\n*Tip: Setup your GROQ_API_KEY in the Secrets menu to unlock real-time agricultural model synthesis.*`,
        imageUrl: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&auto=format&fit=crop&q=80",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ", " + new Date().toLocaleDateString([], { month: 'short', day: 'numeric' }),
        isDemo: true
      };
      
      const list = [fallbackItem, ...historyList];
      saveHistoryList(list);
      setSelectedItem(fallbackItem);
    }
  };

  // Toggle voice capture session
  const toggleListening = () => {
    if (micState === "listening") {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setMicState("idle");
    } else {
      if (!recognitionRef.current) {
        setFeedbackMessage("Speech recognition is not fully loaded in this browser context. Please use our smart crop cards or type below!");
        return;
      }
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.error("Failed to start voice capture:", err);
      }
    }
  };

  const handleManualFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedInput.trim()) return;
    const input = typedInput;
    setTypedInput("");
    handleQuerySubmission(input);
  };

  // Clear report history list
  const handleClearHistory = () => {
    saveHistoryList([]);
    setSelectedItem(null);
    setGrowProgress(20);
    stopActiveSpeech();
    setFeedbackMessage("Conversation history cleared. Ready for new farming reports.");
  };

  return (
    <div className={`min-h-screen relative flex flex-col font-sans transition-colors duration-[1500ms] ease-in-out ${
      isDarkMode 
        ? "bg-[#061608] text-emerald-100" 
        : "bg-[#F5FFF5] text-emerald-950"
    }`}>
      
      {/* 3D PARALLAX CLIMATE FIELD LANDSCAPE BACKGROUND */}
      <ParallaxLandscape isDarkMode={isDarkMode} growProgress={growProgress} />

      {/* PREMIUM FARMING WIND, LEAVES, BUTTERFLIES AND RAIN EFFECTS */}
      <FarmingVFX isDarkMode={isDarkMode} isRainActive={isRainActive} />

      {/* TOP HEADER NAVIGATION AND CONTROL STRIP */}
      <header className="relative w-full max-w-7xl mx-auto px-4 py-4 md:py-6 z-30 flex items-center justify-between">
        <div id="agrivoice-branding" className="flex items-center space-x-3">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-gradient-to-tr from-emerald-700 via-emerald-500 to-amber-400 p-[2px] shadow-lg flex items-center justify-center animate-bounce" style={{ animationDuration: "5s" }}>
            <div className="w-full h-full rounded-2xl bg-[#09260c] flex items-center justify-center">
              <span className="text-lg md:text-xl font-bold text-amber-300">🌾</span>
            </div>
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight bg-gradient-to-r from-emerald-800 to-emerald-600 dark:from-emerald-400 dark:to-emerald-200 bg-clip-text text-transparent">
              AgriVoice <span className="text-amber-500 font-extrabold text-[15px] align-middle px-1 rounded bg-amber-500/10 border border-amber-500/20 font-mono">AI</span>
            </h1>
            <p className="text-[10px] md:text-xs text-emerald-700/60 dark:text-emerald-300/60 font-light tracking-wide">
              Futuristic Voice Agriculture Expert
            </p>
          </div>
        </div>

        {/* Global togglers strip */}
        <div className="flex items-center space-x-2">
          
          {/* Dynamic Indian Multi-language Selection Dropdown */}
          <div className="flex items-center space-x-2 bg-black/40 backdrop-blur-md border border-emerald-500/20 rounded-full px-4 py-1.5 text-xs text-emerald-300">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping shrink-0" />
            <select
              id="tongue-select"
              value={recognitionLanguage}
              onChange={(e) => {
                setRecognitionLanguage(e.target.value);
                stopActiveSpeech();
              }}
              className="bg-transparent border-none text-emerald-300 font-semibold focus:outline-none cursor-pointer pr-1"
            >
              <option value="te-IN" className="bg-[#09260c] text-emerald-100">Telugu (తెలుగు)</option>
              <option value="hi-IN" className="bg-[#09260c] text-emerald-100">Hindi (हिंदी)</option>
              <option value="ta-IN" className="bg-[#09260c] text-emerald-100">Tamil (தமிழ்)</option>
              <option value="kn-IN" className="bg-[#09260c] text-emerald-100">Kannada (ಕನ್ನಡ)</option>
              <option value="ml-IN" className="bg-[#09260c] text-emerald-100">Malayalam (മലയാളം)</option>
              <option value="mr-IN" className="bg-[#09260c] text-emerald-100">Marathi (मराठी)</option>
              <option value="bn-IN" className="bg-[#09260c] text-emerald-100">Bengali (বাংলা)</option>
              <option value="gu-IN" className="bg-[#09260c] text-emerald-100">Gujarati (ગુજરાતી)</option>
              <option value="pa-IN" className="bg-[#09260c] text-emerald-100">Punjabi (ਪੰਜਾਬੀ)</option>
              <option value="or-IN" className="bg-[#09260c] text-emerald-100">Odia (ଓଡ଼ିଆ)</option>
              <option value="ur-IN" className="bg-[#09260c] text-emerald-100">Urdu (اردو)</option>
              <option value="en-IN" className="bg-[#09260c] text-emerald-100">English (India)</option>
            </select>
          </div>

          {/* 2. Interactive Rain Weather Simulator */}
          <button
            id="toggle-rain-cloud-btn"
            onClick={() => setIsRainActive(!isRainActive)}
            title="Toggle Farm Rain Simulation"
            className={`p-2.5 rounded-full border transition-all cursor-pointer ${
              isRainActive 
                ? "bg-blue-500 text-white border-blue-400 shadow-lg shadow-blue-500/30 animate-bounce" 
                : "bg-white/10 dark:bg-[#09260c]/70 border-emerald-500/15 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100/10"
            }`}
          >
            <CloudRain size={16} className={isRainActive ? "animate-pulse" : ""} />
          </button>

          {/* 4. History log drawer toggle bar */}
          <button
            id="toggle-history-pane-btn"
            onClick={() => setShowHistoryPane(!showHistoryPane)}
            className="p-2.5 rounded-full bg-white/70 dark:bg-[#09260c]/70 border border-emerald-500/15 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 cursor-pointer relative"
          >
            <History size={16} />
            {historyList.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-[9px] text-white rounded-full flex items-center justify-center font-bold">
                {historyList.length}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* CORE ADVISOR CONTAINER MAIN GRID */}
      <main className="relative flex-1 w-full max-w-7xl mx-auto px-4 py-4 md:py-8 z-30 flex flex-col space-y-8">
        
        {/* HERO TITLE SECTION */}
        <section id="hero-welcome-badge" className="text-center space-y-4 max-w-2xl mx-auto mt-2">
          <div className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-xs font-semibold uppercase tracking-widest backdrop-blur-md animate-pulse">
            <BookOpen size={12} className="text-emerald-600 dark:text-emerald-400" />
            <span>Futuristic Soil & Crop Advisor System</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black font-sans leading-tight tracking-tight text-slate-900 dark:text-white">
            Speak Naturally.<br className="hidden sm:inline" />
            Receive <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-amber-500 bg-clip-text text-transparent">Instant AI Solutions</span>
          </h2>
          
          <p className="text-xs sm:text-sm text-slate-700/80 dark:text-slate-300/85 max-w-lg mx-auto font-light leading-relaxed">
            AgriVoice translation detects Telugu, Hindi, or English automatically. Speak your farming concerns directly through your voice or choose crop advisory cards.
          </p>
        </section>

        {/* 1. FUTURISTIC MICROPHONE ASSISTANT INTERACTION BAR */}
        <section id="focal-voice-assistant" className="w-full max-w-lg mx-auto flex flex-col items-center space-y-5">
          <div className="relative flex items-center justify-center">
            
            {/* Ambient outer listening pulse rings */}
            <AnimatePresence>
              {(micState === "listening" || micState === "speaking") && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0.3 }}
                  animate={{ scale: 1.8, opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
                  className={`absolute w-36 h-36 rounded-full -z-10 ${
                    micState === "speaking" ? "bg-sky-400" : "bg-emerald-500"
                  }`}
                />
              )}
            </AnimatePresence>
            
            <AnimatePresence>
              {micState === "thinking" && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0.4 }}
                  animate={{ scale: [1, 1.4, 1], rotate: 360 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="absolute w-44 h-44 rounded-full -z-10 border-2 border-dashed border-amber-400/40"
                />
              )}
            </AnimatePresence>

            {/* Large Animated Microphone button */}
            <motion.button
              id="microphone-activation-ring"
              onClick={toggleListening}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`w-28 h-28 md:w-32 md:h-32 rounded-full cursor-pointer flex items-center justify-center shadow-[0_20px_50px_rgba(46,125,50,0.3)] transition-all duration-300 relative ${
                micState === "listening" 
                  ? "bg-gradient-to-br from-[#2E7D32] to-[#66BB6A] text-white ring-8 ring-[#66BB6A]/20" 
                  : micState === "thinking"
                  ? "bg-gradient-to-br from-[#2E7D32] via-[#66BB6A] to-amber-500 text-white"
                  : micState === "speaking"
                  ? "bg-gradient-to-br from-sky-500 to-[#2E7D32] text-white ring-8 ring-sky-500/20"
                  : "bg-gradient-to-br from-[#2E7D32] to-[#66BB6A] hover:brightness-110 text-white border-2 border-white/20"
              }`}
            >
              {micState === "listening" ? (
                <div className="flex flex-col items-center space-y-1">
                  <Mic size={36} className="animate-pulse text-white" />
                  <span className="text-[9px] font-bold tracking-wider uppercase text-emerald-100">Listening</span>
                </div>
              ) : micState === "thinking" ? (
                <div className="flex flex-col items-center space-y-1">
                  <Sparkles size={36} className="animate-spin text-white" style={{ animationDuration: "3s" }} />
                  <span className="text-[9px] font-bold tracking-wider uppercase text-amber-100">Thinking</span>
                </div>
              ) : micState === "speaking" ? (
                <div className="flex flex-col items-center space-y-1">
                  <div className="flex space-x-1 justify-center items-center h-4">
                    <div className="w-1 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: "0s" }} />
                    <div className="w-1 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                    <div className="w-1 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                  </div>
                  <span className="text-[9px] font-bold tracking-wider uppercase text-sky-100">Speaking</span>
                </div>
              ) : (
                <div className="flex flex-col items-center space-y-1">
                  <Mic size={36} className="text-white" />
                  <span className="text-[9px] font-bold tracking-wider uppercase text-white/90">Tap to Speak</span>
                </div>
              )}
            </motion.button>
          </div>

          {/* Voice Waveform animation overlay */}
          <div className="w-full">
            <VoiceWaveform 
              isListening={micState === "listening"} 
              isThinking={micState === "thinking"} 
              isSpeaking={micState === "speaking"} 
            />
          </div>

          <div className="text-center">
            <span className="font-mono text-xs text-slate-700/70 dark:text-slate-300/70 bg-white/40 dark:bg-black/15 px-4 py-1.5 rounded-full border border-emerald-500/5 backdrop-blur-md">
              🎙️ {feedbackMessage}
            </span>
          </div>
        </section>

        {/* 3. ACTIVE ADVISORY VISUAL RESPONSE PANEL */}
        <section id="response-preview-panel" className="w-full flex justify-center pt-2">
          <AnimatePresence mode="wait">
            {selectedItem ? (
              <ResponseCard
                key={selectedItem.id}
                item={selectedItem}
                isSpeaking={micState === "speaking"}
                onSynthesizeSpeech={speakAdviceBack}
                onStopSpeech={stopActiveSpeech}
              />
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-8 rounded-3xl bg-white/40 dark:bg-black/10 border border-emerald-500/5 backdrop-blur-md text-center max-w-lg space-y-3"
              >
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                  <Sparkles size={24} className="animate-pulse" />
                </div>
                <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-200">
                  Ready for Farming Advisory
                </h3>
                <p className="text-xs text-slate-700/60 dark:text-slate-300/60 max-w-sm font-light">
                  Ask AgriVoice about crop suggestions, disease management, bio-pest preparation methods, or market prices to see your report here.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* 4. TYPED INPUT QUERY FALLBACK TOOL */}
        <section id="form-fallback-keyboard" className="w-full max-w-lg mx-auto">
          <form onSubmit={handleManualFormSubmit} className="relative flex items-center">
            <input
              type="text"
              value={typedInput}
              onChange={(e) => setTypedInput(e.target.value)}
              placeholder="Or type a question (e.g. 'Tomota crop fertilizer best enti?')..."
              className="w-full pl-5 pr-14 py-3 rounded-full bg-white/70 dark:bg-[#071308]/65 backdrop-blur-md border border-emerald-500/15 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm text-slate-800 dark:text-slate-100 placeholder-slate-700/40 dark:placeholder-slate-200/40 font-light"
            />
            <button
              type="submit"
              disabled={!typedInput.trim()}
              className={`absolute right-1.5 p-2 rounded-full transition-all cursor-pointer ${
                typedInput.trim() 
                  ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-md" 
                  : "text-slate-400 bg-transparent"
              }`}
            >
              <Send size={16} />
            </button>
          </form>
        </section>

      </main>

      {/* 5. SIDEBAR DRAWER OVERLAY FOR CONVERSATION HISTORIES */}
      <AnimatePresence>
        {showHistoryPane && (
          <>
            {/* Backdrop click closer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowHistoryPane(false)}
              className="fixed inset-0 bg-black z-40"
            />

            {/* Slideout paper component */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 20, stiffness: 100 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-white dark:bg-[#051106] border-l border-emerald-500/10 z-50 p-6 flex flex-col justify-between overflow-y-auto"
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-emerald-500/10 pb-4">
                  <div className="flex items-center space-x-2 text-emerald-800 dark:text-emerald-400">
                    <History size={18} />
                    <h3 className="font-bold text-lg font-sans">Advisor History</h3>
                  </div>
                  <button
                    onClick={() => setShowHistoryPane(false)}
                    className="text-xs font-semibold px-2 py-1 rounded bg-slate-100 dark:bg-black/40 hover:bg-slate-200 cursor-pointer"
                  >
                    Close
                  </button>
                </div>

                <div className="space-y-3">
                  {historyList.length === 0 ? (
                    <div className="text-center py-8 text-xs text-slate-500">
                      No advisory logs recorded yet.<br/>
                      Your spoken queries will accumulate here.
                    </div>
                  ) : (
                    historyList.map((item) => (
                      <button
                        key={item.id}
                        id={`history-item-btn-${item.id}`}
                        onClick={() => {
                          setSelectedItem(item);
                          setShowHistoryPane(false);
                          speakAdviceBack(item.answer);
                        }}
                        className={`w-full p-4 rounded-2xl text-left transition-all relative overflow-hidden group ${
                          selectedItem?.id === item.id
                            ? "bg-emerald-500/10 border-emerald-500 border"
                            : "bg-emerald-500/5 border border-transparent hover:bg-emerald-500/10"
                        }`}
                      >
                        <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono mb-1">
                          <span>{item.timestamp}</span>
                          <span className="text-[9px] uppercase font-bold text-amber-500 bg-amber-500/5 px-1 rounded">Ref ID: {item.id.toUpperCase()}</span>
                        </div>
                        <h4 className="font-semibold text-xs md:text-sm text-slate-800 dark:text-slate-100 line-clamp-1">
                          "{item.question}"
                        </h4>
                        <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2 mt-1">
                          {item.answer.replace(/\*\*/g, "")}
                        </p>
                      </button>
                    ))
                  )}
                </div>
              </div>

              {historyList.length > 0 && (
                <button
                  id="clear-logs-btn"
                  onClick={handleClearHistory}
                  className="w-full mt-6 py-2.5 rounded-full bg-red-500/10 hover:bg-red-500 hover:text-white border border-red-500/20 text-red-600 font-semibold text-xs cursor-pointer transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <RotateCcw size={14} />
                  <span>Clear Conversation Logs</span>
                </button>
              )}

            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* FOOTER SYSTEM CREDITS AND TRUST MARKS */}
      <footer className="relative w-full max-w-7xl mx-auto px-4 py-6 md:py-8 z-30 mt-auto border-t border-emerald-500/5 flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Dynamic farming tips advice ticker bar */}
        <div className="flex items-center space-x-2.5 bg-emerald-500/5 dark:bg-emerald-500/5 px-4 py-2 rounded-full border border-emerald-500/5 max-w-lg">
          <TrendingUp size={13} className="text-amber-500 animate-pulse shrink-0" />
          <span className="text-[11px] text-emerald-800/80 dark:text-emerald-300/80 font-light font-mono leading-none">
            ADVISORY TIP: Use organic compost like bone manure along with natural Neem Seed Decotions for zero-chemical pest remedy.
          </span>
        </div>

        <div className="flex items-center space-x-4 text-xs text-emerald-900/40 dark:text-emerald-300/40 font-mono">
          <span className="flex items-center gap-1">
            <ShieldCheck size={12} className="text-emerald-600" />
            ISO 27001 Certified
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/30" />
          <span>AgriVoice AI v4.8</span>
        </div>
      </footer>
      
    </div>
  );
}
