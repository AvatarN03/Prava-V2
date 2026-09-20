"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";

import {
  AlertTriangle,
  BookOpen,
  Bot,
  Calculator,
  Calendar,
  Check,
  CheckCircle2,
  Compass,
  Copy,
  CreditCard,
  DollarSign,
  Droplets,
  ExternalLink,
  FileCheck,
  Flame,
  Globe,
  HeartPulse,
  Info,
  Landmark,
  Lightbulb,
  Loader2,
  MapPin,
  Newspaper,
  PhoneCall,
  RotateCw,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  XCircle,
  Zap,
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import {
  getCachedAiSummary,
  getCachedCountryInfo,
  getCachedNews,
  setCachedAiSummary,
  setCachedCountryInfo,
  setCachedNews,
} from "./country-cache";
import {
  fetchCountryNews,
  fetchCountrySuggestions,
  generateCountryAiSummary,
  searchCountryInfo,
} from "./country-service";

import { EMERGENCY_DIRECTORY } from "../emergency/emergency-data";
import type { CountryInfo, EmergencyContacts } from "../types";
import {
  ALLIANCE_FULL_NAMES,
  BORDER_COUNTRY_NAMES,
  getPassportVisaGuidance,
  QUICK_PICK_COUNTRIES,
  type QuickPickCountry,
} from "./country-constants";
import type {
  CountryAiSummary,
  CountryNewsArticle,
  CountrySuggestionItem,
} from "./country-service";

const REGIONS = ["All", "Europe", "Asia", "Americas", "Middle East"] as const;
type RegionType = (typeof REGIONS)[number];

export function CountryGuideView() {
  const [country, setCountry] = useState<CountryInfo | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<CountrySuggestionItem[]>([]);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSearching, startSearching] = useTransition();
  const [activeRegion, setActiveRegion] = useState<RegionType>("All");
  const [copiedNumber, setCopiedNumber] = useState<string | null>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // News and AI Summary State (OpenRouter exclusively)
  const [news, setNews] = useState<CountryNewsArticle[]>([]);
  const [isLoadingNews, setIsLoadingNews] = useState(false);
  const [aiSummary, setAiSummary] = useState<CountryAiSummary | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  // Interactive Tip Calculator state
  const [billAmount, setBillAmount] = useState<string>("50");
  const [tipPercent, setTipPercent] = useState<number>(10);

  const copyToClipboard = (num: string) => {
    if (!num) return;
    navigator.clipboard.writeText(num);
    setCopiedNumber(num);
    setTimeout(() => setCopiedNumber(null), 2000);
  };

  // Fetch default country (India) on mount — instant cache read to prevent reloading spam
  useEffect(() => {
    const cachedIndia = getCachedCountryInfo("India");
    if (cachedIndia) {
      setCountry(cachedIndia);
      setIsInitialLoading(false);
      return;
    }

    searchCountryInfo("India")
      .then((res) => {
        if (res) {
          setCountry(res);
          setCachedCountryInfo("India", res);
        }
        setIsInitialLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load initial country data:", err);
        setIsInitialLoading(false);
      });
  }, []);

  // Sync tip percent when country changes
  useEffect(() => {
    if (country) setTipPercent(country.tippingPercent ?? 10);
  }, [country]);

  // Passport visa snapshot
  const visaSnapshot = useMemo(() => {
    if (!country) return null;
    return getPassportVisaGuidance(country.name, country.code);
  }, [country]);

  // Regenerate live AI summary on demand (bypasses cache)
  const handleRegenerateAi = async () => {
    if (!country) return;
    setIsLoadingAi(true);
    try {
      const fresh = await generateCountryAiSummary(country.name, country, news, true);
      setAiSummary(fresh);
      setCachedAiSummary(country.name, fresh);
    } catch (err) {
      console.error("Failed to regenerate AI summary:", err);
    } finally {
      setIsLoadingAi(false);
    }
  };

  // Fetch live news & AI summary when country changes
  // Uses client-side persistent cache (localStorage) to avoid calling APIs on reloads
  useEffect(() => {
    let isCancelled = false;
    if (!country) return;

    // 1. Synchronously check client persistent cache
    const cachedNews = getCachedNews(country.name);
    const cachedSummary = getCachedAiSummary(country.name);

    if (cachedNews) {
      setNews(cachedNews);
      setIsLoadingNews(false);
    } else {
      setIsLoadingNews(true);
    }

    if (cachedSummary) {
      setAiSummary(cachedSummary);
      setIsLoadingAi(false);
    } else {
      setIsLoadingAi(true);
    }

    // If both news and AI summary are already cached, terminate here without any network call
    if (cachedNews && cachedSummary) {
      return;
    }

    // 2. Fetch missing data asynchronously
    const newsPromise = cachedNews
      ? Promise.resolve(cachedNews)
      : fetchCountryNews(country.name).then((articles) => {
        if (!isCancelled) {
          setNews(articles);
          setCachedNews(country.name, articles);
          setIsLoadingNews(false);
        }
        return articles;
      });

    newsPromise
      .then((articles) => {
        if (isCancelled) return;
        if (cachedSummary) return; // Summary already present in cache

        return generateCountryAiSummary(country.name, country, articles, false).then((summary) => {
          if (!isCancelled && summary) {
            setAiSummary(summary);
            setCachedAiSummary(country.name, summary);
            setIsLoadingAi(false);
          }
        });
      })
      .catch((err) => {
        console.error("Error loading news/AI summary:", err);
        if (!isCancelled) {
          setIsLoadingNews(false);
          setIsLoadingAi(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [country]);

  // Debounced country autocomplete suggestions (>= 2 chars)
  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (trimmed.length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSuggesting(true);
      try {
        const results = await fetchCountrySuggestions(trimmed);
        setSuggestions(results);
        setShowDropdown(results.length > 0);
      } catch (err) {
        console.error("Failed to load country suggestions:", err);
      } finally {
        setIsSuggesting(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside listener for suggestions dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectCountry = (targetName: string, shouldScroll = true) => {
    setShowDropdown(false);
    setSearchQuery("");
    if (shouldScroll && typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    const cached = getCachedCountryInfo(targetName);
    if (cached) {
      setCountry(cached);
      return;
    }
    startSearching(async () => {
      const res = await searchCountryInfo(targetName);
      if (res) {
        setCountry(res);
        setCachedCountryInfo(targetName, res);
      }
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    handleSelectCountry(searchQuery.trim());
  };

  // Filtered quick picks by selected region
  const filteredQuickPicks = useMemo(() => {
    const picks = QUICK_PICK_COUNTRIES as QuickPickCountry[];
    if (activeRegion === "All") return picks;
    return picks.filter((c) => c.region === activeRegion);
  }, [activeRegion]);

  // Calculated tip values
  const parsedBill = parseFloat(billAmount) || 0;
  const calculatedTip = (parsedBill * (tipPercent / 100)).toFixed(2);
  const totalWithTip = (parsedBill + parseFloat(calculatedTip)).toFixed(2);

  // Water safety badge styling
  const waterStatus = country?.waterSafetyStatus || "safe";
  const waterBadgeMeta =
    waterStatus === "safe"
      ? {
        label: "Safe to Drink (Potable)",
        bg: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
      }
      : waterStatus === "caution"
        ? {
          label: "Caution / Bottled Preferred",
          bg: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30",
        }
        : {
          label: "Bottled / Boiled Water Only",
          bg: "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30",
        };

  // Active Emergency Contacts for current country
  const emergency: EmergencyContacts = country?.emergencyContacts || {
    country: country?.name || "Global",
    code: country?.code || "??",
    dialCode: country?.callingCode || "+--",
    general: country?.emergencyNumber || "112 / 911",
    police: "112",
    ambulance: "112",
    fire: "112",
  };

  // Initial loading skeleton
  if (isInitialLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-32 w-full bg-muted/40 rounded-xl border border-border/50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
            <span>Loading country intelligence and emergency directory from live sources...</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-28 bg-muted/30 rounded-xl border border-border/40" />
          ))}
        </div>
      </div>
    );
  }

  if (!country) {
    return (
      <div className="py-16 text-center space-y-3">
        <div className="text-sm font-semibold text-foreground">Unable to load country data.</div>
        <p className="text-xs text-muted-foreground max-w-sm mx-auto">
          Please check your network or try searching for a specific country using the search bar below.
        </p>
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleSelectCountry("Japan")}
          className="text-xs"
        >
          Load Japan (Default)
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Search Bar Strip */}
      <div className="flex flex-col gap-3 pb-2 border-b border-border/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-500" />
                Country Guide & Emergency Directory
              </h2>
              <Badge variant="secondary" className="text-[10px] font-mono px-2 py-0">
                250+ Countries
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Live intelligence: visa rules, emergency hotlines, power plugs, tipping norms, geography, and AI news summaries.
            </p>
          </div>
        </div>

        {/* Search Bar & Region Switcher */}
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div ref={searchContainerRef} className="relative flex-1 max-w-md">
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search countries (e.g. Poland, Japan, France, Brazil)..."
                  className="pl-8 pr-8 h-9 text-xs bg-background"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (e.target.value.trim().length >= 2) {
                      setShowDropdown(true);
                    }
                  }}
                  onFocus={() => {
                    if (suggestions.length > 0 && searchQuery.trim().length >= 2) {
                      setShowDropdown(true);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") setShowDropdown(false);
                  }}
                  disabled={isSearching}
                />
                {(isSuggesting || isSearching) && (
                  <Loader2 className="absolute right-2.5 top-2.5 h-3.5 w-3.5 text-primary animate-spin" />
                )}
              </div>
              <Button
                type="submit"
                size="sm"
                className="h-9 px-3.5 text-xs cursor-pointer"
                disabled={isSearching}
              >
                {isSearching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Lookup"}
              </Button>
            </form>

            {/* Compact Autocomplete Suggestions Dropdown */}
            {showDropdown && suggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1 z-50 rounded-xl border border-border/80 bg-popover/95 backdrop-blur-md shadow-xl overflow-hidden py-1 divide-y divide-border/40 animate-in fade-in-50 zoom-in-95 duration-100 max-h-56 overflow-y-auto thin-scrollbar">
                {suggestions.map((item) => (
                  <button
                    key={`${item.code}-${item.name}`}
                    type="button"
                    onClick={() => handleSelectCountry(item.name)}
                    className="w-full text-left px-3 py-2 text-xs flex items-center justify-between gap-3 hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer group select-none"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-sm leading-none">{item.flag}</span>
                      <span className="font-semibold text-foreground group-hover:text-primary truncate">
                        {item.name}
                      </span>
                      <span className="text-muted-foreground text-[10px] truncate hidden sm:inline">
                        • {item.capital}
                      </span>
                    </div>

                    <span className="text-[10px] text-muted-foreground font-mono shrink-0">
                      {item.code}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Region Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
            {REGIONS.map((reg) => (
              <button
                key={reg}
                type="button"
                onClick={() => setActiveRegion(reg)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all whitespace-nowrap cursor-pointer border ${activeRegion === reg
                  ? "bg-primary text-primary-foreground border-primary font-semibold shadow-xs"
                  : "bg-muted/40 text-muted-foreground hover:text-foreground border-border/60 hover:bg-muted"
                  }`}
              >
                {reg}
              </button>
            ))}
          </div>
        </div>

        {/* Quick Country Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
          <span className="text-[11px] font-semibold text-muted-foreground mr-1 shrink-0">
            Quick pick:
          </span>
          {filteredQuickPicks.slice(0, 10).map((pick) => (
            <button
              key={pick.code}
              type="button"
              onClick={() => handleSelectCountry(pick.name)}
              className={`px-2.5 py-1 text-xs rounded-full border font-medium transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${country.name.toLowerCase() === pick.name.toLowerCase() || country.code === pick.code
                ? "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/40 font-semibold shadow-xs"
                : "bg-muted/50 text-muted-foreground hover:text-foreground border-border hover:bg-muted"
                }`}
            >
              <span>{pick.flag || "🌐"}</span>
              <span>{pick.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Selected Country Core Overview Banner */}
      <Card className="border-border/80 bg-gradient-to-br from-card via-card to-muted/20 shadow-xs overflow-hidden">
        <CardContent className="p-4 sm:p-5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                {country.flag && <span className="text-3xl leading-none">{country.flag}</span>}
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-2xl font-extrabold tracking-tight text-foreground">
                      {country.name}
                    </h3>
                    <Badge variant="secondary" className="font-mono text-xs">
                      {country.code}
                    </Badge>
                    {country.callingCode && (
                      <Badge variant="outline" className="font-mono text-xs text-rose-600 dark:text-rose-400 border-rose-500/30">
                        {country.callingCode}
                      </Badge>
                    )}
                    {country.region && (
                      <Badge variant="outline" className="text-xs">
                        {country.subregion || country.region}
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-[10px] font-mono border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 flex items-center gap-1">
                      <Globe className="w-3 h-3" />
                      <span>REST Countries v5 Live</span>
                    </Badge>
                  </div>
                  {country.officialName && country.officialName !== country.name && (
                    <p className="text-xs text-muted-foreground font-serif italic mt-0.5">
                      {country.officialName}
                    </p>
                  )}
                </div>
              </div>

              {/* Fast Facts Strip */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3 gap-1.5 text-xs text-muted-foreground sm:flex-wrap pt-0.5">
                <span>
                  Capital: <strong className="text-foreground font-semibold">{country.capital}</strong>
                </span>
                <span className="hidden sm:inline">•</span>
                <span>
                  Currency: <strong className="text-foreground font-semibold">{country.currency}</strong>
                </span>
                <span className="hidden sm:inline">•</span>
                <span>
                  Languages: <strong className="text-foreground font-semibold">{country.languages.join(", ")}</strong>
                </span>
                <span className="hidden sm:inline">•</span>
                <span>
                  Driving: <strong className="text-foreground font-semibold">{country.drivingSide}-hand</strong>
                </span>
                {country.population && (
                  <>
                    <span className="hidden sm:inline">•</span>
                    <span>
                      Population: <strong className="text-foreground font-semibold">{(country.population / 1_000_000).toFixed(1)}M</strong>
                    </span>
                  </>
                )}
                {country.areaKm && (
                  <>
                    <span className="hidden sm:inline">•</span>
                    <span>
                      Area: <strong className="text-foreground font-semibold">{country.areaKm.toLocaleString()} km²</strong>
                    </span>
                  </>
                )}
              </div>

              {/* Descriptions from v5 API */}
              {country.descriptionShort && (
                <p className="text-xs text-foreground/90 leading-relaxed pt-1 max-w-4xl">
                  {country.descriptionShort}
                </p>
              )}
            </div>

            {/* Links and Action Buttons */}
            <div className="flex flex-col items-start sm:items-end gap-2 shrink-0 border-t lg:border-t-0 pt-2 lg:pt-0 border-border/60 w-full sm:w-auto">
              {country.bestSeasons && (
                <div className="flex items-start gap-1.5 text-xs text-indigo-700 dark:text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1.5 rounded-lg w-full sm:max-w-xs">
                  <Calendar className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                  <span className="leading-snug text-left">{country.bestSeasons}</span>
                </div>
              )}
              <div className="flex items-center gap-2 flex-wrap pt-1 sm:pt-0">
                {country.googleMapsUrl && (
                  <a
                    href={country.googleMapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 font-medium bg-muted/40 px-2.5 py-1 rounded-md border border-border/50"
                  >
                    <MapPin className="h-3 w-3 text-primary" /> Maps <ExternalLink className="h-2.5 w-2.5" />
                  </a>
                )}
                {country.wikipediaUrl && (
                  <a
                    href={country.wikipediaUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 font-medium bg-muted/40 px-2.5 py-1 rounded-md border border-border/50"
                  >
                    <Globe className="h-3 w-3 text-sky-500" /> Wikipedia <ExternalLink className="h-2.5 w-2.5" />
                  </a>
                )}
                {country.officialUrl && (
                  <a
                    href={country.officialUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 font-medium bg-muted/40 px-2.5 py-1 rounded-md border border-border/50"
                  >
                    <Landmark className="h-3 w-3 text-emerald-500" /> Portal <ExternalLink className="h-2.5 w-2.5" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ─── INTEGRATED EMERGENCY & SAFETY HUB ───────────────────────────────── */}
      <Card className="border-rose-500/30 bg-gradient-to-br from-rose-500/5 via-card to-card shadow-sm overflow-hidden">
        <CardHeader className="p-4 pb-2.5 border-b border-rose-500/20 bg-rose-500/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400">
                {country.name} Emergency & Dispatch Contacts
              </CardTitle>
              <CardDescription className="text-[11px] text-muted-foreground">
                Dial directly or copy critical dispatch hotlines for emergency services in {country.name}.
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-mono text-xs border-rose-500/40 text-rose-600 dark:text-rose-400">
              Dial Code: {emergency.dialCode}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-4 space-y-4 text-xs">
          {/* Actionable Emergency Hotline Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* General Emergency */}
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex flex-col justify-between space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                  <PhoneCall className="w-3.5 h-3.5" /> General Emergency
                </span>
                <Badge variant="destructive" className="text-[9px] px-1.5 py-0 uppercase">Primary</Badge>
              </div>
              <div className="flex items-baseline justify-between pt-1">
                <span className="text-xl font-mono font-extrabold text-foreground">{emergency.general}</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(emergency.general)}
                  className="px-2 py-1 rounded-md bg-background/80 hover:bg-background border border-border text-[11px] font-medium text-foreground transition-all flex items-center gap-1 cursor-pointer"
                  title="Copy number"
                >
                  {copiedNumber === emergency.general ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedNumber === emergency.general ? "Copied" : "Copy"}</span>
                </button>
              </div>
            </div>

            {/* Police */}
            <div className="p-3 rounded-xl bg-card border border-border/70 flex flex-col justify-between space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-sky-500" /> Police
                </span>
                <span className="text-[10px] text-muted-foreground">Law Enforcement</span>
              </div>
              <div className="flex items-baseline justify-between pt-1">
                <span className="text-lg font-mono font-bold text-foreground">{emergency.police}</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(emergency.police)}
                  className="px-2 py-1 rounded-md bg-muted/50 hover:bg-muted border border-border/60 text-[11px] font-medium text-foreground transition-all flex items-center gap-1 cursor-pointer"
                >
                  {copiedNumber === emergency.police ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedNumber === emergency.police ? "Copied" : "Copy"}</span>
                </button>
              </div>
            </div>

            {/* Ambulance */}
            <div className="p-3 rounded-xl bg-card border border-border/70 flex flex-col justify-between space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <HeartPulse className="w-3.5 h-3.5 text-rose-500" /> Ambulance / Medical
                </span>
                <span className="text-[10px] text-muted-foreground">First Aid</span>
              </div>
              <div className="flex items-baseline justify-between pt-1">
                <span className="text-lg font-mono font-bold text-foreground">{emergency.ambulance}</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(emergency.ambulance)}
                  className="px-2 py-1 rounded-md bg-muted/50 hover:bg-muted border border-border/60 text-[11px] font-medium text-foreground transition-all flex items-center gap-1 cursor-pointer"
                >
                  {copiedNumber === emergency.ambulance ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedNumber === emergency.ambulance ? "Copied" : "Copy"}</span>
                </button>
              </div>
            </div>

            {/* Fire Brigade */}
            <div className="p-3 rounded-xl bg-card border border-border/70 flex flex-col justify-between space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-amber-500" /> Fire Department
                </span>
                <span className="text-[10px] text-muted-foreground">Rescue</span>
              </div>
              <div className="flex items-baseline justify-between pt-1">
                <span className="text-lg font-mono font-bold text-foreground">{emergency.fire}</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(emergency.fire)}
                  className="px-2 py-1 rounded-md bg-muted/50 hover:bg-muted border border-border/60 text-[11px] font-medium text-foreground transition-all flex items-center gap-1 cursor-pointer"
                >
                  {copiedNumber === emergency.fire ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedNumber === emergency.fire ? "Copied" : "Copy"}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Emergency Special Notes & Life Safety Notice */}
          <div className="p-3 rounded-xl bg-muted/30 border border-border/60 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <div className="space-y-1 text-[11px] leading-relaxed">
              <span className="font-semibold text-foreground">
                Emergency Dispatch & Traveler Protocol for {country.name}:
              </span>
              <p className="text-muted-foreground">
                {emergency.notes ||
                  `In European Union member states, 112 is standard and free of charge. When calling from an international SIM, ensure roaming enables emergency routing. In ${country.name}, announce your nationality and language immediately to connect with multi-lingual operators.`}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Travel Intelligence Summary & Live News Digest */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left (7 Cols): AI Executive Intelligence & Traveler Advisory */}
        <Card className="lg:col-span-7 border-border/80 bg-card shadow-xs flex flex-col justify-between">
          <CardHeader className="p-3.5 sm:p-4 pb-2.5 border-b border-border/50">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 w-full">
              {/* Left: Bot Icon + Title */}
              <div className="flex items-center gap-2 min-w-0">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                  <Bot className="w-4 h-4" />
                </div>
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-foreground truncate">
                  AI Travel Intelligence & Live Advisory
                </CardTitle>
              </div>

              {/* Right: Controls cleanly anchored to the far right */}
              <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end ml-auto">
                {/* Provenance Badge */}
                {aiSummary?.isAiGenerated ? (
                  <Badge
                    variant="outline"
                    className="text-[10px] font-mono border-purple-500/40 text-purple-600 dark:text-purple-400 bg-purple-500/10 flex items-center gap-1.5 shadow-xs px-2 py-0.5"
                    title={aiSummary.provider}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
                    <span>{aiSummary.provider}</span>
                  </Badge>
                ) : aiSummary?.hasError ? (
                  <Badge variant="outline" className="text-[10px] font-mono border-amber-500/40 text-amber-600 dark:text-amber-400 bg-amber-500/10 flex items-center gap-1 px-2 py-0.5">
                    <AlertTriangle className="w-3 h-3 text-amber-500" />
                    <span>AI Service Notice</span>
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-[10px] font-mono border-border text-muted-foreground bg-muted/40 flex items-center gap-1 px-2 py-0.5">
                    <Info className="w-3 h-3" />
                    <span>Curated Data</span>
                  </Badge>
                )}

                {/* Timestamp */}
                {aiSummary?.generatedAt && (
                  <span className="text-[10px] text-muted-foreground font-mono hidden sm:inline">
                    {aiSummary.generatedAt}
                  </span>
                )}

                {/* Regenerate or Retry Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRegenerateAi}
                  disabled={isLoadingAi}
                  className="h-6 text-[11px] px-2 gap-1 cursor-pointer hover:bg-purple-500/10 hover:text-purple-600 dark:hover:text-purple-400 shrink-0"
                  title="Generate live travel summary via AI"
                >
                  <Sparkles className={`w-3 h-3 ${isLoadingAi ? "animate-spin text-purple-500" : "text-purple-500"}`} />
                  <span>{isLoadingAi ? "Connecting..." : aiSummary?.hasError ? "Retry AI" : "Regenerate"}</span>
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-4 space-y-3.5 text-xs flex-1">
            {isLoadingAi ? (
              <div className="py-8 flex flex-col items-center justify-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                <span>Synthesizing travel conditions and safety advisory...</span>
              </div>
            ) : aiSummary ? (
              <div className="space-y-3">
                {/* AI Service Error Notice with Inline Retry & Fallback Details */}
                {aiSummary.hasError && (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-2.5 min-w-0">
                      <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                      <div className="space-y-0.5 min-w-0">
                        <span className="font-semibold text-foreground text-xs block">
                          AI Service Notice
                        </span>
                        <p className="text-[11px] text-muted-foreground leading-relaxed">
                          {aiSummary.errorMessage || "AI providers were busy. Showing authentic verified data below."}
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleRegenerateAi}
                      disabled={isLoadingAi}
                      className="h-7 text-xs px-2.5 gap-1.5 border-amber-500/40 text-amber-700 dark:text-amber-300 hover:bg-amber-500/10 cursor-pointer shrink-0 self-end sm:self-center"
                    >
                      <RotateCw className={`w-3 h-3 ${isLoadingAi ? "animate-spin" : ""}`} />
                      <span>Retry AI</span>
                    </Button>
                  </div>
                )}
                {/* 1. Travel Vibe Overview */}
                <p className="text-foreground leading-relaxed text-xs">
                  {aiSummary.vibe}
                </p>

                {/* 2. Advisory Status Pill */}
                <div className="p-2.5 rounded-xl bg-muted/40 border border-border/50 flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <span className="font-bold text-foreground block text-[11px]">
                      Safety & Travel Assessment:
                    </span>
                    <p className="text-muted-foreground text-[11px] leading-relaxed">
                      {aiSummary.advisoryReason}
                    </p>
                  </div>
                </div>

                {/* 3. Live News & Event Actionable Bullets */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] font-bold text-foreground block">
                    Traveler Digest & Key Updates:
                  </span>
                  <div className="space-y-1.5">
                    {aiSummary.newsDigest.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-[11px] text-muted-foreground">
                        <span className="text-indigo-500 font-bold shrink-0">•</span>
                        <span className="leading-snug">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 4. Insider Hack / Tip */}
                {aiSummary.insiderTip && (
                  <div className="p-2.5 rounded-xl bg-amber-500/5 border border-amber-500/20 flex items-start gap-2 text-[11px]">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                    <span className="text-foreground">
                      <strong>Insider Tip:</strong> {aiSummary.insiderTip}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-muted-foreground">
                AI Intelligence summary unavailable.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right (5 Cols): Live News Feed Articles */}
        <Card className="lg:col-span-5 border-border/80 bg-card shadow-xs flex flex-col">
          <CardHeader className="p-4 pb-2.5 border-b border-border/50 flex flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-500/10 text-sky-600">
                <Newspaper className="w-4 h-4" />
              </div>
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-foreground">
                Latest News & Headlines
              </CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[10px] font-mono border-sky-500/30 text-sky-600 dark:text-sky-400 bg-sky-500/10 flex items-center gap-1">
                NewsAPI.org Live Feed
              </Badge>
              {isLoadingNews && (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
              )}
            </div>
          </CardHeader>

          <CardContent className="p-3 flex-1 overflow-y-auto max-h-[320px] thin-scrollbar space-y-2">
            {isLoadingNews ? (
              <div className="py-8 text-center text-xs text-muted-foreground flex flex-col items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                <span>Fetching latest headlines...</span>
              </div>
            ) : news.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted-foreground">
                No recent news reports found.
              </div>
            ) : (
              news.map((item, idx) => (
                <a
                  key={idx}
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2.5 rounded-xl border border-border/60 bg-muted/20 hover:bg-muted/50 hover:border-border transition-all block group cursor-pointer space-y-1"
                >
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                    <span className="font-semibold text-sky-600 dark:text-sky-400">
                      {item.source}
                    </span>
                    <span>{item.publishedAt}</span>
                  </div>

                  <h4 className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors leading-snug line-clamp-2">
                    {item.title}
                  </h4>

                  <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                </a>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Core Intelligence Matrix: Plugs, Tipping, Water, Visa, Cash, Geography */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* 1. Electrical Plugs & Voltage */}
        <Card className="border-border/80 bg-card shadow-xs">
          <CardHeader className="p-4 pb-2 border-b border-border/50">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Zap className="w-4 h-4" />
              </div>
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-foreground">
                Power Plugs & Voltage
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-4 space-y-2 text-xs">
            <div className="flex items-center gap-1.5 flex-wrap">
              {country.plugTypes.map((plug) => (
                <Badge key={plug} variant="secondary" className="font-mono text-xs font-bold">
                  {plug}
                </Badge>
              ))}
            </div>
            <div className="flex items-center justify-between text-[11px] pt-1 font-mono">
              <span className="text-muted-foreground">Grid Voltage:</span>
              <strong className="text-foreground">{country.voltage}</strong>
            </div>
          </CardContent>
        </Card>

        {/* 2. Tipping Customs & Interactive Calculator */}
        <Card className="border-border/80 bg-card shadow-xs">
          <CardHeader className="p-4 pb-2 border-b border-border/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
                  <DollarSign className="w-4 h-4" />
                </div>
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Tipping Calculator
                </CardTitle>
              </div>
              <Badge variant="outline" className="text-[10px] font-mono">
                {country.tippingPercent ? `~${country.tippingPercent}%` : "No tip"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-4 space-y-2.5 text-xs">
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              {country.tipping}
            </p>

            {/* Quick Bill Tip Calculator */}
            <div className="p-2.5 rounded-lg bg-muted/40 border border-border/50 space-y-1.5">
              <div className="flex items-center justify-between gap-1">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase flex items-center gap-1">
                  <Calculator className="w-3 h-3 text-emerald-600" /> Bill ($):
                </span>
                <div className="flex items-center gap-1">
                  {[0, 5, 10, 15, 20].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => setTipPercent(pct)}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-mono transition-colors cursor-pointer ${tipPercent === pct
                        ? "bg-emerald-600 text-white font-bold"
                        : "bg-muted text-muted-foreground hover:text-foreground"
                        }`}
                    >
                      {pct}%
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 items-center">
                <Input
                  type="number"
                  min="0"
                  value={billAmount}
                  onChange={(e) => setBillAmount(e.target.value)}
                  className="h-7 text-xs font-mono font-bold"
                  placeholder="50"
                />
                <div className="text-right font-mono text-[11px]">
                  <div className="text-muted-foreground">
                    Tip: <strong className="text-emerald-600 dark:text-emerald-400">+{calculatedTip}</strong>
                  </div>
                  <div className="font-bold text-foreground text-xs">
                    Total: {totalWithTip}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 3. Tap Water Safety */}
        <Card className="border-border/80 bg-card shadow-xs">
          <CardHeader className="p-4 pb-2 border-b border-border/50">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-500/10 text-sky-600">
                <Droplets className="w-4 h-4" />
              </div>
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-foreground">
                Tap Water Safety
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-4 space-y-2 text-xs">
            <div className={`p-2 rounded-lg border text-xs font-semibold flex items-center gap-2 ${waterBadgeMeta.bg}`}>
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>{waterBadgeMeta.label}</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              {country.tapWater}
            </p>
          </CardContent>
        </Card>

        {/* 4. Passport & Visa Snapshot */}
        <Card className="border-border/80 bg-card shadow-xs">
          <CardHeader className="p-4 pb-2 border-b border-border/50">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <FileCheck className="w-4 h-4" />
                </div>
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Passport & Visa Snapshot
                </CardTitle>
              </div>
              {visaSnapshot && (
                <Badge
                  variant="outline"
                  className={`text-[10px] font-semibold ${visaSnapshot.status === "Citizen" || visaSnapshot.status === "Visa Free"
                    ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                    : visaSnapshot.status === "Visa on Arrival"
                      ? "bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/30"
                      : visaSnapshot.status === "eVisa"
                        ? "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30"
                        : "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30"
                    }`}
                >
                  {visaSnapshot.status}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-4 space-y-3 text-xs">
            {visaSnapshot?.duration && (
              <div className="flex items-center justify-between text-[11px] pb-2 border-b border-border/40">
                <span className="text-muted-foreground font-medium">Permitted Stay:</span>
                <strong className="font-semibold text-foreground font-mono">{visaSnapshot.duration}</strong>
              </div>
            )}
            <p className="text-[11px] text-foreground leading-relaxed">
              {visaSnapshot?.note || country.visaInfo}
            </p>
            <p className="text-[10px] text-muted-foreground border-t border-border/40 pt-2.5 leading-normal">
              Passports must have at least <strong>6 months</strong> remaining validity from departure date.
            </p>
          </CardContent>
        </Card>

        {/* 5. Payment & Cash Culture */}
        <Card className="border-border/80 bg-card shadow-xs">
          <CardHeader className="p-4 pb-2.5 border-b border-border/50">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600">
                <CreditCard className="w-4 h-4" />
              </div>
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-foreground">
                Payment & Currency
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-4 space-y-3 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-border/40">
              <span className="font-medium text-muted-foreground text-[11px]">Official Currency:</span>
              <strong className="font-mono text-xs font-semibold text-foreground">{country.currency}</strong>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed pt-0.5">
              Cards and digital pay are widely accepted in major cities. Keep small local currency notes for traditional kiosks and markets.
            </p>
          </CardContent>
        </Card>

        {/* 6. Geography & Borders */}
        <Card className="border-border/80 bg-card shadow-xs">
          <CardHeader className="p-4 pb-2.5 border-b border-border/50">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600">
                <Compass className="w-4 h-4" />
              </div>
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-foreground">
                Geography & Borders
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-4 space-y-3 text-xs">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-muted-foreground font-medium">Landlocked Status:</span>
              <strong className="text-foreground font-semibold">{country.landlocked ? "Landlocked Nation" : "Coastal / Island Nation"}</strong>
            </div>

            {country.borders && country.borders.length > 0 && (
              <div className="space-y-1.5 pt-2 border-t border-border/40">
                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">
                  Bordering Nations:
                </span>
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {country.borders.map((b) => {
                    const countryName = BORDER_COUNTRY_NAMES[b.toUpperCase()] || b;
                    return (
                      <TooltipProvider key={b} delayDuration={150}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge
                              variant="outline"
                              className="font-mono text-[10px] px-2 py-0.5 cursor-help hover:border-primary/50 hover:bg-primary/5 transition-colors"
                            >
                              {b}
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="text-xs font-sans font-medium">
                            {countryName}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    );
                  })}
                </div>
              </div>
            )}

            {country.memberships && country.memberships.length > 0 && (
              <div className="space-y-1.5 pt-2 border-t border-border/40">
                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">
                  Alliances & Treaties:
                </span>
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {country.memberships.map((m) => {
                    const fullName = ALLIANCE_FULL_NAMES[m.toUpperCase()] || m;
                    return (
                      <TooltipProvider key={m} delayDuration={150}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge
                              variant="secondary"
                              className="text-[10px] px-2 py-0.5 font-semibold cursor-help hover:bg-primary/15 hover:text-primary transition-colors"
                            >
                              {m}
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="text-xs font-sans font-medium max-w-xs text-center">
                            {fullName}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Cultural Dos & Don'ts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card className="border-border/80 bg-card shadow-xs">
          <CardHeader className="p-3.5 pb-2 border-b border-border/50 bg-emerald-500/5">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
              <CardTitle className="text-xs font-bold uppercase tracking-wider">
                Cultural &quot;Dos&quot; in {country.name}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-3.5 space-y-2 text-xs">
            {(country.dos && country.dos.length > 0 ? country.dos : country.topCustoms).map(
              (custom, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 p-2 rounded-lg border border-border/60 bg-muted/20 text-[11px]"
                >
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-[9px] font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                    {idx + 1}
                  </span>
                  <p className="text-foreground leading-relaxed">{custom}</p>
                </div>
              )
            )}
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-card shadow-xs">
          <CardHeader className="p-3.5 pb-2 border-b border-border/50 bg-rose-500/5">
            <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
              <XCircle className="w-4 h-4" />
              <CardTitle className="text-xs font-bold uppercase tracking-wider">
                Cultural &quot;Don&apos;ts&quot; to Avoid
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-3.5 space-y-2 text-xs">
            {(country.donts && country.donts.length > 0
              ? country.donts
              : [
                "Don't ignore local dress codes at sacred religious monuments.",
                "Don't display large sums of physical cash in crowded transit areas.",
                "Don't photograph military or government buildings without consent.",
              ]
            ).map((dontItem, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2.5 p-2 rounded-lg border border-rose-500/20 bg-rose-500/5 text-[11px]"
              >
                <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-rose-500/20 text-[9px] font-bold text-rose-600 dark:text-rose-400 mt-0.5">
                  ✕
                </span>
                <p className="text-foreground leading-relaxed">{dontItem}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Global Emergency Quick Directory Browser */}
      <Card className="border-border/80 bg-card shadow-xs">
        <CardHeader className="p-4 pb-2.5 border-b border-border/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-500/10 text-rose-600">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Global Emergency Quick Reference
                </CardTitle>
                <CardDescription className="text-[11px] text-muted-foreground">
                  Quick lookup of primary emergency numbers across major global destinations.
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
            {EMERGENCY_DIRECTORY.slice(0, 12).map((item) => (
              <button
                key={item.country}
                type="button"
                onClick={() => handleSelectCountry(item.country.split(" ")[0])}
                className={`p-2.5 rounded-xl border text-left transition-all hover:bg-muted/50 cursor-pointer space-y-1 ${country.code.toUpperCase() === item.code.toUpperCase()
                  ? "border-rose-500/40 bg-rose-500/5"
                  : "border-border/60 bg-muted/20"
                  }`}
              >
                <div className="flex items-center justify-between text-[11px] font-bold text-foreground">
                  <span className="truncate">{item.country.split(" (")[0]}</span>
                  <span className="font-mono text-[9px] text-muted-foreground">{item.code}</span>
                </div>
                <div className="flex items-baseline justify-between text-[10px]">
                  <span className="text-muted-foreground">Emergency:</span>
                  <span className="font-mono font-bold text-rose-600 dark:text-rose-400">{item.general}</span>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
