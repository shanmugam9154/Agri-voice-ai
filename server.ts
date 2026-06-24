import express from "express";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Initialize Google GenAI if key is present
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY") {
  try {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    console.log("Google GenAI initialized successfully.");
  } catch (err) {
    console.error("Error initializing Google GenAI:", err);
  }
}

// Helper to search for a visual fallback keyword for Unsplash image pairs
function getFallbackFarmingImages(text: string): { img1: string; img2: string } {
  const lowercase = text.toLowerCase();
  
  // Tomato/Tomoto matches (resilient to spelling mistakes and translations)
  const isTomato = lowercase.includes("tomato") || 
                   lowercase.includes("tomoto") || 
                   lowercase.includes("tomat") || 
                   lowercase.includes("టమోటా") || 
                   lowercase.includes("टमाटर") ||
                   lowercase.includes("tamatar");

  const isRice = lowercase.includes("rice") || 
                 lowercase.includes("paddy") || 
                 lowercase.includes("padi") || 
                 lowercase.includes("వరి") || 
                 lowercase.includes("ధాన్యం") || 
                 lowercase.includes("chaaval") || 
                 lowercase.includes("धान") || 
                 lowercase.includes("चावल") ||
                 lowercase.includes("dhaan");

  const isPestOrDisease = lowercase.includes("disease") || 
                          lowercase.includes("pest") || 
                          lowercase.includes("pestcide") || 
                          lowercase.includes("pesticide") || 
                          lowercase.includes("pestiside") || 
                          lowercase.includes("insect") || 
                          lowercase.includes("bug") || 
                          lowercase.includes("worm") ||
                          lowercase.includes("spray") || 
                          lowercase.includes("పురుగు") || 
                          lowercase.includes("తెగులు") || 
                          lowercase.includes("కీటకాలు") || 
                          lowercase.includes("रोग") || 
                          lowercase.includes("कीड़ा") ||
                          lowercase.includes("दवा");

  const isSoilOrFertilizer = lowercase.includes("soil") || 
                             lowercase.includes("fertilizer") || 
                             lowercase.includes("fertiliser") || 
                             lowercase.includes("ఎరువు") || 
                             lowercase.includes("మట్టి") || 
                             lowercase.includes("खाद") || 
                             lowercase.includes("नत्रजनी") || 
                             lowercase.includes("urea") || 
                             lowercase.includes("dap") ||
                             lowercase.includes("compost") ||
                             lowercase.includes("मिट्टी");

  const isWheat = lowercase.includes("wheat") || 
                  lowercase.includes("గోధుమ") || 
                  lowercase.includes("गेहूं") || 
                  lowercase.includes("harvest");

  // Multi-match logic for maximum accuracy
  if (isTomato) {
    if (isPestOrDisease) {
      // Tomato Pest/Pesticide specific
      return {
        img1: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&auto=format&fit=crop&q=80", // Tomato vine closeup
        img2: "https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?w=800&auto=format&fit=crop&q=80" // Farming leaf inspection/disease check
      };
    }
    if (isSoilOrFertilizer) {
      // Tomato Soil/Nutrition specific
      return {
        img1: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&auto=format&fit=crop&q=80",
        img2: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800&auto=format&fit=crop&q=80" // Fertilizer soil close-up
      };
    }
    // General tomato crop
    return {
      img1: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&auto=format&fit=crop&q=80",
      img2: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800&auto=format&fit=crop&q=80"
    };
  }

  if (isRice) {
    if (isPestOrDisease) {
      // Rice Pest/Disease
      return {
        img1: "https://images.unsplash.com/photo-1536657464919-892534f60d6e?w=800&auto=format&fit=crop&q=80", // Paddy field
        img2: "https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?w=800&auto=format&fit=crop&q=80" // Pest/leaf check
      };
    }
    return {
      img1: "https://images.unsplash.com/photo-1536657464919-892534f60d6e?w=800&auto=format&fit=crop&q=80",
      img2: "https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?w=800&auto=format&fit=crop&q=80" // Terraces
    };
  }

  if (isPestOrDisease) {
    return {
      img1: "https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?w=800&auto=format&fit=crop&q=80", // Leaf disease closeup
      img2: "https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=800&auto=format&fit=crop&q=80" // Crop spraying / prevention
    };
  }

  if (isSoilOrFertilizer) {
    return {
      img1: "https://images.unsplash.com/photo-1464241353125-b3058671183b?w=800&auto=format&fit=crop&q=80", // Soil hands/compost
      img2: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800&auto=format&fit=crop&q=80" // Fertile field
    };
  }

  if (isWheat) {
    return {
      img1: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800&auto=format&fit=crop&q=80", // Wheat ears
      img2: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&auto=format&fit=crop&q=80" // Harvest field
    };
  }

  // General elegant agricultural default (no pandas!)
  return {
    img1: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&auto=format&fit=crop&q=80", // Lush green farm fields
    img2: "https://images.unsplash.com/photo-1464226184884-fa280b87c3a9?w=800&auto=format&fit=crop&q=80" // Beautiful plant garden sprout
  };
}

