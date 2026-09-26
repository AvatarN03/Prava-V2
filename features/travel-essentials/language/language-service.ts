"use server";

import { callOpenRouterFree } from "@/lib/ai";

import type { AiTranslatedPhrase, LanguagePhrase } from "../types";

/**
 * Safely parse JSON from LLM output (handles code fences and leading/trailing text)
 */
function extractJsonFromLlm(raw: string): any {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {}

  const fenceMatch = raw.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (fenceMatch && fenceMatch[1]) {
    try {
      return JSON.parse(fenceMatch[1]);
    } catch {}
  }

  const braceMatch = raw.match(/\{[\s\S]*\}/);
  if (braceMatch) {
    try {
      return JSON.parse(braceMatch[0]);
    } catch {}
  }
  return null;
}

const LANGUAGE_LOCALE_MAP: Record<string, string> = {
  Japanese: "ja-JP",
  French: "fr-FR",
  Spanish: "es-ES",
  Polish: "pl-PL",
  Italian: "it-IT",
  German: "de-DE",
  Korean: "ko-KR",
  "Mandarin Chinese": "zh-CN",
  Chinese: "zh-CN",
  Hindi: "hi-IN",
  Arabic: "ar-SA",
  Portuguese: "pt-PT",
  Russian: "ru-RU",
  Turkish: "tr-TR",
  Thai: "th-TH",
  Vietnamese: "vi-VN",
  Indonesian: "id-ID",
  Greek: "el-GR",
  Dutch: "nl-NL",
};

/**
 * Translate any custom travel phrase bidirectional (Auto-detect / Any Language -> English or English -> Target Language)
 */
