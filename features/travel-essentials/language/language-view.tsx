"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";

import {
  ArrowLeftRight,
  Bot,
  Check,
  Copy,
  Globe,
  HandMetal,
  Hash,
  HelpCircle,
  Info,
  Languages,
  Loader2,
  Radio,
  Search,
  Send,
  ShieldAlert,
  Sparkles,
  Train,
  Utensils,
  Volume2,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  generateAiSpeechAction,
  translateCustomTravelPhrase,
} from "./language-service";

import type { AiTranslatedPhrase } from "../types";
import { LANGUAGE_GUIDES } from "./language-data";

const CATEGORIES = ["ALL", "Greetings", "Essentials", "Dining", "Transit", "Emergency", "Numbers"] as const;
type CategoryType = (typeof CATEGORIES)[number];

/**
 * Accurately check whether the device has an installed speech voice capable of pronouncing the target language.
 * E.g., mobile devices with Google TTS / Apple Siri have Hindi & Japanese installed;
 * standard Windows laptops typically only have English unless explicit language packs are installed.
 */
function findCapableVoice(
  voices: SpeechSynthesisVoice[],
  localeCode: string
): SpeechSynthesisVoice | null {
  if (!localeCode || voices.length === 0) return null;
  const targetPrefix = localeCode.split(/[-_]/)[0].toLowerCase();
  const targetNorm = localeCode.toLowerCase().replace("_", "-");

  // 1. Exact match (e.g. "hi-in" === "hi-IN" or "ja-jp" === "ja-JP")
  const exact = voices.find((v) => {
    if (!v.lang) return false;
    const vNorm = v.lang.toLowerCase().replace("_", "-");
    return vNorm === targetNorm;
  });
  if (exact) return exact;

  // 2. Language-level match (e.g. "hi" or "hi-*" or "ja-*")
  const prefixMatch = voices.find((v) => {
    if (!v.lang) return false;
    const vNorm = v.lang.toLowerCase().replace("_", "-");
    return vNorm === targetPrefix || vNorm.startsWith(targetPrefix + "-");
  });
  if (prefixMatch) return prefixMatch;

  return null;
}