// Standard educational responsive responses in Telugu/Hindi/English to use if GROQ_API_KEY is not defined
const DEMO_RESPONSES = [
  {
    keywords: ["tomato", "టమోటా", "टमाटर"],
    title: { te: "టమోటా పంట ఎరువుల మరియు నీటి యాజమాన్యం", hi: "टमाटर की फसल के लिए सर्वोत्तम उर्वरक", en: "Tomato Crop Fertilizer Guide" },
    answer: `🍅 **Tomato Crop Recommendation & Fertilizer Advice**

**Soil & Fertilizer (ఎరువులు):**
- **Telugu (తెలుగు):** టమోటా పంటకు నాటేటప్పుడు ఎకరాకు 10 టన్నుల పశువుల ఎరువుతో పాటు 60 కిలోల నత్రజని, 40 కిలోల భాస్వరం మరియు 40 కిలోల పొటాష్ అందించాలి. పూత దశలో కాల్షియం నైట్రేట్ పిచికారీ చేయడం వల్ల కాయ కుళ్ళు తెగులు నుండి కాపాడుకోవచ్చు.
- **Telugu-English Mixed:** Tomato cultivation లో flowering stage అప్పుడు Calcium Nitrate spray చేయడం వల్ల blossom-end rot (కాయ కుళ్ళు తెగులు) కంట్రోల్ అవుతుంది.
- **Hindi (हिंदी):** टमाटर की अच्छी उपज के लिए प्रति एकड़ 10 टन गोबर की खाद के साथ 60 किलो नाइट्रोजन, 40 किलो फास्फोरस और 40 किलो पोटाश डालें।

**Irrigation (నీటి యాజమాన్యం):**
- Keep the soil evenly moist. Water heavily during dry periods, focusing on the root zone.`
  },
  {
    keywords: ["rice", "paddy", "వరి", "धान", "चावल"],
    title: { te: "వరి పంటలో తెగుళ్ల నివారణ", hi: "धान की फसल के लिए सिंचाई और देखभाल", en: "Paddy Crop Management" },
    answer: `🌾 **Paddy (Rice) Crop Advisor**

**Fertilizer & Irrigation (ఎరువులు మరియు నీరు):**
- **Telugu (తెలుగు):** వరి నాటే ముందే ఎకరాకు 60 కిలోల సూపర్ ఫాస్ఫేట్ వేయాలి. దుబ్బు చేసే దశలో మరియు పూతకు వచ్చే దశలో యూరియా, మ్యూరేట్ ఆఫ్ పొటాష్ ఆఖరి మోతాదుగా వేయాలి. నీటి నిల్వను సరిగ్గా 2-5 సెం.మీ ఉండేలా చూసుకోవాలి.
- **Telugu-English Mixed:** Paddy crop ki best growth కోసం Nitrogen (Urea) ని split doses లో వేయాలి. Tillering and panicle initiation stages లో top dressing చేయడం చాలా ముఖ్యం.
- **Hindi (हिंदी):** धान की फसल में कल्ले फूटने के समय और बालियां निकलने के समय यूरिया का छिड़काव करें। जल स्तर को 3-5 सेमी बनाए रखें।

**Pest Control (తెగుళ్ల నివారణ):**
- Watch for Stem Borer (కాండం తొలిచే పురుగు). Use Cartap Hydrochloride 4G granules if active infestation is spotted.`
  },
  {
    keywords: ["disease", "pest", "leaf", "తెగులు", "పురుగు", "बीमारी", "कीड़ा"],
    title: { te: "పంటల తెగుళ్లు మరియు పురుగుల నివారణ", hi: "फसल कीट और रोग नियंत्रण मार्गदर्शन", en: "Disease & Pest Control Advisor" },
    answer: `🐛 **Pest and Disease Detection Guidance**

**Prevention & Treatment:**
- **Telugu (తెలుగు):** ఆకులపై నల్లటి మచ్చలు లేదా బూజు ఏర్పడితే అది శిలీంద్ర తెగులు కావచ్చు. దీని నివారణకు లీటరు నీటికి 2 గ్రాముల కార్బన్డైజిమ్ లేదా మ్యాంకోజెబ్ కలిపి పిచికారీ చేయాలి.
- **Telugu-English Mixed:** Pesticides ని ఎక్కువగా వాడకుండా, Neem oil (వేప నూనె) 5ml per liter of water mix చేసి spray చేయండి. ఇది natural pest control గా పనిచేస్తుంది.
- **Hindi (हिंदी):** कीटों के जैविक नियंत्रण के लिए 5% नीम के अर्क का छिड़काव करें। फंगल इन्फेक्शन होने पर मैन्कोजेब फफूंदनाशक का उपयोग करें।`
  },
  {
    keywords: ["organic", "సేంద్రీయ", "जैविक"],
    title: { te: "సేంద్రీయ వ్యవసాయ పద్ధతులు", hi: "जैविक खेती के सर्वोत्तम तरीके", en: "Organic Farming Guidelines" },
    answer: `🌱 **Organic Farming Methods & Tips**

**Soil Enrichment (జీవామృతం):**
- **Telugu (తెలుగు):** రసాయన ఎరువులకు బదులుగా పశువుల పేడ, మూత్రం, బెల్లం మరియు శనగ పిండితో తయారు చేసిన జీవామృతాన్ని నెలకు రెండుసార్లు నీటితో పాటు పంటకు ఇవ్వాలి. ఇది నేల సారవంతాన్ని అద్భుతంగా పెంచుతుంది.
- **Telugu-English Mixed:** Organic farming లో Vermicompost (వానపాముల ఎరువు) మరియు Cow Dung manure వాడటం వలన soil health మరియు moisture holding capacity పెరుగుతుంది.
- **Hindi (हिंदी):** रसायनों के स्थान पर जीवामृत और घनजीवामृत का प्रयोग करें। गोबर की खाद तथा केंचुआ खाद मिट्टी की उर्वरा शक्ति बढ़ाती है।`
  }
];