export async function translateCustomTravelPhrase(
  phrase: string,
  targetLanguage: string = "English",
  mode: "auto" | "to-english" | "to-target" = "auto",
  fallbackLocale?: string
): Promise<AiTranslatedPhrase> {
  const cleanInput = phrase.trim();

  if (!cleanInput) {
    return {
      original: "",
      translated: "",
      pronunciation: "",
      targetLanguage,
      localeCode: fallbackLocale || "en-US",
    };
  }

  const prompt = `You are a professional travel translator like Google Translate.
User input text: "${cleanInput}"
Mode: ${mode}
Selected Destination Language: ${targetLanguage}

Rules:
1. Detect the source language of the input text accurately (e.g. "Japanese", "Hindi", "Thai", "Spanish", "French", "Arabic", "English", etc.).
2. If Mode is "to-english" OR (Mode is "auto" and input is NOT English):
   - Translate the text into natural, clear English.
   - Set "direction" to "to-english".
   - Provide "pronunciation" for the original non-English text so the traveler knows how to say it.
3. If Mode is "to-target" OR (Mode is "auto" and input IS English):
   - Translate the text into ${targetLanguage} using accurate native script.
   - Set "direction" to "to-foreign".
   - Provide "pronunciation" for the ${targetLanguage} translation.

Respond strictly with valid JSON conforming to this schema:
{
  "detectedLanguage": "Name of input language",
  "translated": "Accurate translated text",
  "pronunciation": "Easy phonetic romanization",
  "culturalNote": "Short 1-sentence tip on meaning or travel etiquette",
  "direction": "to-english" or "to-foreign"
}`;

  // 1. Try Groq (Active Models: qwen/qwen3.8-27b, qwen/qwen3.6-27b, groq/compound-mini, openai/gpt-oss-20b)
  const groqKey = process.env.GROQ_API_KEY;
  if (groqKey) {
    const groqModels = [
      "qwen/qwen3.8-27b",
      "qwen/qwen3.6-27b",
      "groq/compound-mini",
      "openai/gpt-oss-20b",
    ];

    for (const model of groqModels) {
      try {
        const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${groqKey}`,
          },
          body: JSON.stringify({
            model,
            messages: [{ role: "user", content: prompt }],
            temperature: 0.1,
            response_format: { type: "json_object" },
          }),
          signal: AbortSignal.timeout(6000),
        });

        if (res.ok) {
          const json = await res.json();
          const rawContent = json.choices?.[0]?.message?.content;
          if (rawContent) {
            const parsed = extractJsonFromLlm(rawContent);
            if (parsed && (parsed.translated || parsed.translatedText)) {
              const translated = parsed.translated || parsed.translatedText;
              const isToEnglish = parsed.direction === "to-english" || mode === "to-english";
              const effectiveTarget = isToEnglish ? "English" : targetLanguage;
              const effectiveLocale = isToEnglish ? "en-US" : (fallbackLocale || LANGUAGE_LOCALE_MAP[targetLanguage] || "en-US");

              return {
                original: cleanInput,
                translated,
                pronunciation: parsed.pronunciation || parsed.phoneticPronunciation || cleanInput,
                targetLanguage: effectiveTarget,
                localeCode: effectiveLocale,
                culturalNote: parsed.culturalNote || parsed.culturalContext || `Translated from ${parsed.detectedLanguage || "native language"}.`,
                detectedLanguage: parsed.detectedLanguage || "Auto-detected",
                direction: isToEnglish ? "to-english" : "to-foreign",
                provider: `Groq (${model.split("/").pop()})`,
              };
            }
          }
        }
      } catch {
        // failover to next model
      }
    }
  }

  // 2. Try OpenRouter (inclusionai/ling-3.0-flash-sante:free, nex-agi/nex-n2.5-mini:free, liquid/lfm-2.5-2.6b:free)
  const openRouterRes = await callOpenRouterFree({
    messages: [{ role: "user", content: prompt }],
    temperature: 0.1,
    models: [
      "inclusionai/ling-3.0-flash-sante:free",
      "nex-agi/nex-n2.5-mini:free",
      "liquid/lfm-2.5-2.6b:free",
    ],
  });

  if (openRouterRes?.success && openRouterRes.text) {
    const parsed = extractJsonFromLlm(openRouterRes.text);
    if (parsed && (parsed.translated || parsed.translatedText)) {
      const translated = parsed.translated || parsed.translatedText;
      const isToEnglish = parsed.direction === "to-english" || mode === "to-english";
      const effectiveTarget = isToEnglish ? "English" : targetLanguage;
      const effectiveLocale = isToEnglish ? "en-US" : (fallbackLocale || LANGUAGE_LOCALE_MAP[targetLanguage] || "en-US");

      return {
        original: cleanInput,
        translated,
        pronunciation: parsed.pronunciation || parsed.phoneticPronunciation || cleanInput,
        targetLanguage: effectiveTarget,
        localeCode: effectiveLocale,
        culturalNote: parsed.culturalNote || parsed.culturalContext || `Translated from ${parsed.detectedLanguage || "native language"}.`,
        detectedLanguage: parsed.detectedLanguage || "Auto-detected",
        direction: isToEnglish ? "to-english" : "to-foreign",
        provider: `OpenRouter (${openRouterRes.modelUsed.split("/").pop()})`,
      };
    }
  }

  // Graceful fallback if offline
  return {
    original: cleanInput,
    translated: cleanInput,
    pronunciation: cleanInput,
    targetLanguage,
    localeCode: fallbackLocale || "en-US",
    culturalNote: "Translation offline. Please check your network connection.",
    provider: "Offline",
  };
}

/**
 * Generate contextual situational travel phrases using Groq Qwen
 */
export async function generateSituationalPhrases(
  situation: string,
  targetLanguage: string
): Promise<LanguagePhrase[]> {
  const cleanSituation = situation.trim();
  const groqKey = process.env.GROQ_API_KEY;

  if (groqKey && cleanSituation) {
    try {
      const prompt = `You are an expert travel linguist.
Generate 4 essential, polite phrases in ${targetLanguage} for this specific travel situation:
"${cleanSituation}"

Schema:
{
  "phrases": [
    {
      "category": "Essentials" | "Dining" | "Transit" | "Emergency",
      "english": "English meaning",
      "translated": "Native script in ${targetLanguage}",
      "pronunciation": "Phonetic romanization",
      "notes": "Short usage tip"
    }
  ]
}
Only output valid JSON.`;

      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${groqKey}`,
        },
        body: JSON.stringify({
          model: "qwen/qwen3.8-27b",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.3,
          response_format: { type: "json_object" },
        }),
        signal: AbortSignal.timeout(8000),
      });

      if (res.ok) {
        const json = await res.json();
        const rawContent = json.choices?.[0]?.message?.content;
        if (rawContent) {
          const parsed = extractJsonFromLlm(rawContent);
          if (parsed && Array.isArray(parsed.phrases) && parsed.phrases.length > 0) {
            return parsed.phrases.map((p: any) => ({
              category: p.category || "Essentials",
              english: p.english || "",
              translated: p.translated || "",
              pronunciation: p.pronunciation || p.translated || "",
              notes: p.notes || "",
            }));
          }
        }
      }
    } catch (err) {
      console.warn("[Language Service] Situational generation error:", err);
    }
  }

  return [];
}

