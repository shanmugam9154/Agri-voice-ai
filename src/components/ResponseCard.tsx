import React, { useState } from "react";
import { motion } from "motion/react";
import { 
  Download, 
  Share2, 
  Volume2, 
  VolumeX, 
  Check, 
  Sparkles, 
  Calendar, 
  User, 
  Compass, 
  Info 
} from "lucide-react";
import { ConversationItem } from "../types";

interface ResponseCardProps {
  key?: string | number;
  item: ConversationItem;
  isSpeaking: boolean;
  onSynthesizeSpeech: (text: string) => void;
  onStopSpeech: () => void;
}

export default function ResponseCard({ 
  item, 
  isSpeaking, 
  onSynthesizeSpeech, 
  onStopSpeech 
}: ResponseCardProps) {
  const [copied, setCopied] = useState(false);

  // Fallback share logic using Web Share API or Clipboard copying
  const handleShare = async () => {
    const shareText = `🌾 *AgriVoice AI Advisor Report* 🌾\n\n📅 Date: ${item.timestamp}\n🗣️ Farmer Question:\n"${item.question}"\n\n🤖 AI Agriculture Answer:\n${item.answer.replace(/\*\*/g, "")}\n\nGenerated with AgriVoice AI.`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "AgriVoice AI Farmer Report",
          text: shareText,
        });
      } catch (err) {
        console.log("Error sharing:", err);
      }
    } else {
      // Fallback: Copy to Clipboard
      try {
        await navigator.clipboard.writeText(shareText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error("Clipboard write failed:", err);
      }
    }
  };

  // Highly robust printable PDF layout construction
  const handleDownloadPDF = () => {
    // Generate an isolated, fully-styled print preview layout containing custom report template and trigger print to PDF
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const htmlContent = `
      <html>
        <head>
          <title>AgriVoice_Report_${item.id.slice(0, 6)}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
            body {
              font-family: 'Inter', sans-serif;
              color: #1e293b;
              line-height: 1.6;
              padding: 40px;
              max-width: 800px;
              margin: 0 auto;
              background-color: #fff;
            }
            .header {
              display: flex;
              align-items: center;
              justify-content: space-between;
              border-bottom: 2px solid #2e7d32;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .logo {
              font-size: 24px;
              font-weight: 700;
              color: #2e7d32;
            }
            .stamp {
              font-size: 12px;
              color: #64748b;
              font-family: monospace;
            }
            .title {
              font-size: 20px;
              font-weight: 600;
              margin-bottom: 15px;
              color: #0f172a;
            }
            .section {
              background-color: #f8fafc;
              border-left: 4px solid #2e7d32;
              padding: 20px;
              margin-bottom: 25px;
              border-radius: 0 8px 8px 0;
            }
            .section-title {
              font-weight: 600;
              text-transform: uppercase;
              font-size: 13px;
              color: #475569;
              letter-spacing: 0.05em;
              margin-bottom: 8px;
            }
            .content {
              font-size: 15px;
              color: #334155;
            }
            .answer-text {
              white-space: pre-wrap;
              font-size: 15px;
            }
            .visual {
              margin-top: 30px;
              text-align: center;
            }
            .visual img {
              max-width: 100%;
              height: auto;
              border-radius: 12px;
              box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            }
            .footer {
              margin-top: 50px;
              text-align: center;
              font-size: 12px;
              color: #94a3b8;
              border-top: 1px solid #e2e8f0;
              padding-top: 15px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">🌾 AgriVoice AI Farmer Report</div>
            <div class="stamp">REPORT REF: ${item.id.toUpperCase()}</div>
          </div>
          
          <div style="font-size: 13px; color: #64748b; margin-bottom: 20px; display: flex; justify-content: space-between;">
            <div>📅 DATE: ${item.timestamp}</div>
            <div>🤖 GENERATION MODEL: LLaMA 3.3 (70B)</div>
          </div>

          <div class="section" style="border-left-color: #66bb6a;">
            <div class="section-title">👤 Farmer Question (ప్రశ్న):</div>
            <div class="content" style="font-style: italic; font-size: 16px;">
              "${item.question}"
            </div>
          </div>

          <div class="section">
            <div class="section-title">🌾 Expert Agricultural AI Response (సలహా):</div>
            <div class="content answer-text">${item.answer}</div>
          </div>



          <div class="footer">
            AgriVoice AI — Futuristic Voice-Based Agricultural Expert System. All rights reserved.<br/>
            Saving farmers nationwide with intelligent native speech insights.
          </div>

          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  return (
    <motion.div
      id={`response-card-${item.id}`}
      initial={{ opacity: 0, y: 30, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-full max-w-4xl mx-auto rounded-[32px] md:rounded-[40px] bg-white/60 dark:bg-[#071308]/75 backdrop-blur-2xl border border-white/80 dark:border-emerald-500/10 shadow-2xl shadow-emerald-950/10 dark:shadow-[0_20px_50px_rgba(0,0,0,0.6)] overflow-hidden"
    >
      {/* Top Advisory Card Accent Bar matching Immersive UI logo/header shade */}
      <div className="h-[6px] bg-gradient-to-r from-[#2E7D32] via-[#66BB6A] to-amber-400" />

      <div className="p-6 md:p-8 flex flex-col md:flex-row gap-8 items-stretch">
        
        {/* Left Side Content */}
        <div className="flex-1 flex flex-col justify-between space-y-6">
          
          {/* Metadata & Status indicators */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs border-b border-emerald-500/10 pb-4">
            <div className="flex items-center space-x-2 text-[#2E7D32] dark:text-[#66BB6A] font-medium">
              <Calendar size={14} />
              <span>{item.timestamp}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#66BB6A]" />
              <Compass size={14} className="ml-1 animate-spin" style={{ animationDuration: "12s" }} />
              <span>Agrometeorology Division</span>
            </div>

            <div className="flex items-center space-x-2">
              {item.isDemo && (
                <span className="px-2.5 py-1 rounded-full text-[10px] uppercase font-mono tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/15 flex items-center gap-1">
                  <Info size={11} />
                  Demo Mode
                </span>
              )}
              <span className="px-2.5 py-1 rounded-full text-[10px] uppercase font-mono tracking-wider bg-[#2E7D32]/10 text-[#2E7D32] dark:text-[#66BB6A] border border-[#2E7D32]/15 flex items-center gap-1 font-semibold">
                <Sparkles size={11} className="text-yellow-500 animate-pulse" />
                Verified Advisory AI
              </span>
            </div>
          </div>

          {/* 1. Farmer Question Transcribed Input */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-widest text-[#66BB6A]">
              <User size={13} />
              <span>Recent Query (ప్రశ్న):</span>
            </div>
            <h3 className="text-lg md:text-xl font-semibold text-[#1B431E] dark:text-teal-100 bg-[#2E7D32]/5 dark:bg-emerald-500/5 px-4 py-3 rounded-2xl border border-white/50 dark:border-emerald-500/5 leading-relaxed">
              "{item.question}"
            </h3>
          </div>

          {/* 2. AI Detailed response panel */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-widest text-[#2E7D32]/70 dark:text-emerald-300/60">
                <Sparkles size={13} className="text-amber-500" />
                <span>Advisor Insight & Actionable Guidance:</span>
              </div>

              {/* Speaking voice play controls */}
              <button
                id={`tts-toggle-btn-${item.id}`}
                onClick={() => isSpeaking ? onStopSpeech() : onSynthesizeSpeech(item.answer)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  isSpeaking 
                    ? "bg-[#2E7D32] text-white shadow-md animate-pulse" 
                    : "bg-emerald-100 dark:bg-[#1B431E]/40 text-[#2E7D32] dark:text-emerald-300 hover:bg-emerald-200"
                }`}
              >
                {isSpeaking ? (
                  <>
                    <VolumeX size={13} />
                    <span>Mute Voice</span>
                  </>
                ) : (
                  <>
                    <Volume2 size={13} />
                    <span>Listen response</span>
                  </>
                )}
              </button>
            </div>

            <div className="prose max-w-none text-[#1B431E]/90 dark:text-slate-100 leading-relaxed text-sm md:text-base font-sans bg-white/40 dark:bg-black/20 p-5 md:p-6 rounded-2xl border border-[#2E7D32]/10 dark:border-emerald-500/5 shadow-inner">
              <div className="whitespace-pre-wrap space-y-4">
                {item.answer.split("\n\n").map((para, index) => {
                  // Formatting bullet headings naturally
                  if (para.startsWith("- ") || para.startsWith("* ")) {
                    return (
                      <ul key={index} className="list-disc list-inside space-y-1 pl-2 text-emerald-900/95 dark:text-emerald-100/95 font-medium">
                        {para.split("\n").map((bullet, bi) => (
                          <li key={bi} className="font-light">{bullet.substring(2)}</li>
                        ))}
                      </ul>
                    );
                  }
                  
                  // Strong headers highlight
                  if (para.includes("**")) {
                    const parts = para.split("**");
                    return (
                      <p key={index} className="font-light">
                        {parts.map((p, pi) => pi % 2 === 1 ? <strong key={pi} className="font-bold text-[#2E7D32] dark:text-[#66BB6A]">{p}</strong> : p)}
                      </p>
                    );
                  }

                  return <p key={index} className="font-normal opacity-95">{para}</p>;
                })}
              </div>
            </div>
          </div>

          {/* Action buttons inside columns */}
          <div className="flex gap-4 pt-4 border-t border-emerald-500/10">
            <button
              id={`pdf-btn-${item.id}`}
              onClick={handleDownloadPDF}
              className="px-6 py-3 bg-[#2E7D32] hover:bg-[#1B431E] text-white rounded-2xl text-sm font-semibold flex items-center gap-2 cursor-pointer shadow-md shadow-[#2E7D32]/10 transition-all duration-300"
            >
              <Download size={14} />
              <span>Save PDF Report</span>
            </button>

            <button
              id={`share-btn-${item.id}`}
              onClick={handleShare}
              className="px-6 py-3 bg-white/50 dark:bg-emerald-950/20 border border-[#2E7D32]/20 text-[#2E7D32] dark:text-[#66BB6A] rounded-2xl text-sm font-semibold flex items-center gap-2 cursor-pointer hover:bg-emerald-50/50 transition-all duration-300"
            >
              {copied ? (
                <>
                  <Check size={14} className="text-emerald-500 animate-bounce" />
                  <span>Link Copied!</span>
                </>
              ) : (
                <>
                  <Share2 size={14} />
                  <span>Share Advice</span>
                </>
              )}
            </button>
          </div>

        </div>

      </div>
    </motion.div>
  );
}