// Comprehensive local translation dictionary for popular crops and practices in South Asian contexts
function getEnglishAgriculturalKeywords(query: string, answerText: string): { crop: string; concept: string } {
  const text = (query + " " + answerText).toLowerCase();
  
  let crop = "crops";
  let concept = "farming";

  // --- Crop Detection ---
  if (text.includes("chrysanthemum") || text.includes("chamanthi") || text.includes("చామంతి") || text.includes("चमंती") || text.includes("चमेली") || text.includes("flower")) {
    crop = "chrysanthemum flower";
  } else if (text.includes("tomato") || text.includes("tomoto") || text.includes("టమోటా") || text.includes("टमाटर") || text.includes("tamatar")) {
    crop = "tomato crop";
  } else if (text.includes("rice") || text.includes("paddy") || text.includes("వరి") || text.includes("ధాన్యం") || text.includes("धान") || text.includes("चावल") || text.includes("padi")) {
    crop = "rice paddy";
  } else if (text.includes("chili") || text.includes("chilli") || text.includes("mirchi") || text.includes("మిరప") || text.includes("మిర్చి") || text.includes("मिर्च")) {
    crop = "chili crop";
  } else if (text.includes("cotton") || text.includes("ప్రత్తి") || text.includes("కపాస్") || text.includes("कपास") || text.includes("patthi")) {
    crop = "cotton field";
  } else if (text.includes("groundnut") || text.includes("peanut") || text.includes("వేరుశనగ") || text.includes("పల్లీలు") || text.includes("मूंगफली")) {
    crop = "groundnut crops";
  } else if (text.includes("mango") || text.includes("మామిడి") || text.includes("आम") || text.includes("mamidi")) {
    crop = "mango tree";
  } else if (text.includes("sugarcane") || text.includes("చెరకు") || text.includes("गन्ना") || text.includes("cheruku")) {
    crop = "sugarcane plantation";
  } else if (text.includes("wheat") || text.includes("గోధుమ") || text.includes("गेहूं") || text.includes("gehun")) {
    crop = "wheat field";
  }

  // --- Practice / Concept Detection ---
  if (text.includes("pesticide") || text.includes("pest") || text.includes("insect") || text.includes("bug") || text.includes("పురుగు") || text.includes("తెగులు") || text.includes("रोग") || text.includes("कीड़ा") || text.includes("spray") || text.includes("కీటకాలు")) {
    concept = "pesticide bug control";
  } else if (text.includes("fertilizer") || text.includes("urea") || text.includes("dap") || text.includes("ఎరువు") || text.includes("खाद") || text.includes("compost")) {
    concept = "fertilizer dressing";
  } else if (text.includes("soil") || text.includes("నేల") || text.includes("మట్టి") || text.includes("मिट्टी")) {
    concept = "fertile soil";
  } else if (text.includes("water") || text.includes("irrigation") || text.includes("నీరు") || text.includes("నీటి")) {
    concept = "drip irrigation";
  }

  return { crop, concept };
}