export function LanguageView() {
  const [selectedLangName, setSelectedLangName] = useState<string>("Hindi");
  const [categoryFilter, setCategoryFilter] = useState<CategoryType>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [playingKey, setPlayingKey] = useState<string | null>(null);
  const [audioEngine, setAudioEngine] = useState<"browser" | "fish" | "loading" | null>(null);
  const [translateMode, setTranslateMode] = useState<"auto" | "to-english" | "to-target">("auto");

  // Browser voices registry
  const [browserVoices, setBrowserVoices] = useState<SpeechSynthesisVoice[]>([]);

  // Audio & Utterance Refs
  const audioCacheRef = useRef<Map<string, string>>(new Map());
  const activeAudioRef = useRef<HTMLAudioElement | null>(null);
  const activeUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const currentPlayingKeyRef = useRef<string | null>(null);

  // Preload and monitor browser voices
  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    const updateVoices = () => {
      try {
        const voices = window.speechSynthesis.getVoices();
        if (voices && voices.length > 0) {
          setBrowserVoices(voices);
        }
      } catch {}
    };

    updateVoices();
    window.speechSynthesis.onvoiceschanged = updateVoices;

    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      currentPlayingKeyRef.current = null;
      if (activeAudioRef.current) {
        activeAudioRef.current.onended = null;
        activeAudioRef.current.onerror = null;
        activeAudioRef.current.pause();
        activeAudioRef.current = null;
      }
      if (activeUtteranceRef.current) {
        activeUtteranceRef.current.onend = null;
        activeUtteranceRef.current.onerror = null;
        activeUtteranceRef.current = null;
      }
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // AI Translator state (Groq Qwen)
  const [customInput, setCustomInput] = useState("");
  const [aiTranslation, setAiTranslation] = useState<AiTranslatedPhrase | null>(null);
  const [isTranslating, startTranslating] = useTransition();

  const currentGuide = useMemo(() => {
    return (
      LANGUAGE_GUIDES.find((g) => g.language === selectedLangName) ||
      LANGUAGE_GUIDES[0]
    );
  }, [selectedLangName]);

  // Copy helper with visual feedback
  const handleCopy = (text: string, key: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Phonetic fallback speech using browser default voice
  const playPhoneticBrowser = (phoneticText: string, key: string) => {
    if (currentPlayingKeyRef.current !== key) return;

    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      currentPlayingKeyRef.current = null;
      setPlayingKey(null);
      setAudioEngine(null);
      return;
    }
    setAudioEngine("browser");
    const cleanPhonetic = phoneticText.replace(/\([^)]*\)/g, "").trim() || phoneticText;
    const utterance = new SpeechSynthesisUtterance(cleanPhonetic);
    utterance.rate = 0.85;
    utterance.pitch = 1.0;

    utterance.onend = () => {
      if (currentPlayingKeyRef.current === key) {
        currentPlayingKeyRef.current = null;
        setPlayingKey(null);
        setAudioEngine(null);
      }
      activeUtteranceRef.current = null;
    };
    utterance.onerror = (event: SpeechSynthesisErrorEvent) => {
      if (event.error === "canceled" || event.error === "interrupted") return;
      if (currentPlayingKeyRef.current === key) {
        currentPlayingKeyRef.current = null;
        setPlayingKey(null);
        setAudioEngine(null);
      }
      activeUtteranceRef.current = null;
    };

    activeUtteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  // OpenRouter fish-audio/s2.1-pro-free:free speech fallback
  const playViaOpenRouter = async (
    text: string,
    pronunciation: string | undefined,
    localeCode: string,
    languageName: string,
    key: string
  ) => {
    if (currentPlayingKeyRef.current !== key) return;

    const cacheKey = `${text.trim()}_${languageName}`;
    let audioDataUrl = audioCacheRef.current.get(cacheKey);

    if (!audioDataUrl) {
      setAudioEngine("loading");
      try {
        const res = await generateAiSpeechAction(
          text,
          pronunciation,
          languageName,
          localeCode
        );
        if (currentPlayingKeyRef.current !== key) return;

        if (res.success && res.audioDataUrl) {
          audioDataUrl = res.audioDataUrl;
          audioCacheRef.current.set(cacheKey, audioDataUrl);
        }
      } catch (err) {
        console.warn("[TTS] OpenRouter Fish Audio action error:", err);
      }
    }

    if (currentPlayingKeyRef.current !== key) return;

    if (audioDataUrl) {
      setAudioEngine("fish");
      try {
        const audio = new Audio(audioDataUrl);
        activeAudioRef.current = audio;

        audio.onended = () => {
          if (currentPlayingKeyRef.current === key) {
            currentPlayingKeyRef.current = null;
            setPlayingKey(null);
            setAudioEngine(null);
          }
          activeAudioRef.current = null;
        };

        audio.onerror = () => {
          console.warn("[TTS] HTML5 Audio error, falling back to phonetic browser speech");
          activeAudioRef.current = null;
          if (currentPlayingKeyRef.current === key) {
            playPhoneticBrowser(pronunciation || text, key);
          }
        };

        await audio.play();
        return;
      } catch (err) {
        console.warn("[TTS] Audio playback exception:", err);
        activeAudioRef.current = null;
      }
    }

    // Tier 3: If OpenRouter audio failed or network blocked, speak the phonetic pronunciation
    if (currentPlayingKeyRef.current === key) {
      playPhoneticBrowser(pronunciation || text, key);
    }
  };

  // Multi-tier Audio Player (Browser SpeechSynthesis -> OpenRouter Fish Audio TTS -> Phonetic Romanized Browser)
  const handlePlaySpeech = async (
    text: string,
    pronunciation: string | undefined,
    localeCode: string,
    languageName: string,
    key: string
  ) => {
    // Unbind and stop any active audio
    if (activeAudioRef.current) {
      activeAudioRef.current.onended = null;
      activeAudioRef.current.onerror = null;
      activeAudioRef.current.pause();
      activeAudioRef.current = null;
    }
    // Unbind event handlers BEFORE cancel to prevent fired 'canceled' error events from triggering fallback TTS
    if (activeUtteranceRef.current) {
      activeUtteranceRef.current.onend = null;
      activeUtteranceRef.current.onerror = null;
      activeUtteranceRef.current = null;
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    if (currentPlayingKeyRef.current === key && playingKey === key) {
      currentPlayingKeyRef.current = null;
      setPlayingKey(null);
      setAudioEngine(null);
      return;
    }

    currentPlayingKeyRef.current = key;
    setPlayingKey(key);

    // Dynamically retrieve all available voices from the browser/OS at the moment of click
    const allVoices =
      typeof window !== "undefined" && "speechSynthesis" in window
        ? window.speechSynthesis.getVoices()
        : [];
    const effectiveVoices = allVoices.length > 0 ? allVoices : browserVoices;
    if (allVoices.length > 0 && browserVoices.length === 0) {
      setBrowserVoices(allVoices);
    }

    // Check whether the device actually has an installed voice capable of pronouncing this language
    const capableVoice = findCapableVoice(effectiveVoices, localeCode);

    // Tier 1: Device has a genuinely capable native voice installed for this language (e.g. mobile with Google/Apple TTS, or laptop with language pack)
    if (capableVoice && typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        setAudioEngine("browser");
        const cleanSpeechText = text.replace(/\([^)]*\)/g, "").trim() || text;
        const utterance = new SpeechSynthesisUtterance(cleanSpeechText);
        utterance.voice = capableVoice;
        utterance.lang = capableVoice.lang || localeCode || "en-US";
        utterance.rate = 0.85;
        utterance.pitch = 1.0;

        utterance.onend = () => {
          if (currentPlayingKeyRef.current === key) {
            currentPlayingKeyRef.current = null;
            setPlayingKey(null);
            setAudioEngine(null);
          }
          activeUtteranceRef.current = null;
        };

        utterance.onerror = (event: SpeechSynthesisErrorEvent) => {
          // If the speech was canceled or interrupted because user clicked another card, ignore!
          if (event.error === "canceled" || event.error === "interrupted") {
            return;
          }
          console.warn("[SpeechSynthesis] Native voice error, falling back to OpenRouter Fish Audio:", event.error);
          activeUtteranceRef.current = null;
          if (currentPlayingKeyRef.current === key) {
            playViaOpenRouter(text, pronunciation, localeCode, languageName, key);
          }
        };

        activeUtteranceRef.current = utterance;
        window.speechSynthesis.speak(utterance);
        return;
      } catch (err) {
        console.warn("[SpeechSynthesis] Browser utterance exception:", err);
      }
    }

    // Tier 2: Device does NOT have a native voice for this language (e.g. standard Windows laptop without Hindi/Japanese/Thai language pack)
    // -> Use OpenRouter Fish Audio model (fish-audio/s2.1-pro-free:free) for authentic native pronunciation
    await playViaOpenRouter(text, pronunciation, localeCode, languageName, key);
  };

  // Trigger custom AI translation with Groq Qwen / OpenRouter
  const handleTranslateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customInput.trim()) return;

    startTranslating(async () => {
      const res = await translateCustomTravelPhrase(
        customInput.trim(),
        currentGuide.language,
        translateMode,
        currentGuide.localeCode
      );
      setAiTranslation(res);
    });
  };

  // Filtered phrases by category and search
  const filteredPhrases = useMemo(() => {
    return currentGuide.phrases.filter((phrase) => {
      const matchesCat = categoryFilter === "ALL" ? true : phrase.category === categoryFilter;
      const q = searchQuery.toLowerCase().trim();
      if (!q) return matchesCat;

      const matchesSearch =
        phrase.english.toLowerCase().includes(q) ||
        phrase.translated.toLowerCase().includes(q) ||
        phrase.pronunciation.toLowerCase().includes(q);

      return matchesCat && matchesSearch;
    });
  }, [currentGuide, categoryFilter, searchQuery]);

  // Category Icon helper
  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case "Greetings":
        return <HandMetal className="w-3 h-3 text-amber-500" />;
      case "Essentials":
        return <HelpCircle className="w-3 h-3 text-indigo-500" />;
      case "Dining":
        return <Utensils className="w-3 h-3 text-emerald-500" />;
      case "Transit":
        return <Train className="w-3 h-3 text-sky-500" />;
      case "Emergency":
        return <ShieldAlert className="w-3 h-3 text-rose-500" />;
      case "Numbers":
        return <Hash className="w-3 h-3 text-purple-500" />;
      default:
        return <Globe className="w-3 h-3 text-primary" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Language Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/80">
        <div>
          <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
            <Languages className="w-4 h-4 text-violet-500" />
            Travel Language Phrasebook & Voice Guide
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Polite travel phrases, ordering food, transit navigation, and emergency phrases with phonetic pronunciations and audio guide.
          </p>
        </div>

        {/* Language Select Dropdown & Active Voice Mode Badge */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          {playingKey && audioEngine && (
            <Badge
              variant="outline"
              className={`text-[10px] font-mono px-2 py-0.5 flex items-center gap-1.5 animate-in fade-in duration-150 ${
                audioEngine === "browser"
                  ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                  : audioEngine === "fish"
                  ? "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300"
                  : "border-sky-500/40 bg-sky-500/10 text-sky-700 dark:text-sky-300"
              }`}
            >
              {audioEngine === "loading" ? (
                <>
                  <Loader2 className="w-3 h-3 text-sky-600 animate-spin" />
                  <span>OpenRouter Loading...</span>
                </>
              ) : audioEngine === "fish" ? (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  <span>OpenRouter Fish Audio</span>
                </>
              ) : (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Native Device Voice</span>
                </>
              )}
            </Badge>
          )}

          <label htmlFor="language-select" className="text-xs font-medium text-muted-foreground whitespace-nowrap">
            Language:
          </label>
          <Select
            value={selectedLangName}
            onValueChange={(val) => {
              setSelectedLangName(val);
              setAiTranslation(null); // Reset custom translation on language switch
            }}
          >
            <SelectTrigger id="language-select" className="w-[180px] sm:w-[210px] h-9 text-xs cursor-pointer bg-background">
              <SelectValue placeholder="Select Language" />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGE_GUIDES.map((guide) => (
                <SelectItem key={guide.language} value={guide.language} className="text-xs cursor-pointer">
                  <span className="mr-2 text-sm">{guide.flag}</span>
                  <span>{guide.language}</span>
                  {guide.nativeName && (
                    <span className="ml-1.5 text-[10px] text-muted-foreground">
                      ({guide.nativeName})
                    </span>
                  )}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* AI Custom Sentence Translator (Google Translate-Style Auto-Detect & Bidirectional) */}
      <Card className="border-violet-500/30 bg-gradient-to-br from-violet-500/5 via-card to-card shadow-xs overflow-hidden">
        <CardHeader className="p-4 pb-2.5 border-b border-violet-500/20 bg-violet-500/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-violet-700 dark:text-violet-400 flex items-center gap-1.5">
                AI Travel Translator & Keypad Reader
                <Sparkles className="w-3 h-3 text-amber-500" />
              </CardTitle>
              <CardDescription className="text-[11px] text-muted-foreground">
                Auto-detects native keypad input, signage, or phrases in any language and translates directly to English.
              </CardDescription>
            </div>
          </div>

          {/* Google Translate Style Direction Selector */}
          <div className="flex items-center gap-1 bg-background/80 p-0.5 rounded-lg border border-violet-500/20 self-start sm:self-auto overflow-x-auto">
            <button
              type="button"
              onClick={() => setTranslateMode("auto")}
              className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-all cursor-pointer whitespace-nowrap ${
                translateMode === "auto"
                  ? "bg-violet-600 text-white shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              ✨ Auto → English
            </button>
            <button
              type="button"
              onClick={() => setTranslateMode("to-english")}
              className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-all cursor-pointer whitespace-nowrap ${
                translateMode === "to-english"
                  ? "bg-violet-600 text-white shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {currentGuide.language} → English
            </button>
            <button
              type="button"
              onClick={() =>
                setTranslateMode(translateMode === "to-target" ? "to-english" : "to-target")
              }
              className="p-1 text-muted-foreground hover:text-violet-600 transition-colors cursor-pointer"
              title="Swap translation direction"
            >
              <ArrowLeftRight className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={() => setTranslateMode("to-target")}
              className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-all cursor-pointer whitespace-nowrap ${
                translateMode === "to-target"
                  ? "bg-violet-600 text-white shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              English → {currentGuide.language}
            </button>
          </div>
        </CardHeader>

        <CardContent className="p-4 space-y-3">
          <form onSubmit={handleTranslateSubmit} className="flex gap-2 items-center">
            <div className="relative flex-1">
              <Input
                placeholder={
                  translateMode === "to-target"
                    ? `Type in English to translate into ${currentGuide.language} (e.g. "I have a peanut allergy" or "Please turn on the meter")...`
                    : translateMode === "to-english"
                    ? `Type or paste native ${currentGuide.language} text to translate into English...`
                    : `Type or paste ANY language (e.g. "こんにちは", "नमस्ते", "น้ำเปล่า", "Où est la gare ?") to translate to English...`
                }
                className="h-9 text-xs bg-background pr-8"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                disabled={isTranslating}
              />
            </div>
            <Button
              type="submit"
              size="sm"
              className="h-9 px-4 text-xs bg-violet-600 hover:bg-violet-700 text-white cursor-pointer shrink-0"
              disabled={isTranslating || !customInput.trim()}
            >
              {isTranslating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                  Translating...
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5 mr-1.5" />
                  Translate
                </>
              )}
            </Button>
          </form>

          {/* Translation Result Card */}
          {aiTranslation && (
            <div className="p-3.5 rounded-xl border border-violet-500/30 bg-violet-500/10 space-y-2.5 animate-in fade-in-50 duration-150">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <Badge variant="outline" className="text-[10px] font-mono border-violet-500/30 bg-background/80">
                    🌐 Detected: {aiTranslation.detectedLanguage || "Native"}
                  </Badge>
                  <span className="text-[10px] text-violet-700 dark:text-violet-400 font-medium">
                    {aiTranslation.direction === "to-english"
                      ? "→ Translated to English"
                      : `→ Translated to ${aiTranslation.targetLanguage}`}
                  </span>
                </div>
                <Badge variant="secondary" className="text-[9px] font-mono">
                  {aiTranslation.provider || "AI Translator"}
                </Badge>
              </div>

              {/* Large Translated Text */}
              <div>
                <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">
                  Translation:
                </div>
                <div className="text-base sm:text-lg font-bold text-foreground leading-snug">
                  {aiTranslation.translated}
                </div>
              </div>

              {/* Original Input Text */}
              <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                <span className="font-semibold text-foreground/80">Original:</span>
                <span className="italic">&quot;{aiTranslation.original}&quot;</span>
              </div>

              {/* Phonetic Pronunciation */}
              {aiTranslation.pronunciation && aiTranslation.pronunciation !== aiTranslation.translated && (
                <div className="text-xs font-mono text-violet-700 dark:text-violet-300 flex items-center gap-1.5">
                  <span className="text-muted-foreground font-sans">Pronunciation:</span>
                  <strong>&quot;{aiTranslation.pronunciation}&quot;</strong>
                </div>
              )}

              {/* Cultural nuance note */}
              {aiTranslation.culturalNote && (
                <div className="text-[11px] text-muted-foreground flex items-start gap-1.5 pt-1 border-t border-violet-500/20">
                  <Info className="w-3.5 h-3.5 text-violet-500 shrink-0 mt-0.5" />
                  <span>{aiTranslation.culturalNote}</span>
                </div>
              )}

              {/* Actions: Audio + Copy */}
              <div className="flex items-center gap-2 pt-1 flex-wrap">
                {/* Pronounce Primary Translation */}
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    handlePlaySpeech(
                      aiTranslation.translated,
                      aiTranslation.pronunciation,
                      aiTranslation.direction === "to-english" ? "en-US" : (aiTranslation.localeCode || currentGuide.localeCode),
                      aiTranslation.direction === "to-english" ? "English" : currentGuide.language,
                      "custom_ai_translated"
                    )
                  }
                  className="h-7 text-xs gap-1.5 cursor-pointer bg-background"
                >
                  {playingKey === "custom_ai_translated" ? (
                    audioEngine === "loading" ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 text-sky-500 animate-spin" />
                        <Badge variant="outline" className="text-[9px] font-mono px-1.5 py-0 border-sky-500/40 bg-sky-500/20 text-sky-700 dark:text-sky-300">
                          OpenRouter Loading...
                        </Badge>
                      </>
                    ) : audioEngine === "fish" ? (
                      <>
                        <Radio className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                        <Badge variant="outline" className="text-[9px] font-mono px-1.5 py-0 border-amber-500/40 bg-amber-500/20 text-amber-700 dark:text-amber-300">
                          OpenRouter Fish
                        </Badge>
                      </>
                    ) : (
                      <>
                        <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                        <Badge variant="outline" className="text-[9px] font-mono px-1.5 py-0 border-emerald-500/40 bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                          Native Voice
                        </Badge>
                      </>
                    )
                  ) : (
                    <>
                      <Volume2 className="w-3.5 h-3.5 text-violet-600" />
                      <span>Pronounce {aiTranslation.direction === "to-english" ? "English" : currentGuide.language}</span>
                    </>
                  )}
                </Button>

                {/* Pronounce Original if it was non-English */}
                {aiTranslation.direction === "to-english" && (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      handlePlaySpeech(
                        aiTranslation.original,
                        aiTranslation.pronunciation,
                        currentGuide.localeCode,
                        aiTranslation.detectedLanguage || currentGuide.language,
                        "custom_ai_original"
                      )
                    }
                    className="h-7 text-xs gap-1.5 cursor-pointer text-muted-foreground hover:text-foreground"
                    title="Pronounce original foreign text"
                  >
                    {playingKey === "custom_ai_original" ? (
                      audioEngine === "loading" ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 text-sky-500 animate-spin" />
                          <Badge variant="outline" className="text-[9px] font-mono px-1.5 py-0 border-sky-500/40 bg-sky-500/20 text-sky-700 dark:text-sky-300">
                            OpenRouter Loading...
                          </Badge>
                        </>
                      ) : audioEngine === "fish" ? (
                        <>
                          <Radio className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                          <Badge variant="outline" className="text-[9px] font-mono px-1.5 py-0 border-amber-500/40 bg-amber-500/20 text-amber-700 dark:text-amber-300">
                            OpenRouter Fish
                          </Badge>
                        </>
                      ) : (
                        <>
                          <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                          <Badge variant="outline" className="text-[9px] font-mono px-1.5 py-0 border-emerald-500/40 bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                            Native Voice
                          </Badge>
                        </>
                      )
                    ) : (
                      <>
                        <Volume2 className="w-3.5 h-3.5 text-muted-foreground" />
                        <span>Listen Original</span>
                      </>
                    )}
                  </Button>
                )}

                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => handleCopy(aiTranslation.translated, "custom_ai_copy")}
                  className="h-7 text-xs gap-1.5 cursor-pointer bg-background ml-auto"
                >
                  {copiedKey === "custom_ai_copy" ? (
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>{copiedKey === "custom_ai_copy" ? "Copied" : "Copy Translation"}</span>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Filter and Search Bar Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Category Filter Pills */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoryFilter(cat)}
              className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 border ${
                categoryFilter === cat
                  ? "bg-foreground text-background border-foreground font-semibold shadow-xs"
                  : "bg-muted/40 text-muted-foreground hover:text-foreground border-border/60 hover:bg-muted"
              }`}
            >
              {cat !== "ALL" && getCategoryIcon(cat)}
              <span>{cat}</span>
            </button>
          ))}
        </div>

        {/* Phrase Search Box */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder={`Search ${currentGuide.language} phrases...`}
            className="pl-8 h-8 text-xs bg-background"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Phrase Cards Grid */}
      {filteredPhrases.length === 0 ? (
        <div className="py-12 text-center text-xs text-muted-foreground">
          No phrases found matching &quot;{searchQuery}&quot; in category {categoryFilter}.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredPhrases.map((phrase, idx) => {
            const cardKey = `${selectedLangName}_${idx}`;
            const isEmergency = phrase.category === "Emergency";
            const isPlaying = playingKey === cardKey;
            const isCopied = copiedKey === cardKey;

            return (
              <Card
                key={cardKey}
                className={`shadow-xs transition-all border ${
                  isEmergency
                    ? "border-rose-500/30 bg-rose-500/5"
                    : "border-border/80 bg-card hover:border-border"
                }`}
              >
                <CardHeader className="p-3.5 pb-1 flex flex-row items-center justify-between border-b border-border/40">
                  <span className="text-xs font-semibold text-foreground truncate pr-2">
                    {phrase.english}
                  </span>
                  <Badge
                    variant={isEmergency ? "destructive" : "secondary"}
                    className="text-[9px] font-mono px-1.5 py-0 shrink-0 uppercase"
                  >
                    {phrase.category}
                  </Badge>
                </CardHeader>

                <CardContent className="p-3.5 pt-2.5 space-y-2 text-xs">
                  {/* Native Script with Copy Button */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="text-base font-bold text-foreground leading-snug">
                      {phrase.translated}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(phrase.translated, cardKey)}
                      className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer shrink-0"
                      title="Copy native text"
                    >
                      {isCopied ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  {/* Phonetic Pronunciation with Audio Play Button */}
                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-border/40 text-[11px]">
                    <div className="text-muted-foreground font-mono truncate">
                      Say: <strong className="text-foreground">&quot;{phrase.pronunciation}&quot;</strong>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        handlePlaySpeech(
                          phrase.translated,
                          phrase.pronunciation,
                          currentGuide.localeCode,
                          currentGuide.language,
                          cardKey
                        )
                      }
                      className={`px-2 py-1 rounded-md text-[11px] font-medium transition-all flex items-center gap-1 cursor-pointer shrink-0 ${
                        isPlaying
                          ? audioEngine === "fish"
                            ? "bg-amber-500/10 border border-amber-500/30 shadow-xs"
                            : audioEngine === "loading"
                            ? "bg-sky-500/10 border border-sky-500/30 shadow-xs"
                            : "bg-emerald-500/10 border border-emerald-500/30 shadow-xs"
                          : "bg-muted/50 hover:bg-muted text-foreground border border-border/60"
                      }`}
                      title="Play pronunciation"
                    >
                      {isPlaying ? (
                        audioEngine === "loading" ? (
                          <>
                            <Loader2 className="w-3 h-3 text-sky-600 animate-spin" />
                            <Badge variant="outline" className="text-[9px] font-mono px-1.5 py-0 border-sky-500/40 bg-sky-500/20 text-sky-700 dark:text-sky-300">
                              OpenRouter Loading...
                            </Badge>
                          </>
                        ) : audioEngine === "fish" ? (
                          <>
                            <Radio className="w-3 h-3 text-amber-600 animate-pulse" />
                            <Badge variant="outline" className="text-[9px] font-mono px-1.5 py-0 border-amber-500/40 bg-amber-500/20 text-amber-700 dark:text-amber-300">
                              OpenRouter Fish
                            </Badge>
                          </>
                        ) : (
                          <>
                            <Radio className="w-3 h-3 text-emerald-600 animate-pulse" />
                            <Badge variant="outline" className="text-[9px] font-mono px-1.5 py-0 border-emerald-500/40 bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                              Native Voice
                            </Badge>
                          </>
                        )
                      ) : (
                        <>
                          <Volume2 className="w-3 h-3 text-violet-600 dark:text-violet-400" />
                          <span>Listen</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Usage / Etiquette Note */}
                  {phrase.notes && (
                    <p className="text-[10px] text-muted-foreground italic pt-0.5">
                      💡 {phrase.notes}
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
