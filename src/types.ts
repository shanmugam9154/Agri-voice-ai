export interface ConversationItem {
  id: string;
  question: string;
  answer: string;
  imageUrl: string;
  imageUrl2?: string;
  timestamp: string;
  imageGeneratedWithAi?: boolean;
  isDemo?: boolean;
}

export type SupportedLanguage = "all" | "te" | "hi" | "en" | "te-en";

export interface SpeechVoiceOption {
  name: string;
  lang: string;
  gender: "female" | "male" | "unknown";
  native: boolean;
  rawVoice: SpeechSynthesisVoice;
}