// Search live Google Images using custom direct fetch and tbn regexp targeting
async function fetchGoogleImages(query: string): Promise<string[]> {
  const uas = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Mobile Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/119.0"
  ];

  // Force query to be strictly agricultural and filter out monuments, city scenery, other tourist places like Taj Mahal
  let cleanQuery = query || "";
  const lowerQ = cleanQuery.toLowerCase();
  const negativeExclusions = " -tajmahal -taj-mahal -monument -palace -shrine -temple -fort -city -tourism -tourist -hotel -tomb -building -attraction -architecture";
  
  if (!lowerQ.includes("agriculture") && !lowerQ.includes("crop") && !lowerQ.includes("farming") && !lowerQ.includes("field") && !lowerQ.includes("plant")) {
    cleanQuery = `${cleanQuery} agriculture farming crop field${negativeExclusions}`;
  } else {
    cleanQuery = `${cleanQuery}${negativeExclusions}`;
  }

  for (const ua of uas) {
    try {
      const url = `https://www.google.com/search?q=${encodeURIComponent(cleanQuery)}&tbm=isch&safe=active`;
      console.log(`[GoogleImages] Fetching real-time search visual results for: "${cleanQuery}"`);
      
      const response = await fetch(url, {
        headers: {
          "User-Agent": ua,
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.5",
          "Referer": "https://www.google.com/"
        }
      });

      if (!response.ok) {
        continue;
      }

      const html = await response.text();
      
      // Match with the Google Image Search cached cdn thumbnail (tbn) format:
      const matches = html.match(/https:\/\/encrypted-tbn\d\.gstatic\.com\/images\?q=tbn:[^"'\s&]+/g);
      if (matches && matches.length > 0) {
        const uniqueSet = new Set<string>();
        const results: string[] = [];
        
        for (const m of matches) {
          // Unescape backslashes if any, and clean HTML entities:
          let cleanUrl = m.replace(/\\/g, "").replace(/&amp;/g, "&");
          if (!uniqueSet.has(cleanUrl)) {
            uniqueSet.add(cleanUrl);
            results.push(cleanUrl);
          }
        }
        
        if (results.length > 0) {
          console.log(`[GoogleImages] Successfully retrieved ${results.length} authentic search images for: "${query}"`);
          return results;
        }
      }
    } catch (e: any) {
      console.warn(`[GoogleImages] Warning searching Google Images with UA:`, e.message || e);
    }
  }
  
  return [];
}

// 20 Premium, authentic local-context agricultural & farming images
const CURATED_AGRICULTURE_IMAGES = [
  // chrysanthemums / chamanthi (1-2)
  {
    url: "https://images.unsplash.com/photo-1508784335824-18a7d3f2a74c?w=800&auto=format&fit=crop&q=80",
    tags: ["chrysanthemum", "chamanthi", "చామంతి", "flower", "फूल"]
  },
  {
    url: "https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=800&auto=format&fit=crop&q=80",
    tags: ["chrysanthemum", "chamanthi", "చామంతి", "flower", "garden"]
  },
  // general lush landscape (3)
  {
    url: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&auto=format&fit=crop&q=80",
    tags: ["general", "field", "landscape", "sunlight"]
  },
  // tomatoes (4-5)
  {
    url: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&auto=format&fit=crop&q=80",
    tags: ["tomato", "టమోటా", "टमाटर", "crop"]
  },
  {
    url: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800&auto=format&fit=crop&q=80",
    tags: ["tomato", "టమోటా", "टमाटर", "harvest"]
  },
  // rice/paddy (6-7)
  {
    url: "https://images.unsplash.com/photo-1536657464919-892534f60d6e?w=800&auto=format&fit=crop&q=80",
    tags: ["rice", "paddy", "వరి", "ధాన్యం", "धान", "field"]
  },
  {
    url: "https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?w=800&auto=format&fit=crop&q=80",
    tags: ["rice", "paddy", "వరి", "chaaval", "terrace"]
  },
  // wheat / harvesting (8-9)
  {
    url: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800&auto=format&fit=crop&q=80",
    tags: ["wheat", "గోధుమ", "गेहूं", "ears"]
  },
  {
    url: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&auto=format&fit=crop&q=80",
    tags: ["wheat", "harvest", "tractor", "grain"]
  },
  // soil & compost & seeds (10-11)
  {
    url: "https://images.unsplash.com/photo-1464241353125-b3058671183b?w=800&auto=format&fit=crop&q=80",
    tags: ["soil", "fertilizer", "ఎరువు", "మట్టి", "hands", "compost"]
  },
  {
    url: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800&auto=format&fit=crop&q=80",
    tags: ["soil", "field", "fertilizer", "land"]
  },
  // insect / pests / checking leaves (12-13)
  {
    url: "https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?w=800&auto=format&fit=crop&q=80",
    tags: ["disease", "pest", "leaf", "insect", "bug", "పురుగు", "తెగులు"]
  },
  {
    url: "https://images.unsplash.com/photo-1510113548557-4a58703b4ef3?w=800&auto=format&fit=crop&q=80",
    tags: ["disease", "pest", "insect", "inspection", "control"]
  },
  // watering / drip irrigation (14-15)
  {
    url: "https://images.unsplash.com/photo-1464226184884-fa280b87c3a9?w=800&auto=format&fit=crop&q=80",
    tags: ["water", "irrigation", "drip", "sprinkler", "నీరు"]
  },
  {
    url: "https://images.unsplash.com/photo-1516259762381-22954d7d3ad2?w=800&auto=format&fit=crop&q=80",
    tags: ["water", "sprinkler", "sprout", "irrigation"]
  },
  // chili crop / mango orchard (16-17)
  {
    url: "https://images.unsplash.com/photo-1588252393710-534ccd6118da?w=800&auto=format&fit=crop&q=80",
    tags: ["chili", "mirchi", "మిరప", "pepper"]
  },
  {
    url: "https://images.unsplash.com/photo-1591073113125-e46713c829ed?w=800&auto=format&fit=crop&q=80",
    tags: ["mango", "మామిడి", "fruit", "tree"]
  },
  // cotton / greenhouse / farming advisor (18-20)
  {
    url: "https://images.unsplash.com/photo-1594900222165-8b0b8c634be9?w=800&auto=format&fit=crop&q=80",
    tags: ["cotton", "ప్రత్తి", "कपास"]
  },
  {
    url: "https://images.unsplash.com/photo-1534008757030-27299c4371b6?w=800&auto=format&fit=crop&q=80",
    tags: ["greenhouse", "rows", "crops", "field"]
  },
  {
    url: "https://images.unsplash.com/photo-1627920769842-6e870bbf977e?w=800&auto=format&fit=crop&q=80",
    tags: ["advisor", "greenhouse", "farmer", "clipboard"]
  }
];

// Context-aware dynamic photo selection and query hashing to rotate images infinitely
function getFreshCuratedAgriculturalImage(query: string, answerText: string): string {
  const text = (query + " " + answerText).toLowerCase();
  
  // Compute string hash to cleanly cycle indices so there is continuous variety
  let hashVal = 0;
  const combined = query.trim() + " " + answerText.trim();
  for (let i = 0; i < combined.length; i++) {
    hashVal += combined.charCodeAt(i) * (i + 1);
  }
  hashVal = Math.abs(hashVal);

  let matches: typeof CURATED_AGRICULTURE_IMAGES = [];
  
  // High accuracy triggers
  if (text.includes("chrysanthemum") || text.includes("chamanthi") || text.includes("చామంతి") || text.includes("flower") || text.includes("పూలు")) {
    matches = CURATED_AGRICULTURE_IMAGES.filter(img => img.tags.includes("chrysanthemum"));
  } else if (text.includes("tomato") || text.includes("టమోటా") || text.includes("टमाटर")) {
    matches = CURATED_AGRICULTURE_IMAGES.filter(img => img.tags.includes("tomato"));
  } else if (text.includes("rice") || text.includes("paddy") || text.includes("వరి") || text.includes("ధాన్యం") || text.includes("धान")) {
    matches = CURATED_AGRICULTURE_IMAGES.filter(img => img.tags.includes("rice"));
  } else if (text.includes("wheat") || text.includes("గోధుమ") || text.includes("गेहूं")) {
    matches = CURATED_AGRICULTURE_IMAGES.filter(img => img.tags.includes("wheat"));
  } else if (text.includes("chili") || text.includes("mirchi") || text.includes("మిరప")) {
    matches = CURATED_AGRICULTURE_IMAGES.filter(img => img.tags.includes("chili"));
  } else if (text.includes("mango") || text.includes("మామిడి") || text.includes("आम")) {
    matches = CURATED_AGRICULTURE_IMAGES.filter(img => img.tags.includes("mango"));
  } else if (text.includes("cotton") || text.includes("కపాస్") || text.includes("ప్రత్తి")) {
    matches = CURATED_AGRICULTURE_IMAGES.filter(img => img.tags.includes("cotton"));
  } else if (text.includes("soil") || text.includes("fertilizer") || text.includes("ఎరువు") || text.includes("మట్టి") || text.includes("urea")) {
    matches = CURATED_AGRICULTURE_IMAGES.filter(img => img.tags.includes("soil"));
  } else if (text.includes("disease") || text.includes("pest") || text.includes("bug") || text.includes("పురుగు") || text.includes("తెగులు")) {
    matches = CURATED_AGRICULTURE_IMAGES.filter(img => img.tags.includes("pest"));
  } else if (text.includes("water") || text.includes("irrigation") || text.includes("నీరు")) {
    matches = CURATED_AGRICULTURE_IMAGES.filter(img => img.tags.includes("water"));
  }

  if (matches.length > 0) {
    const selected = matches[hashVal % matches.length];
    return selected.url;
  }

  // Fallback to rotating general pool
  const finalSelect = CURATED_AGRICULTURE_IMAGES[hashVal % CURATED_AGRICULTURE_IMAGES.length];
  return finalSelect.url;
}

// POST API to handle speech-to-text questions
app.post("/api/ask", async (req, res) => {
  const { question } = req.body;

  if (!question || typeof question !== "string" || question.trim() === "") {
    return res.status(400).json({ error: "Please speak or provide a valid prompt." });
  }

  const query = question.trim();
  let aiAnswer = "";
  let isDemoOutput = false;
  let detectedKeyword = "general";

  // System instructions requested by the user
  const systemPrompt = "You are an expert agricultural advisor. Reply in the same language style used by the farmer. If the farmer uses Telugu, reply in Telugu. If the farmer mixes Telugu and English, reply in the same mixed style. Give practical farming advice in a simple and farmer-friendly way.";

  // Check if Groq API secret is configured
  const groqApiKey = process.env.GROQ_API_KEY;

  if (groqApiKey && groqApiKey !== "your_api_key" && groqApiKey !== "YOUR_GROQ_API_KEY") {
    try {
      console.log("Routing query to Groq API using model llama-3.3-70b-versatile...");
      
      const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${groqApiKey}`
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: query }
          ],
          temperature: 0.7,
          max_tokens: 1200
        })
      });

      if (!groqResponse.ok) {
        throw new Error(`Groq API returned status ${groqResponse.status}`);
      }

      const groqData = await groqResponse.json();
      aiAnswer = groqData.choices?.[0]?.message?.content || "";
    } catch (err) {
      console.error("Groq query exception, failing back to local assistant algorithm:", err);
      isDemoOutput = true;
    }
  } else {
    // If no Groq API Key, use our smart rules-based semantic simulator
    isDemoOutput = true;
  }

  // If we clicked into DEMO mode or failed
  if (isDemoOutput || !aiAnswer) {
    const lowercaseQuery = query.toLowerCase();
    const match = DEMO_RESPONSES.find(item => 
      item.keywords.some(keyword => lowercaseQuery.includes(keyword))
    );

    if (match) {
      aiAnswer = match.answer;
      detectedKeyword = match.keywords[0];
    } else {
      // General agricultural response structured in Telugu/Hindi/English intelligently
      aiAnswer = `👨‍🌾 **AgriVoice AI Assistant (Smart Farmer Guide)**

**English Advice:**
- Thank you for your question: "${query}". Ensure proper soil testing before applying fertilizers. Maintain healthy crop rotation and spray neem-oil extract for safe pest control.

**Telugu (తెలుగు):**
- ప్రశ్న: "${query}". పంటకు లభించే సహజ సిద్ధమైన పోషకాలను నిలిపి ఉంచడానికి నేలను తేమగా ఉంచండి. సేంద్రీయ పద్ధతులు మరియు సమయానుకూల నీటి తడులు పంటకు అత్యంత ముఖ్యం.

**Telugu-English Mixed Style:**
- Crops కి Pest and disease attack రాకుండా ముందే Neem seed kernel extract (వేప గింజల కషాయం) spray చేయడం చాలా organic and best custom solution.

**Hindi (हिंदी):**
- फसल की अच्छी वृद्धि के लिए नियमित निराई-गुड़ाई करें और जैविक कीटनाशकों का प्रयोग करें।

*💡 Note: Setup your GROQ_API_KEY in the Secrets panel to activate direct live customized answers via the Llama-3.3 model.*`;
    }
  }

  // --- Start of Dynamic Keyword Extraction & Visual Auto-Generation ---
  let extKeyword1 = "agriculture crop";
  
  // Try using Gemini 3.5 Flash to automatically extract the main visual noun/concepts from response
  if (ai) {
    try {
      console.log("Extracting high-relevance agricultural visual search keywords using Gemini...");
      const extractPrompt = `
You are an expert agricultural search tag generator. Analyze the following user question and the agricultural advisor reply.
Identify the single most relevant and specific visual subject discussed — this should be the specific crop or target in English (e.g. "chrysanthemum flower", "tomato crop", "rice paddy", "chili plant", "cotton plant").

Rules:
1. Return ONLY a single plain English phrase (1-3 words max).
2. Do NOT mention chemical names that won't have stock photos (e.g., write "fertilizer" instead of "NPK 10-26-26", write "pesticide" instead of "hullone").
3. DO NOT output any explanation, notes, or markdown formatting. Just plain English characters.

User Question: "${query}"
Advisor Reply: "${aiAnswer}"
`;

      const extractionResult = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: {
          parts: [{ text: extractPrompt }]
        }
      });

      const responseText = extractionResult.text?.trim() || "";
      console.log("Raw keyword extraction response:", responseText);
      if (responseText && responseText.length < 50) {
        extKeyword1 = responseText.replace(/[^a-zA-Z0-9\s]/g, "").trim();
        console.log(`Extracted keyword successfully: "${extKeyword1}"`);
      }
    } catch (err) {
      console.warn("Failed to extract keywords using Gemini, falling back to local extractor:", err);
    }
  }

  // Fallback to local keyword extractor if variables are still default or Gemini was bypassed
  if (extKeyword1 === "agriculture crop" || extKeyword1 === "crop") {
    // Rely on our brand new high-precision multilingual agricultural dictionary helper!
    const localTags = getEnglishAgriculturalKeywords(query, aiAnswer);
    extKeyword1 = localTags.crop;
  }

  // --- Live Google Image Search Retrieval ---
  let googleImages: string[] = [];
  try {
    // 1. Try search with the translated clean English agricultural keyword (e.g., "chrysanthemum flower") for maximum lookalike matching
    console.log(`[GoogleImages] Google searching keyword: "${extKeyword1}"`);
    const cropImages = await fetchGoogleImages(extKeyword1);
    googleImages = [...googleImages, ...cropImages];

    // 2. Also fallback/try with the raw query if the keyword search was somehow small
    if (googleImages.length < 5) {
      console.log(`[GoogleImages] Expanding pool with raw user query: "${query}"`);
      const rawPromptImages = await fetchGoogleImages(query);
      googleImages = [...googleImages, ...rawPromptImages];
    }
  } catch (err: any) {
    console.warn("Failed loading live Google images:", err.message || err);
  }

  // De-duplicate URLs and filter out empty items
  const finalImages = Array.from(new Set(googleImages)).filter(url => url && url.startsWith("http"));
  console.log(`[GoogleImages] Final pool contains ${finalImages.length} actual Google source images.`);

  // Map first-page Google Search images to the final properties. Fallbacks are from our beautiful 20 curated agricultural photos list
  let imageUrl = finalImages[0];
  
  if (!imageUrl) {
    console.log("[GoogleImages] Live Google image pool was empty. Falling back to targeted curated premium agriculture image.");
    imageUrl = getFreshCuratedAgriculturalImage(query, aiAnswer);
  }

  let imageGeneratedWithAi = false;

  // Let's check if the premium AI generation block can run as another progressive enhancement layer
  if (ai) {
    try {
      console.log("Attempting to generate premium custom illustrative scene on subject:", extKeyword1);
      const themePrompt = `Close-up details of healthy agricultural plants: ${extKeyword1}, warm glowing early morning sunlight, 4k high contrast, photorealistic farming scene.`;
      const imageResult = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [{ text: themePrompt }],
        },
        config: {
          imageConfig: {
            aspectRatio: "16:9",
          }
        }
      });

      if (imageResult.candidates?.[0]?.content?.parts) {
        for (const part of imageResult.candidates[0].content.parts) {
          if (part.inlineData?.data) {
            imageUrl = `data:image/png;base64,${part.inlineData.data}`;
            imageGeneratedWithAi = true;
            console.log("Success generating custom Gemini crop image.");
            break;
          }
        }
      }
    } catch (imgError: any) {
      console.warn("Could not generate custom Gemini image (using dynamic Unsplash or Google scratch-pad fallbacks):", imgError.message || imgError);
    }
  }

  res.json({
    question: query,
    answer: aiAnswer,
    imageUrl,
    imageGeneratedWithAi,
    isDemo: isDemoOutput && (!groqApiKey || groqApiKey.includes("YOUR_GROQ_API_KEY"))
  });
});

// Configure Vite integration for high-performance development, or static hosting in Production
async function start() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Mounted Vite development middlewares.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Serving compiled static assets from:", distPath);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`AgriVoice AI dynamic server running on http://localhost:${PORT}`);
  });
}

start();
