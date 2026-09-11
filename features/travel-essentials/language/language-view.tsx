"use client";

import { useState, useMemo, useTransition, useEffect } from "react";
import {
  Languages,
  Search,
  Volume2,
  VolumeX,
  Copy,
  Check,
  Sparkles,
  Bot,
  Send,
  Loader2,
  Info,
  ShieldAlert,
  Utensils,
  Train,
  HandMetal,
  HelpCircle,
  Hash,
  Globe,
  Radio,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LANGUAGE_GUIDES } from "./language-data";
import { translateCustomTravelPhrase } from "./language-service";
import { LanguagePhrase, AiTranslatedPhrase } from "../types";

const CATEGORIES = ["ALL", "Greetings", "Essentials", "Dining", "Transit", "Emergency", "Numbers"] as const;
type CategoryType = (typeof CATEGORIES)[number];

export function LanguageView() {
  const [selectedLangName, setSelectedLangName] = useState<string>("Japanese");
  const [categoryFilter, setCategoryFilter] = useState<CategoryType>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [playingKey, setPlayingKey] = useState<string | null>(null);

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

  // Browser SpeechSynthesis Audio Player with exact locale matching
  const handlePlaySpeech = (text: string, localeCode: string, key: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      alert("Text-to-speech is not supported in this browser.");
      return;
    }

    // Cancel any currently playing speech
    window.speechSynthesis.cancel();

    // Clean text: strip annotations in parentheses for cleaner native speech
    const speechText = text.replace(/\([^)]*\)/g, "").trim() || text;

    const utterance = new SpeechSynthesisUtterance(speechText);
    utterance.lang = localeCode || "en-US";
    utterance.rate = 0.85; // Slightly slower for clear traveler comprehension
    utterance.pitch = 1.0;

    // Try finding matching voice for locale
    const voices = window.speechSynthesis.getVoices();
    const matchingVoice = voices.find(
      (v) =>
        v.lang.toLowerCase() === localeCode.toLowerCase() ||
        v.lang.toLowerCase().startsWith(localeCode.split("-")[0].toLowerCase())
    );
    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }

    utterance.onstart = () => setPlayingKey(key);
    utterance.onend = () => setPlayingKey(null);
    utterance.onerror = () => setPlayingKey(null);

    window.speechSynthesis.speak(utterance);
  };

  // Trigger custom AI translation with Groq Qwen
  const handleTranslateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customInput.trim()) return;

    startTranslating(async () => {
      const res = await translateCustomTravelPhrase(
        customInput.trim(),
        currentGuide.language,
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
      <div className="flex flex-col gap-3 pb-2 border-b border-border/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                <Languages className="w-4 h-4 text-violet-500" />
                Travel Language Phrasebook & Voice Guide
              </h2>
              <Badge variant="secondary" className="text-[10px] font-mono px-2 py-0">
                10 Languages • Native Audio
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Polite travel phrases, ordering food, transit navigation, and emergency phrases with phonetic pronunciations and native voice.
            </p>
          </div>
        </div>

        {/* Language Selection Strip */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
          {LANGUAGE_GUIDES.map((guide) => (
            <button
              key={guide.language}
              type="button"
              onClick={() => {
                setSelectedLangName(guide.language);
                setAiTranslation(null); // Reset custom translation on language switch
              }}
              className={`px-3 py-1.5 text-xs rounded-xl border font-medium transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                selectedLangName === guide.language
                  ? "bg-violet-500/10 text-violet-700 dark:text-violet-400 border-violet-500/40 font-semibold shadow-xs"
                  : "bg-muted/40 text-muted-foreground hover:text-foreground border-border/60 hover:bg-muted"
              }`}
            >
              <span className="text-sm leading-none">{guide.flag}</span>
              <span>{guide.language}</span>
              {guide.nativeName && (
                <span className="text-[10px] opacity-70 font-normal hidden sm:inline">
                  ({guide.nativeName})
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* AI Custom Sentence Translator (Groq Qwen) */}
      <Card className="border-violet-500/30 bg-gradient-to-br from-violet-500/5 via-card to-card shadow-xs overflow-hidden">
        <CardHeader className="p-4 pb-2.5 border-b border-violet-500/20 bg-violet-500/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-violet-700 dark:text-violet-400 flex items-center gap-1.5">
                AI Travel Translator for {currentGuide.language}
                <Sparkles className="w-3 h-3 text-amber-500" />
              </CardTitle>
              <CardDescription className="text-[11px] text-muted-foreground">
                Type any custom phrase (e.g. food allergies, taxi directions, special requests) for instant translation with voice.
              </CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="text-[10px] font-mono text-muted-foreground">
            Groq Qwen AI
          </Badge>
        </CardHeader>

        <CardContent className="p-4 space-y-3">
          <form onSubmit={handleTranslateSubmit} className="flex gap-2 items-center">
            <div className="relative flex-1">
              <Input
                placeholder={`Type in English to translate into ${currentGuide.language} (e.g. "I have a peanut allergy" or "Please turn on the meter")...`}
                className="h-9 text-xs bg-background pr-8"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                disabled={isTranslating}
              />
            </div>
            <Button
              type="submit"
              size="sm"
              className="h-9 px-4 text-xs bg-violet-600 hover:bg-violet-700 text-white cursor-pointer"
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
            <div className="p-3.5 rounded-xl border border-violet-500/30 bg-violet-500/10 space-y-2 animate-in fade-in-50 duration-150">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-muted-foreground">
                  English: &quot;{aiTranslation.original}&quot;
                </span>
                <Badge variant="secondary" className="text-[9px] font-mono">
                  {aiTranslation.provider || "Groq Qwen"}
                </Badge>
              </div>

              {/* Large Native Script */}
              <div className="text-base sm:text-lg font-bold text-foreground">
                {aiTranslation.translated}
              </div>

              {/* Phonetic Pronunciation */}
              <div className="text-xs font-mono text-violet-700 dark:text-violet-300 flex items-center gap-1.5">
                <span className="text-muted-foreground font-sans">Say:</span>
                <strong>&quot;{aiTranslation.pronunciation}&quot;</strong>
              </div>

              {/* Cultural nuance note */}
              {aiTranslation.culturalNote && (
                <div className="text-[11px] text-muted-foreground flex items-start gap-1.5 pt-1 border-t border-violet-500/20">
                  <Info className="w-3.5 h-3.5 text-violet-500 shrink-0 mt-0.5" />
                  <span>{aiTranslation.culturalNote}</span>
                </div>
              )}

              {/* Actions: Audio + Copy */}
              <div className="flex items-center gap-2 pt-1">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    handlePlaySpeech(
                      aiTranslation.translated,
                      aiTranslation.localeCode,
                      "custom_ai"
                    )
                  }
                  className="h-7 text-xs gap-1.5 cursor-pointer bg-background"
                >
                  {playingKey === "custom_ai" ? (
                    <Radio className="w-3.5 h-3.5 text-violet-600 animate-pulse" />
                  ) : (
                    <Volume2 className="w-3.5 h-3.5 text-violet-600" />
                  )}
                  <span>{playingKey === "custom_ai" ? "Speaking..." : "Pronounce"}</span>
                </Button>

                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => handleCopy(aiTranslation.translated, "custom_ai_copy")}
                  className="h-7 text-xs gap-1.5 cursor-pointer bg-background"
                >
                  {copiedKey === "custom_ai_copy" ? (
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>{copiedKey === "custom_ai_copy" ? "Copied" : "Copy Text"}</span>
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
                          currentGuide.localeCode,
                          cardKey
                        )
                      }
                      className={`px-2 py-1 rounded-md text-[11px] font-medium transition-all flex items-center gap-1 cursor-pointer shrink-0 ${
                        isPlaying
                          ? "bg-violet-500 text-white shadow-xs"
                          : "bg-muted/50 hover:bg-muted text-foreground border border-border/60"
                      }`}
                      title="Play pronunciation"
                    >
                      {isPlaying ? (
                        <Radio className="w-3 h-3 animate-pulse" />
                      ) : (
                        <Volume2 className="w-3 h-3 text-violet-600 dark:text-violet-400" />
                      )}
                      <span>{isPlaying ? "Playing" : "Listen"}</span>
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
