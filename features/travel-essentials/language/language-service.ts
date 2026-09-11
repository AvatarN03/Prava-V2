"use server";

import { AiTranslatedPhrase, LanguagePhrase } from "../types";

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
 * Translate any custom travel phrase into target language using Groq-hosted Qwen
 */
export async function translateCustomTravelPhrase(
  phrase: string,
  targetLanguage: string,
  fallbackLocale?: string
): Promise<AiTranslatedPhrase> {
  const cleanInput = phrase.trim();
  const localeCode =
    fallbackLocale || LANGUAGE_LOCALE_MAP[targetLanguage] || "en-US";

  if (!cleanInput) {
    return {
      original: "",
      translated: "",
      pronunciation: "",
      targetLanguage,
      localeCode,
    };
  }

  const groqKey = process.env.GROQ_API_KEY;

  if (groqKey) {
    try {
      const prompt = `You are a concise, native-level travel language translator.
Translate this travel phrase into ${targetLanguage}:
"${cleanInput}"

Provide a JSON object with this exact schema:
{
  "translated": "Accurate, polite native script/characters in ${targetLanguage}",
  "pronunciation": "Easy-to-read phonetic romanization for English speakers (e.g. 'arigato gozaimasu' or 'merci beaucoup')",
  "culturalNote": "1 short sentence of practical travel context, politeness nuance, or usage tip"
}
Only return valid JSON.`;

      // Try Groq-hosted Qwen model (qwen-2.5-32b / qwen/qwen-2.5-coder-32b) with fallback to llama-3.3-70b-versatile
      const modelsToTry = [
        "qwen-2.5-32b",
        "qwen/qwen-2.5-coder-32b",
        "llama-3.3-70b-versatile",
      ];

      for (const model of modelsToTry) {
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
              temperature: 0.2,
              response_format: { type: "json_object" },
            }),
            signal: AbortSignal.timeout(7000),
          });

          if (res.ok) {
            const json = await res.json();
            const rawContent = json.choices?.[0]?.message?.content;
            if (rawContent) {
              const parsed = extractJsonFromLlm(rawContent);
              if (parsed && parsed.translated) {
                return {
                  original: cleanInput,
                  translated: parsed.translated,
                  pronunciation: parsed.pronunciation || parsed.translated,
                  targetLanguage,
                  localeCode,
                  culturalNote: parsed.culturalNote || `Polite phrasing in ${targetLanguage}.`,
                  provider: `Groq (${model})`,
                };
              }
            }
          }
        } catch {
          // Continue to next candidate model
        }
      }
    } catch (err) {
      console.warn("[Language Service] Groq Qwen translation error:", err);
    }
  }

  // Fallback offline dictionary / simple echo
  return {
    original: cleanInput,
    translated: cleanInput,
    pronunciation: cleanInput,
    targetLanguage,
    localeCode,
    culturalNote: `Show this text to a local speaker in ${targetLanguage}.`,
    provider: "Prava Offline Language Helper",
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
          model: "qwen-2.5-32b",
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
