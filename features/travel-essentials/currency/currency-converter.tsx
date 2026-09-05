"use client";

import { useState, useTransition, useEffect, useMemo, useRef } from "react";
import {
  ArrowRightLeft,
  Coins,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Plus,
  Trash2,
  Search,
  Star,
  Sparkles,
  Info,
  Calendar,
  Check,
  ChevronRight,
  ShieldCheck,
  LineChart,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FxRates, CurrencyPerformanceData, SupportedCurrency } from "../types";
import { SUPPORTED_CURRENCIES } from "./currency-service";

interface CurrencyConverterProps {
  initialRates: FxRates | null;
  userPreferredCurrency?: string;
  onRefresh: (base: string) => Promise<FxRates | null>;
  onFetchPerformance?: (
    base: string,
    target: string,
    range: "7D" | "1M" | "3M" | "1Y"
  ) => Promise<CurrencyPerformanceData | null>;
}

type TimeRange = "7D" | "1M" | "3M" | "1Y";

export function CurrencyConverter({
  initialRates,
  userPreferredCurrency = "USD",
  onRefresh,
  onFetchPerformance,
}: CurrencyConverterProps) {
  const [rates, setRates] = useState<FxRates | null>(initialRates);
  const [baseCurrency, setBaseCurrency] = useState<string>(userPreferredCurrency);
  const [selectedTarget, setSelectedTarget] = useState<string>(
    userPreferredCurrency === "EUR" ? "GBP" : "EUR"
  );
  const [amount, setAmount] = useState<string>("100");
  const [isRefreshing, startRefresh] = useTransition();

  // Client-side in-memory caches for instantaneous UI switching
  const ratesCacheRef = useRef<Map<string, FxRates>>(new Map());
  const perfCacheRef = useRef<Map<string, CurrencyPerformanceData>>(new Map());

  // Seed cache with initialRates if provided
  useEffect(() => {
    if (initialRates && initialRates.base) {
      ratesCacheRef.current.set(initialRates.base.toUpperCase(), initialRates);
    }
  }, [initialRates]);

  // If initialRates was null on mount (e.g. on-demand tab loading), fetch rates
  useEffect(() => {
    if (!rates) {
      const cleanBase = baseCurrency.toUpperCase();
      const cached = ratesCacheRef.current.get(cleanBase);
      if (cached) {
        setRates(cached);
      } else {
        startRefresh(async () => {
          const updated = await onRefresh(cleanBase);
          if (updated) {
            ratesCacheRef.current.set(cleanBase, updated);
            setRates(updated);
          }
        });
      }
    }
  }, [rates, baseCurrency, onRefresh]);

  // Watchlist state persisted in localStorage
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Performance historical chart state
  const [range, setRange] = useState<TimeRange>("1M");
  const [perfData, setPerfData] = useState<CurrencyPerformanceData | null>(null);
  const [isLoadingPerf, startPerfTransition] = useTransition();
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null);

  // Currency search filter for ratings table
  const [searchQuery, setSearchQuery] = useState("");
  const [addWatchlistOpen, setAddWatchlistOpen] = useState(false);
  const [currencyToAdd, setCurrencyToAdd] = useState("");

  // Load persisted watchlist from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("prava_fx_watchlist");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setWatchlist(parsed.filter((c) => c !== baseCurrency));
          setIsLoaded(true);
          return;
        }
      }
    } catch {
      // Ignore parse error
    }

    // Default watchlist if none stored
    const defaults = ["EUR", "GBP", "JPY", "CAD", "AUD", "CHF", "INR", "SGD"].filter(
      (c) => c !== baseCurrency
    );
    setWatchlist(defaults);
    setIsLoaded(true);
  }, [baseCurrency]);

  // Persist watchlist changes
  const saveWatchlist = (newList: string[]) => {
    setWatchlist(newList);
    try {
      localStorage.setItem("prava_fx_watchlist", JSON.stringify(newList));
    } catch {
      // Ignore
    }
  };

  const handleAddToWatchlist = (code: string) => {
    if (!code || code === baseCurrency || watchlist.includes(code)) return;
    saveWatchlist([...watchlist, code]);
    setCurrencyToAdd("");
  };

  const handleRemoveFromWatchlist = (code: string) => {
    saveWatchlist(watchlist.filter((c) => c !== code));
  };

  // Fetch performance data with client-side cache memoization
  useEffect(() => {
    if (!onFetchPerformance || !selectedTarget) return;

    const cacheKey = `${baseCurrency.toUpperCase()}_${selectedTarget.toUpperCase()}_${range}`;
    const cached = perfCacheRef.current.get(cacheKey);

    if (cached) {
      setPerfData(cached);
      setHoveredPointIndex(null);
      return;
    }

    startPerfTransition(async () => {
      try {
        const data = await onFetchPerformance(baseCurrency, selectedTarget, range);
        if (data) {
          perfCacheRef.current.set(cacheKey, data);
          setPerfData(data);
          setHoveredPointIndex(null);
        }
      } catch (err) {
        console.error("Error loading currency performance:", err);
      }
    });
  }, [baseCurrency, selectedTarget, range, onFetchPerformance]);

  const handleBaseChange = (newBase: string, forceRefresh: boolean = false) => {
    const cleanBase = newBase.toUpperCase();
    setBaseCurrency(cleanBase);
    if (selectedTarget === cleanBase) {
      setSelectedTarget(cleanBase === "USD" ? "EUR" : "USD");
    }

    if (!forceRefresh) {
      const cached = ratesCacheRef.current.get(cleanBase);
      if (cached) {
        setRates(cached);
        return;
      }
    }

    startRefresh(async () => {
      const updated = await onRefresh(cleanBase);
      if (updated) {
        ratesCacheRef.current.set(cleanBase, updated);
        setRates(updated);
      }
    });
  };

  const handleResetToPreferred = () => {
    handleBaseChange(userPreferredCurrency);
  };

  const handleSwapCalculator = () => {
    const prevBase = baseCurrency;
    const prevTarget = selectedTarget;
    setBaseCurrency(prevTarget);
    setSelectedTarget(prevBase);

    const cached = ratesCacheRef.current.get(prevTarget.toUpperCase());
    if (cached) {
      setRates(cached);
      return;
    }

    startRefresh(async () => {
      const updated = await onRefresh(prevTarget);
      if (updated) {
        ratesCacheRef.current.set(prevTarget.toUpperCase(), updated);
        setRates(updated);
      }
    });
  };

  const targetRate = rates?.rates?.[selectedTarget] || 1;
  const parsedAmount = parseFloat(amount) || 0;
  const convertedValue = (parsedAmount * targetRate).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const baseCurrencyMeta =
    SUPPORTED_CURRENCIES.find((c) => c.code === baseCurrency) || {
      code: baseCurrency,
      name: baseCurrency,
      symbol: "$",
      flag: "🌐",
    };

  const targetCurrencyMeta =
    SUPPORTED_CURRENCIES.find((c) => c.code === selectedTarget) || {
      code: selectedTarget,
      name: selectedTarget,
      symbol: "",
      flag: "🌐",
    };

  // Filtered currencies for ratings table
  const filteredCurrencies = useMemo(() => {
    return SUPPORTED_CURRENCIES.filter((c) => {
      if (c.code === baseCurrency) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return c.code.toLowerCase().includes(q) || c.name.toLowerCase().includes(q);
    });
  }, [baseCurrency, searchQuery]);

  // SVG Chart points computation
  const chartPoints = useMemo(() => {
    if (!perfData || !perfData.points || perfData.points.length === 0) return null;
    const points = perfData.points;
    const rates = points.map((p) => p.rate);
    const minRate = Math.min(...rates);
    const maxRate = Math.max(...rates);
    const rangeDiff = maxRate - minRate || 0.0001;

    const width = 600;
    const height = 180;
    const padX = 20;
    const padY = 25;

    const coords = points.map((p, idx) => {
      const x = padX + (idx / (points.length - 1 || 1)) * (width - padX * 2);
      const normY = (p.rate - minRate) / rangeDiff;
      const y = height - padY - normY * (height - padY * 2);
      return { x, y, ...p };
    });

    // Generate smooth SVG path
    let pathD = `M ${coords[0].x} ${coords[0].y}`;
    for (let i = 1; i < coords.length; i++) {
      const prev = coords[i - 1];
      const cur = coords[i];
      const cx = (prev.x + cur.x) / 2;
      pathD += ` C ${cx} ${prev.y}, ${cx} ${cur.y}, ${cur.x} ${cur.y}`;
    }

    // Fill path closing at bottom
    const areaD = `${pathD} L ${coords[coords.length - 1].x} ${height} L ${coords[0].x} ${height} Z`;

    return {
      width,
      height,
      coords,
      pathD,
      areaD,
      minRate,
      maxRate,
    };
  }, [perfData]);

  // Active hover point in chart
  const activeHoverPoint =
    hoveredPointIndex !== null && chartPoints?.coords[hoveredPointIndex]
      ? chartPoints.coords[hoveredPointIndex]
      : null;

  return (
    <div className="space-y-6">
      {/* Top Header & Base Preference Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/80">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
              <Coins className="w-4 h-4 text-emerald-500" />
              Currency Exchange & Trends
            </h2>
            <Badge variant="secondary" className="text-[10px] font-mono px-2 py-0">
              ECB Mid-Market Feed
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Real-time conversion, watchlist tracking, and historical strength analysis against your preferred currency.
          </p>
        </div>

        {/* Base Currency Selector & Reset */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-muted/60 border border-border/70 rounded-lg p-1 text-xs">
            <span className="text-muted-foreground text-[11px] font-medium pl-1.5 hidden sm:inline">
              Base:
            </span>
            <Select value={baseCurrency} onValueChange={handleBaseChange}>
              <SelectTrigger className="h-7 text-xs font-semibold bg-background border-border/50 cursor-pointer w-28">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-60 w-56 thin-scrollbar">
                {SUPPORTED_CURRENCIES.map((c) => (
                  <SelectItem key={c.code} value={c.code} className="text-xs cursor-pointer">
                    {c.flag} {c.code} — {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {baseCurrency !== userPreferredCurrency && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-[10px] px-2 text-primary hover:text-primary cursor-pointer"
                onClick={handleResetToPreferred}
                title={`Reset to profile default (${userPreferredCurrency})`}
              >
                Reset ({userPreferredCurrency})
              </Button>
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
            onClick={() => handleBaseChange(baseCurrency, true)}
            disabled={isRefreshing}
            title="Refresh exchange rates"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-primary" : ""}`} />
            <span className="hidden sm:inline ml-1">Refresh</span>
          </Button>
        </div>
      </div>

      {/* Quick Converter Bar */}
      <Card className="border-border/80 bg-gradient-to-br from-card via-card to-muted/20 shadow-xs">
        <CardContent className="p-4 sm:p-5">
          <div className="grid grid-cols-1 sm:grid-cols-11 gap-3 items-center">
            {/* Pay Amount */}
            <div className="sm:col-span-5 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-foreground">You Pay ({baseCurrencyMeta.flag} {baseCurrency})</span>
                <span className="text-[11px] text-muted-foreground">1 {baseCurrency} = {targetRate.toFixed(4)} {selectedTarget}</span>
              </div>
              <div className="relative">
                <Input
                  type="number"
                  min="0"
                  step="any"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="text-base font-mono font-bold h-10 pr-16 bg-background"
                  placeholder="100"
                />
                <span className="absolute right-3 top-2.5 text-xs font-semibold text-muted-foreground font-mono">
                  {baseCurrency}
                </span>
              </div>
            </div>

            {/* Swap Button */}
            <div className="sm:col-span-1 flex justify-center pt-2 sm:pt-4">
              <Button
                variant="outline"
                size="icon"
                className="rounded-full h-8 w-8 border-border hover:bg-primary/10 hover:text-primary cursor-pointer"
                onClick={handleSwapCalculator}
                disabled={isRefreshing}
                title="Swap currencies"
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
              </Button>
            </div>

            {/* Receive Amount */}
            <div className="sm:col-span-5 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-foreground">You Receive (Est.)</span>
                <span className="text-[11px] text-muted-foreground">{targetCurrencyMeta.name}</span>
              </div>
              <div className="flex items-center justify-between h-10 px-3 rounded-md border border-border bg-muted/40 font-mono text-base font-bold text-foreground">
                <span>{convertedValue}</span>
                <Select value={selectedTarget} onValueChange={setSelectedTarget}>
                  <SelectTrigger className="h-7 text-xs font-semibold bg-background border-border/60 w-24 cursor-pointer">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-60 w-44 thin-scrollbar">
                    {SUPPORTED_CURRENCIES.filter((c) => c.code !== baseCurrency).map((c) => (
                      <SelectItem key={c.code} value={c.code} className="text-xs cursor-pointer">
                        {c.flag} {c.code}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. Exchange Rate Watchlist */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Exchange Rate Watchlist
            </h3>
            <Badge variant="outline" className="text-[10px] font-mono px-1.5 py-0">
              {watchlist.length} pinned
            </Badge>
          </div>

          {/* Add Currency to Watchlist Dropdown */}
          <div className="flex items-center gap-2">
            <Select value={currencyToAdd} onValueChange={handleAddToWatchlist}>
              <SelectTrigger className="h-7 text-xs font-medium bg-background border-border/70 cursor-pointer w-40">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add currency...</span>
                </div>
              </SelectTrigger>
              <SelectContent className="max-h-60 w-56 thin-scrollbar">
                {SUPPORTED_CURRENCIES.filter(
                  (c) => c.code !== baseCurrency && !watchlist.includes(c.code)
                ).map((c) => (
                  <SelectItem key={c.code} value={c.code} className="text-xs cursor-pointer">
                    {c.flag} {c.code} — {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {watchlist.length === 0 ? (
          <div className="p-6 rounded-xl border border-dashed border-border text-center text-xs text-muted-foreground">
            No currencies pinned to your watchlist. Use the &quot;Add currency&quot; selector above to pin destination rates.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-8 gap-2.5">
            {watchlist.map((code) => {
              const meta = SUPPORTED_CURRENCIES.find((c) => c.code === code) || {
                code,
                name: code,
                symbol: "",
                flag: "🌐",
              };
              const rate = rates?.rates?.[code] || 1;
              const change = rates?.changes?.[code] ?? 0;
              const isSelected = selectedTarget === code;

              return (
                <div
                  key={code}
                  onClick={() => setSelectedTarget(code)}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer relative group flex flex-col justify-between space-y-1.5 select-none ${
                    isSelected
                      ? "border-primary bg-primary/5 shadow-xs ring-1 ring-primary/40"
                      : "border-border/70 bg-card hover:bg-muted/40 hover:border-border"
                  }`}
                >
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFromWatchlist(code);
                    }}
                    className="absolute top-1 right-1 h-5 w-5 rounded-full items-center justify-center text-muted-foreground/60 hover:text-destructive hover:bg-destructive/10 hidden group-hover:flex transition-colors cursor-pointer"
                    title={`Remove ${code} from watchlist`}
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>

                  <div className="flex items-center gap-1.5">
                    <span className="text-sm">{meta.flag}</span>
                    <span className={`text-xs font-bold ${isSelected ? "text-primary" : "text-foreground"}`}>
                      {code}
                    </span>
                  </div>

                  <div className="font-mono text-xs font-bold text-foreground">
                    {rate.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 3 })}
                  </div>

                  <div className="flex items-center justify-between text-[10px]">
                    <span
                      className={`font-mono font-medium flex items-center gap-0.5 ${
                        change >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-500"
                      }`}
                    >
                      {change >= 0 ? (
                        <TrendingUp className="w-2.5 h-2.5" />
                      ) : (
                        <TrendingDown className="w-2.5 h-2.5" />
                      )}
                      {change >= 0 ? `+${change}%` : `${change}%`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. Currency Performance & "Is My Currency Getting Stronger?" Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance Line Chart (2 Cols) */}
        <Card className="lg:col-span-2 border-border/80 bg-card shadow-xs">
          <CardHeader className="p-4 sm:p-5 pb-2 border-b border-border/50">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <LineChart className="w-4 h-4 text-primary" />
                  <CardTitle className="text-sm font-semibold">
                    {baseCurrency} / {selectedTarget} Performance
                  </CardTitle>
                  <span className="text-xs text-muted-foreground">
                    ({targetCurrencyMeta.name})
                  </span>
                </div>
                <CardDescription className="text-xs mt-0.5">
                  Historical ECB exchange rates over time.
                </CardDescription>
              </div>

              {/* Range Toggle Buttons */}
              <div className="inline-flex rounded-lg border border-border p-0.5 bg-muted/60 text-xs font-semibold self-start sm:self-auto">
                {(["7D", "1M", "3M", "1Y"] as TimeRange[]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRange(r)}
                    className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                      range === r
                        ? "bg-background text-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-4 sm:p-5 space-y-4">
            {/* Quick Metrics Bar */}
            {perfData && (
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-lg bg-muted/40 border border-border/50 text-xs">
                <div>
                  <span className="text-[11px] text-muted-foreground block">Current Rate</span>
                  <span className="text-sm font-bold font-mono text-foreground">
                    1 {baseCurrency} = {perfData.currentRate} {selectedTarget}
                  </span>
                </div>

                <div>
                  <span className="text-[11px] text-muted-foreground block">{range} Net Change</span>
                  <span
                    className={`text-sm font-bold font-mono flex items-center gap-1 ${
                      perfData.changePercent >= 0
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-rose-500"
                    }`}
                  >
                    {perfData.changePercent >= 0 ? "+" : ""}
                    {perfData.changePercent}% ({perfData.changeAmount >= 0 ? "+" : ""}
                    {perfData.changeAmount} {selectedTarget})
                  </span>
                </div>

                <div>
                  <span className="text-[11px] text-muted-foreground block">Period Range</span>
                  <span className="text-xs font-medium font-mono text-muted-foreground">
                    Low: {perfData.lowRate} — High: {perfData.highRate}
                  </span>
                </div>
              </div>
            )}

            {/* Interactive SVG Line Chart */}
            <div className="relative w-full h-48 bg-muted/20 rounded-xl border border-border/40 p-2 flex items-center justify-center overflow-hidden">
              {isLoadingPerf ? (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-primary" />
                  <span>Loading historical rates...</span>
                </div>
              ) : chartPoints ? (
                <div className="w-full h-full relative">
                  {/* Hover Information Banner */}
                  {activeHoverPoint && (
                    <div className="absolute top-2 left-3 bg-popover/90 backdrop-blur-xs border border-border/80 px-2 py-1 rounded-md shadow-xs text-[11px] font-mono z-10">
                      <span className="text-muted-foreground mr-1">{activeHoverPoint.formattedDate}:</span>
                      <strong className="text-foreground">
                        1 {baseCurrency} = {activeHoverPoint.rate} {selectedTarget}
                      </strong>
                    </div>
                  )}

                  <svg
                    viewBox={`0 0 ${chartPoints.width} ${chartPoints.height}`}
                    className="w-full h-full overflow-visible"
                    preserveAspectRatio="none"
                  >
                    <defs>
                      <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="0%"
                          stopColor={perfData?.isBaseStronger ? "#10B981" : "#2D9BF0"}
                          stopOpacity="0.25"
                        />
                        <stop
                          offset="100%"
                          stopColor={perfData?.isBaseStronger ? "#10B981" : "#2D9BF0"}
                          stopOpacity="0.0"
                        />
                      </linearGradient>
                    </defs>

                    {/* Horizontal Grid lines */}
                    <line
                      x1="20"
                      y1="25"
                      x2={chartPoints.width - 20}
                      y2="25"
                      stroke="currentColor"
                      className="text-border/60"
                      strokeDasharray="4 4"
                    />
                    <line
                      x1="20"
                      y1={chartPoints.height / 2}
                      x2={chartPoints.width - 20}
                      y2={chartPoints.height / 2}
                      stroke="currentColor"
                      className="text-border/40"
                      strokeDasharray="4 4"
                    />
                    <line
                      x1="20"
                      y1={chartPoints.height - 25}
                      x2={chartPoints.width - 20}
                      y2={chartPoints.height - 25}
                      stroke="currentColor"
                      className="text-border/60"
                      strokeDasharray="4 4"
                    />

                    {/* Gradient Area */}
                    <path d={chartPoints.areaD} fill="url(#chartFill)" />

                    {/* Line Stroke */}
                    <path
                      d={chartPoints.pathD}
                      fill="none"
                      stroke={perfData?.isBaseStronger ? "#10B981" : "#2D9BF0"}
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />

                    {/* Hover Active Point */}
                    {activeHoverPoint && (
                      <circle
                        cx={activeHoverPoint.x}
                        cy={activeHoverPoint.y}
                        r="4.5"
                        className="fill-background stroke-primary stroke-2 shadow-xs"
                      />
                    )}
                  </svg>

                  {/* Interactive Hover Columns Overlay */}
                  <div className="absolute inset-0 flex">
                    {chartPoints.coords.map((_, idx) => (
                      <div
                        key={idx}
                        className="flex-1 h-full cursor-crosshair"
                        onMouseEnter={() => setHoveredPointIndex(idx)}
                        onMouseLeave={() => setHoveredPointIndex(null)}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <span className="text-xs text-muted-foreground">Historical data not available for this pair.</span>
              )}
            </div>

            {/* X-Axis Date Range Label */}
            {perfData && (
              <div className="flex items-center justify-between text-[10px] text-muted-foreground font-mono px-1">
                <span>Start: {perfData.startDate}</span>
                <span>End: {perfData.endDate}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 4. “Is My Currency Getting Stronger?” Section (1 Col) */}
        <Card className="border-border/80 bg-card shadow-xs flex flex-col justify-between">
          <CardHeader className="p-4 sm:p-5 pb-3 border-b border-border/50">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <CardTitle className="text-sm font-semibold">
                Is My Currency Getting Stronger?
              </CardTitle>
            </div>
            <CardDescription className="text-xs">
              Factual rate movement against {selectedTarget} over {range}.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-4 sm:p-5 space-y-4 flex-1">
            {perfData ? (
              <div className="space-y-3.5">
                {/* Status Indicator Pill */}
                <div
                  className={`p-3 rounded-xl border flex items-center gap-3 ${
                    perfData.changePercent > 0
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400"
                      : perfData.changePercent < 0
                      ? "bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-400"
                      : "bg-muted border-border text-muted-foreground"
                  }`}
                >
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                      perfData.changePercent > 0
                        ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-300"
                        : perfData.changePercent < 0
                        ? "bg-rose-500/20 text-rose-600 dark:text-rose-300"
                        : "bg-muted-foreground/20 text-muted-foreground"
                    }`}
                  >
                    {perfData.changePercent > 0 ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : perfData.changePercent < 0 ? (
                      <TrendingDown className="w-4 h-4" />
                    ) : (
                      <Info className="w-4 h-4" />
                    )}
                  </div>

                  <div>
                    <span className="text-xs font-bold block">
                      {perfData.changePercent > 0
                        ? `${baseCurrency} is Strengthening (+${perfData.changePercent}%)`
                        : perfData.changePercent < 0
                        ? `${baseCurrency} is Weakening (${perfData.changePercent}%)`
                        : `${baseCurrency} is Stable (0.00%)`}
                    </span>
                    <span className="text-[11px] opacity-90 block">
                      Over the last {range === "7D" ? "7 days" : range === "1M" ? "1 month" : range === "3M" ? "3 months" : "1 year"}
                    </span>
                  </div>
                </div>

                {/* Clear Factual Explanation */}
                <div className="text-xs text-muted-foreground leading-relaxed space-y-2">
                  <p>
                    {perfData.changePercent > 0 ? (
                      <>
                        Your preferred currency (<strong>{baseCurrency}</strong>) buys{" "}
                        <strong className="text-foreground">more {selectedTarget}</strong> now than it did at the start of this {range} window. On {perfData.startDate}, 1 {baseCurrency} was worth <strong>{perfData.initialRate} {selectedTarget}</strong>, compared to <strong>{perfData.currentRate} {selectedTarget}</strong> today.
                      </>
                    ) : perfData.changePercent < 0 ? (
                      <>
                        Your preferred currency (<strong>{baseCurrency}</strong>) buys{" "}
                        <strong className="text-foreground">less {selectedTarget}</strong> now than it did at the start of this {range} window. On {perfData.startDate}, 1 {baseCurrency} was worth <strong>{perfData.initialRate} {selectedTarget}</strong>, compared to <strong>{perfData.currentRate} {selectedTarget}</strong> today.
                      </>
                    ) : (
                      <>
                        The exchange rate between <strong>{baseCurrency}</strong> and <strong>{selectedTarget}</strong> has remained virtually unchanged at <strong>{perfData.currentRate}</strong> across this {range} period.
                      </>
                    )}
                  </p>
                </div>

                {/* Practical Purchasing Power Example */}
                <div className="p-3 rounded-lg bg-muted/40 border border-border/50 space-y-1">
                  <span className="text-[11px] font-semibold text-foreground block">
                    Travel Purchasing Power (100 {baseCurrency})
                  </span>
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-muted-foreground">Start of period:</span>
                    <span className="font-semibold text-foreground">
                      {(100 * perfData.initialRate).toFixed(2)} {selectedTarget}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-muted-foreground">Today:</span>
                    <span className="font-bold text-primary">
                      {(100 * perfData.currentRate).toFixed(2)} {selectedTarget}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-muted-foreground">
                Select a currency pair to analyze historical strength.
              </div>
            )}

            {/* Non-advisory disclaimer */}
            <div className="pt-2 border-t border-border/50 text-[10px] text-muted-foreground/80 leading-snug">
              Note: Historical exchange rate movements reflect market changes over the selected timeframe and are provided for travel budgeting reference only. Does not constitute financial advice.
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 1. Trip Currency Ratings (Popular & Travel Hubs) */}
      <Card className="border-border/80 bg-card shadow-xs">
        <CardHeader className="p-4 sm:p-5 pb-3 border-b border-border/50">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                <CardTitle className="text-sm font-semibold">
                  Trip Currency Ratings (Relative to 1 {baseCurrency})
                </CardTitle>
              </div>
              <CardDescription className="text-xs mt-0.5">
                Compare exchange rates and recent trends for major worldwide travel destinations.
              </CardDescription>
            </div>

            {/* Search Input for currencies */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Filter currencies (e.g. Yen, EUR, Peso)..."
                className="pl-8 h-8 text-xs bg-background"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-muted/40 border-b border-border text-muted-foreground text-[11px] font-semibold">
              <tr>
                <th className="py-2.5 px-4">Currency</th>
                <th className="py-2.5 px-4 font-mono">1 {baseCurrency} Buys</th>
                <th className="py-2.5 px-4 font-mono">Inverse (1 Unit =)</th>
                <th className="py-2.5 px-4 font-mono">Period Change</th>
                <th className="py-2.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {filteredCurrencies.map((curr) => {
                const rate = rates?.rates?.[curr.code] || 1;
                const inverse = rate > 0 ? (1 / rate).toFixed(4) : "0";
                const change = rates?.changes?.[curr.code] ?? 0;
                const isWatchlisted = watchlist.includes(curr.code);
                const isSelected = selectedTarget === curr.code;

                return (
                  <tr
                    key={curr.code}
                    onClick={() => setSelectedTarget(curr.code)}
                    className={`transition-colors cursor-pointer hover:bg-muted/40 ${
                      isSelected ? "bg-primary/5 font-medium" : ""
                    }`}
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{curr.flag}</span>
                        <div>
                          <span className="font-bold text-foreground mr-1">{curr.code}</span>
                          <span className="text-muted-foreground text-[11px]">
                            {curr.name} ({curr.symbol})
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 font-mono font-bold text-foreground">
                      {rate.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 4,
                      })}{" "}
                      {curr.symbol}
                    </td>

                    <td className="py-3 px-4 font-mono text-muted-foreground">
                      {inverse} {baseCurrency}
                    </td>

                    <td className="py-3 px-4 font-mono">
                      <span
                        className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                          change >= 0
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : "bg-rose-500/10 text-rose-500"
                        }`}
                      >
                        {change >= 0 ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : (
                          <TrendingDown className="w-3 h-3" />
                        )}
                        {change >= 0 ? `+${change}%` : `${change}%`}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant={isWatchlisted ? "secondary" : "ghost"}
                          size="sm"
                          className="h-7 text-[11px] px-2.5 cursor-pointer"
                          onClick={() =>
                            isWatchlisted
                              ? handleRemoveFromWatchlist(curr.code)
                              : handleAddToWatchlist(curr.code)
                          }
                          title={isWatchlisted ? "Remove from watchlist" : "Pin to watchlist"}
                        >
                          <Star
                            className={`w-3 h-3 mr-1 ${
                              isWatchlisted ? "fill-amber-500 text-amber-500" : "text-muted-foreground"
                            }`}
                          />
                          {isWatchlisted ? "Pinned" : "Pin"}
                        </Button>

                        <Button
                          variant={isSelected ? "default" : "outline"}
                          size="sm"
                          className="h-7 text-[11px] px-2.5 cursor-pointer"
                          onClick={() => setSelectedTarget(curr.code)}
                        >
                          Trends
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