// ─── In-memory server cache for synthesized speech audio ──────────────────────
const speechAudioCache = new Map<string, string>();

/**
 * Choose the most natural voice for the target language from OpenRouter deepgram/flux-tts:free
 */
function getFluxVoiceForLanguage(language: string, localeCode: string): string {
  const norm = (language || "").toLowerCase();
  const code = (localeCode || "").toLowerCase();

  if (norm.includes("hindi") || code.startsWith("hi")) {
    return "flux-naveen-en"; // Indian English phonetic / South Asian natural resonance
  }
  if (
    norm.includes("japan") ||
    code.startsWith("ja") ||
    norm.includes("korea") ||
    code.startsWith("ko") ||
    norm.includes("chinese") ||
    code.startsWith("zh") ||
    norm.includes("thai") ||
    code.startsWith("th")
  ) {
    return "flux-kai-en"; // Asian regional phonetic clarity
  }
  if (norm.includes("spanish") || norm.includes("italian") || norm.includes("portuguese")) {
    return "flux-marcelo-en"; // Romance phonetic resonance
  }
  if (norm.includes("french") || norm.includes("german") || norm.includes("polish")) {
    return "flux-elise-en";
  }
  return "flux-alexis-en"; // Universal travel voice
}

/**
 * Generate speech audio using OpenRouter free model deepgram/flux-tts:free
 * Returns base64 data URL (data:audio/mp3;base64,...)
 */
export async function generateAiSpeechAction(
  text: string,
  pronunciation?: string,
  language: string = "English",
  localeCode: string = "en-US"
): Promise<{ success: boolean; audioDataUrl?: string; voice?: string; error?: string }> {
  // Clean text: if the text is in non-Latin script (Japanese Kanji, Hindi Devanagari, Arabic, Thai, Korean, Chinese),
  // flux-tts:free (which expects Latin/phonetic input) produces optimal pronunciation when fed
  // the phonetic romanization! If Latin script (Spanish, Italian, French), use text or pronunciation.
  const isNonLatin = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\u0900-\u097f\u0600-\u06ff\u0e00-\u0e7f\uac00-\ud7af\u1100-\u11ff]/.test(text);
  const speechInput = (isNonLatin && pronunciation ? pronunciation : text)
    .replace(/\([^)]*\)/g, "")
    .replace(/[/]/g, " or ")
    .trim();

  if (!speechInput) {
    return { success: false, error: "No valid speech text provided" };
  }

  const voice = getFluxVoiceForLanguage(language, localeCode);
  const cacheKey = `${speechInput.toLowerCase()}_${voice}`;

  if (speechAudioCache.has(cacheKey)) {
    return {
      success: true,
      audioDataUrl: speechAudioCache.get(cacheKey)!,
      voice,
    };
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return { success: false, error: "OPENROUTER_API_KEY is not configured" };
  }

  try {
    const res = await fetch("https://openrouter.ai/api/v1/audio/speech", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "fish-audio/s2.1-pro-free:free",
        input: speechInput,
        voice,
        response_format: "mp3",
      }),
      signal: AbortSignal.timeout(9000),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      return {
        success: false,
        error: `OpenRouter Fish Audio HTTP ${res.status}: ${errText.slice(0, 150)}`,
      };
    }

    const arrayBuffer = await res.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    const audioDataUrl = `data:audio/mp3;base64,${base64}`;

    speechAudioCache.set(cacheKey, audioDataUrl);
    return {
      success: true,
      audioDataUrl,
      voice,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.name === "TimeoutError"
        ? "OpenRouter audio generation timed out (9s)."
        : `Network error: ${err.message || "Failed to generate speech"}`,
    };
  }
}
