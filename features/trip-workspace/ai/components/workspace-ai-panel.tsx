"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import Image from "next/image";

import {
  Send,
  Loader2,
  Trash2,
  X,
  AlertCircle,
  CornerDownLeft,
  History,
  Plus,
  MessageSquare,
  CloudSun,
  Coins,
  Cpu,
  Pencil,
  Check,
  Calendar,
  Zap,
  MoreHorizontal,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AiProposalCard } from "./ai-proposal-card";
import { UpgradeDialog } from "@/features/pricing/components/upgrade-dialog";

import { useWorkspaceAi } from "@/features/trip-workspace/context/workspace-ai-context";

import {
  getTripConversation,
  getTripConversationThreads,
  createTripConversationThread,
  deleteTripConversationThread,
  updateTripConversationTitle,
  sendTripMessage,
  clearTripConversation,
} from "../actions";

import { cn } from "@/lib/utils";

import type { MessageDTO, ConversationThreadDTO } from "../actions";
import type { AiProposalDTO } from "../schema";

const MAX_MESSAGES_LIMIT = 15;

function formatModelName(model?: string): string | null {
  if (!model) return null;
  if (model.includes("3.6")) return "Gemini 3.6 Flash";
  if (model.includes("3.1-flash-lite") || model.includes("flash-lite")) return "Gemini 3.1 Flash Lite";
  if (model.includes("2.5-flash")) return "Gemini 2.5 Flash";
  if (model.includes("nemotron")) return "Nemotron 3.5 (Free)";
  if (model.includes("openrouter/free")) return "OpenRouter Free";
  if (model.includes("gemini")) return "Gemini Flash";
  return model.split("/").pop() || model;
}

function renderInlineSpans(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
    const italicMatch = remaining.match(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/);

    let earliestIdx = Infinity;
    let type: "bold" | "italic" | null = null;
    let match: RegExpMatchArray | null = null;

    if (boldMatch && boldMatch.index !== undefined && boldMatch.index < earliestIdx) {
      earliestIdx = boldMatch.index;
      type = "bold";
      match = boldMatch;
    }
    if (italicMatch && italicMatch.index !== undefined && italicMatch.index < earliestIdx) {
      earliestIdx = italicMatch.index;
      type = "italic";
      match = italicMatch;
    }

    if (!type || !match || earliestIdx === Infinity) {
      parts.push(remaining);
      break;
    }

    if (earliestIdx > 0) {
      parts.push(remaining.substring(0, earliestIdx));
    }

    if (type === "bold") {
      parts.push(
        <strong key={`b-${key++}`} className="font-semibold text-foreground">
          {match[1]}
        </strong>
      );
    } else if (type === "italic") {
      parts.push(
        <em key={`i-${key++}`} className="italic text-muted-foreground">
          {match[1]}
        </em>
      );
    }

    remaining = remaining.substring(earliestIdx + match[0].length);
  }

  return parts.length > 0 ? parts : text;
}

function FormattedMessageContent({
  content,
  isUser,
}: {
  content: string;
  isUser: boolean;
}) {
  if (isUser) {
    return <div className="break-words [overflow-wrap:anywhere]">{content}</div>;
  }

  // Strip any accidental proposal code blocks, developer JSON dumps, thinking traces, or citations
  const sanitized = content
    .replace(/<think>[\s\S]*?<\/think>/gi, "")
    .replace(/<thought>[\s\S]*?<\/thought>/gi, "")
    .replace(/(?:^|\n)(?:Here's a thinking process:?|Thinking Process:?|Thinking:?)\s*[\s\S]*?(?=(?:\n\s*\n(?:[A-Z#*]|Hey|Hello|Hi|Current|The))|$)/gi, "")
    .replace(/(?:^|\n)\d+\.\s+(?:Analyze User Input|Check Available Data|Identify Constraints|Gap Identification):[\s\S]*?(?=(?:\n\s*\n(?:[A-Z#*]|Hey|Hello|Hi|Current|The))|$)/gi, "")
    .replace(/```(?:json:proposal|proposal|json)[\s\S]*?(?:```|$)/gi, "")
    .replace(/(?:\*{0,2}Live Data Citation:?\*{0,2}\s*)?```(?:json)?\s*\{[\s\S]*?(?:```|$)/gi, "")
    .replace(/```json[\s\S]*?(?:```|$)/gi, "")
    .trim();

  const lines = sanitized.split("\n");
  const nodes: React.ReactNode[] = [];
  let currentList: string[] = [];

  const flushList = () => {
    if (currentList.length > 0) {
      nodes.push(
        <ul key={`ul-${nodes.length}`} className="my-1.5 space-y-1 pl-4 list-disc list-outside text-foreground/90">
          {currentList.map((item, i) => (
            <li key={i} className="leading-relaxed">
              {renderInlineSpans(item)}
            </li>
          ))}
        </ul>
      );
      currentList = [];
    }
  };

  lines.forEach((rawLine, idx) => {
    const line = rawLine.trimEnd();
    if (!line.trim()) {
      flushList();
      return;
    }

    // List item
    if (/^[-*+]\s+/.test(line.trim())) {
      currentList.push(line.trim().replace(/^[-*+]\s+/, ""));
      return;
    }

    // Flush any pending list
    flushList();

    // Headers
    if (line.startsWith("### ")) {
      nodes.push(
        <h5 key={`h5-${idx}`} className="font-semibold text-xs text-foreground mt-2 mb-1">
          {renderInlineSpans(line.replace("### ", ""))}
        </h5>
      );
    } else if (line.startsWith("## ")) {
      nodes.push(
        <h4 key={`h4-${idx}`} className="font-bold text-xs text-foreground mt-2.5 mb-1">
          {renderInlineSpans(line.replace("## ", ""))}
        </h4>
      );
    } else if (line.startsWith("# ")) {
      nodes.push(
        <h3 key={`h3-${idx}`} className="font-bold text-sm text-foreground mt-3 mb-1.5">
          {renderInlineSpans(line.replace("# ", ""))}
        </h3>
      );
    } else if (line.startsWith("> ")) {
      nodes.push(
        <blockquote key={`bq-${idx}`} className="pl-2.5 border-l-2 border-primary/40 italic text-muted-foreground my-1.5">
          {renderInlineSpans(line.replace(/^>\s*/, ""))}
        </blockquote>
      );
    } else {
      nodes.push(
        <p key={`p-${idx}`} className="my-1 leading-relaxed">
          {renderInlineSpans(line)}
        </p>
      );
    }
  });

  flushList();

  return <div className="space-y-1 break-words [overflow-wrap:anywhere] overflow-hidden">{nodes}</div>;
}

interface WorkspaceAiPanelProps {
  tripId: string;
  tripTitle: string;
  destination?: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function WorkspaceAiPanel({
  tripId,
  tripTitle,
  destination,
  isOpen,
  onClose,
}: WorkspaceAiPanelProps) {
  const { userQuota, setUserQuota, userAvatarUrl, pendingPrompt, clearPendingPrompt } = useWorkspaceAi();
  const [messages, setMessages] = useState<MessageDTO[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [activeConversationTitle, setActiveConversationTitle] = useState<string>("");
  const [threads, setThreads] = useState<ConversationThreadDTO[]>([]);
  const [activeTab, setActiveTab] = useState<"chat" | "history">("chat");
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCreatingThread, setIsCreatingThread] = useState(false);
  const [isClearing, startClearing] = useTransition();
  const [editingThreadId, setEditingThreadId] = useState<string | null>(null);
  const [editingThreadTitle, setEditingThreadTitle] = useState<string>("");
  const [isEditingHeaderTitle, setIsEditingHeaderTitle] = useState(false);
  const [headerTitleInput, setHeaderTitleInput] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);
  const [aiAutoPropose, setAiAutoPropose] = useState<boolean>(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const chatScrollContainerRef = useRef<HTMLDivElement>(null);
  const isInitialLoadRef = useRef(true);

  useEffect(() => {
    if (isOpen) {
      setIsInitialized(false);
      loadInitialConversation();
      loadThreadsList();
    }
  }, [isOpen, tripId]);

  useEffect(() => {
    if (isOpen && isInitialized && pendingPrompt && !isLoading) {
      const promptToDispatch = pendingPrompt;
      clearPendingPrompt();
      setActiveTab("chat");
      handleSend(promptToDispatch);
    }
  }, [isOpen, isInitialized, pendingPrompt, isLoading]);

  useEffect(() => {
    if (activeTab === "chat" && chatScrollContainerRef.current) {
      if (isInitialLoadRef.current) {
        chatScrollContainerRef.current.scrollTop = chatScrollContainerRef.current.scrollHeight;
        isInitialLoadRef.current = false;
      } else {
        chatScrollContainerRef.current.scrollTo({
          top: chatScrollContainerRef.current.scrollHeight,
          behavior: "smooth",
        });
      }
    }
  }, [messages, isLoading, activeTab]);

  const loadInitialConversation = async (targetId?: string) => {
    setError(null);
    const res = await getTripConversation(tripId, targetId);
    if (res.success && res.messages) {
      setMessages(res.messages);
      setActiveConversationId(res.conversationId || null);
      setActiveConversationTitle(res.conversationTitle || "Ichinose");
      if (res.userQuota) {
        setUserQuota(res.userQuota);
      }
      if ((res as unknown as { aiAutoPropose?: boolean }).aiAutoPropose !== undefined) {
        setAiAutoPropose((res as unknown as { aiAutoPropose?: boolean }).aiAutoPropose ?? true);
      }
    }
    setIsInitialized(true);
  };

  const loadThreadsList = async () => {
    const res = await getTripConversationThreads(tripId);
    if (res.success && res.threads) {
      setThreads(res.threads);
    }
  };

  const handleSelectThread = async (threadId: string) => {
    isInitialLoadRef.current = true;
    setActiveTab("chat");
    setEditingThreadId(null);
    await loadInitialConversation(threadId);
  };

  const handleNewChat = async () => {
    setIsCreatingThread(true);
    setError(null);
    const res = await createTripConversationThread(tripId);
    setIsCreatingThread(false);
    if (res.success && res.conversationId) {
      isInitialLoadRef.current = true;
      setActiveTab("chat");
      setEditingThreadId(null);
      await loadInitialConversation(res.conversationId);
      await loadThreadsList();
    } else {
      setError(res.error || "Failed to create new chat session");
    }
  };

  const handleDeleteThread = async (e: React.MouseEvent, threadId: string) => {
    e.stopPropagation();
    if (!confirm("Delete this conversation thread from history?")) return;
    await deleteTripConversationThread(threadId);
    await loadThreadsList();
    if (activeConversationId === threadId) {
      await loadInitialConversation();
    }
  };

  const handleStartEditThread = (e: React.MouseEvent, thread: ConversationThreadDTO) => {
    e.stopPropagation();
    setEditingThreadId(thread.id);
    setEditingThreadTitle(thread.title);
  };

  const handleSaveThreadTitle = async (threadId: string) => {
    const trimmed = editingThreadTitle.trim();
    if (!trimmed) {
      setEditingThreadId(null);
      return;
    }
    // Optimistic update
    setThreads((prev) =>
      prev.map((t) => (t.id === threadId ? { ...t, title: trimmed } : t))
    );
    if (activeConversationId === threadId) {
      setActiveConversationTitle(trimmed);
    }
    setEditingThreadId(null);

    const res = await updateTripConversationTitle(threadId, trimmed);
    if (res.success) {
      toast.success("Chat renamed");
    } else {
      toast.error(res.error || "Failed to rename chat");
      await loadThreadsList();
    }
  };

  const handleStartEditHeader = () => {
    if (!activeConversationId) return;
    setIsEditingHeaderTitle(true);
    setHeaderTitleInput(activeConversationTitle || "Ichinose");
  };

  const handleSaveHeaderTitle = async () => {
    if (!activeConversationId) {
      setIsEditingHeaderTitle(false);
      return;
    }
    const trimmed = headerTitleInput.trim();
    if (!trimmed || trimmed === activeConversationTitle) {
      setIsEditingHeaderTitle(false);
      return;
    }
    setActiveConversationTitle(trimmed);
    setThreads((prev) =>
      prev.map((t) => (t.id === activeConversationId ? { ...t, title: trimmed } : t))
    );
    setIsEditingHeaderTitle(false);

    const res = await updateTripConversationTitle(activeConversationId, trimmed);
    if (res.success) {
      toast.success("Chat renamed");
    } else {
      toast.error(res.error || "Failed to rename chat");
      if (res.title) setActiveConversationTitle(res.title);
    }
  };

  const handleProposalResolved = (updatedProposal: AiProposalDTO) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.proposal && msg.proposal.id === updatedProposal.id
          ? { ...msg, proposal: updatedProposal }
          : msg
      )
    );
  };

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend ?? input).trim();
    if (!query || isLoading) return;

    if (messages.length >= MAX_MESSAGES_LIMIT) {
      setError(`Thread limit reached (${MAX_MESSAGES_LIMIT} messages). Please start a new chat session.`);
      return;
    }

    setInput("");
    setError(null);

    // Optimistically show user message
    const tempUserMsg: MessageDTO = {
      id: "temp-" + Date.now(),
      role: "user",
      content: query,
      createdAt: new Date().toISOString(),
      proposal: null,
    };

    setMessages((prev) => [...prev, tempUserMsg]);
    setIsLoading(true);

    const res = await sendTripMessage(tripId, query, activeConversationId || undefined);

    setIsLoading(false);

    if (res.success && res.assistantMessage) {
      setMessages((prev) => [
        ...prev.filter((m) => m.id !== tempUserMsg.id),
        res.userMessage!,
        res.assistantMessage!,
      ]);
      if (res.userQuota) {
        setUserQuota(res.userQuota);
      }
      // Reload threads list if this was the first message or title might have generated
      if (messages.length === 0) {
        loadThreadsList();
      }
    } else {
      setError(res.error || "Failed to generate AI response");
      if (res.limitReached) {
        setUpgradeDialogOpen(true);
      }
    }
  };

  const handleClear = () => {
    if (!confirm("Clear messages in this conversation?")) return;
    startClearing(async () => {
      await clearTripConversation(tripId);
      setMessages([]);
      loadThreadsList();
    });
  };

  const quickPrompts = [
    `Check live weather forecast for ${destination || tripTitle}`,
    `Convert 150 USD to INR (live ECB exchange rates)`,
    `Summarize my current itinerary and scheduled activities`,
    `Add an activity: "Morning Zen Meditation" on Day 1 at 08:00 AM`,
  ];

  const isThreadLimitReached = messages.length >= MAX_MESSAGES_LIMIT;
  const isCreditDepleted = Boolean(userQuota && userQuota.remaining <= 0);

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-background/80 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={onClose}
        />
      )}

      {/* Main Right Sidebar AI Assistant Panel */}
      <aside
        onWheel={(e) => {
          e.stopPropagation();
        }}
        className={cn(
          "shrink-0 flex flex-col h-full select-none overscroll-contain transition-all duration-300 ease-in-out",
          // Theme matching the left sidebar: dark in light mode, light in dark mode
          "bg-[#090E1A] text-slate-200 dark:bg-slate-100 dark:text-slate-900",
          // Mobile fixed overlay drawer:
          "fixed inset-y-0 right-0 z-40 w-full sm:w-[440px] border-l border-[#152033] dark:border-slate-300 md:border-l-0",
          // Desktop: static flex child that smoothly expands from width 0
          "md:static md:z-auto",
          isOpen
            ? "translate-x-0 md:w-[440px] lg:w-[470px] xl:w-[500px] md:opacity-100"
            : "translate-x-full md:translate-x-0 md:w-0 md:opacity-0 md:overflow-hidden md:pointer-events-none"
        )}
        style={{ overscrollBehavior: "contain" }}
        aria-hidden={!isOpen}
      >
        <div className="w-full md:w-[440px] lg:w-[470px] xl:w-[500px] h-full flex flex-col min-w-0">
          {/* Header */}
          <div className="flex flex-col border-b border-[#152033] dark:border-slate-300 bg-[#090E1A] dark:bg-slate-100 shrink-0">
            {/* Top Title & Action Bar */}
            <div className="flex h-16 items-center justify-between px-3.5 gap-2 min-w-0">
              {/* Left: Avatar & Title */}
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div
                  className="relative h-8 w-8 shrink-0 rounded-full overflow-hidden ring-1.5 ring-[#2D9BF0]/60 shadow-xs select-none bg-[#0E1729]"
                  title="Ichinose (Prava AI Assistant)"
                >
                  <Image
                    src="/ichinose-avatar.jpg"
                    alt="Ichinose"
                    width={32}
                    height={32}
                    className="h-full w-full object-cover"
                    priority
                  />
                </div>

                <div className="min-w-0 flex-1">
                  {isEditingHeaderTitle ? (
                    <div className="flex items-center gap-1 min-w-0 flex-1">
                      <input
                        type="text"
                        value={headerTitleInput}
                        onChange={(e) => setHeaderTitleInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleSaveHeaderTitle();
                          } else if (e.key === "Escape") {
                            setIsEditingHeaderTitle(false);
                          }
                        }}
                        onBlur={handleSaveHeaderTitle}
                        autoFocus
                        className="h-7 w-full max-w-[170px] rounded-xs border border-[#2D9BF0] bg-[#0E1729] dark:bg-white px-2 py-0.5 text-xs font-semibold text-white dark:text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#2D9BF0]"
                      />
                      <button
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          handleSaveHeaderTitle();
                        }}
                        className="text-[#2D9BF0] hover:text-[#2D9BF0]/80 p-0.5 rounded-xs cursor-pointer shrink-0"
                        title="Save title"
                      >
                        <Check className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          setIsEditingHeaderTitle(false);
                        }}
                        className="text-slate-400 hover:text-white dark:text-slate-600 dark:hover:text-slate-900 p-0.5 rounded-xs cursor-pointer shrink-0"
                        title="Cancel"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 min-w-0 flex-wrap">
                      <span className="text-sm font-semibold text-white dark:text-slate-900 truncate block">
                        {activeConversationTitle || "Ichinose"}
                      </span>
                      {aiAutoPropose ? (
                        <span
                          className="inline-flex items-center gap-1 rounded-xs bg-emerald-500/15 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-400 border border-emerald-500/30 shrink-0"
                          title="Structured Proposals Active: Ichinose will generate interactive 1-click workspace action cards"
                        >
                          <Sparkles className="h-2.5 w-2.5" />
                          Proposals Active
                        </span>
                      ) : (
                        <span
                          className="inline-flex items-center gap-1 rounded-xs bg-slate-800 px-1.5 py-0.5 text-[9px] font-semibold text-slate-400 border border-slate-700 shrink-0"
                          title="Structured Proposals Disabled in Profile Settings. Ichinose responds in conversational prose only."
                        >
                          <MessageSquare className="h-2.5 w-2.5" />
                          Proposals Off
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Controls: Credit Pill, 3-Dot Menu, and Mobile-Only Close */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setUpgradeDialogOpen(true)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-xs text-[10px] font-semibold transition-colors cursor-pointer border ${
                    isCreditDepleted
                      ? "bg-rose-500/20 text-rose-300 dark:text-rose-700 border-rose-500/40 hover:bg-rose-500/30"
                      : "bg-[#131E33] text-slate-200 border-[#1E2B45] hover:bg-[#1A2845] dark:bg-slate-200 dark:text-slate-800 dark:border-slate-300"
                  }`}
                  title="Click to view AI quota and upgrade"
                >
                  <Zap className="w-3 h-3 text-amber-400 shrink-0" />
                  <span>
                    {userQuota
                      ? userQuota.remaining > 0
                        ? `${userQuota.remaining}/${userQuota.quota}`
                        : `0/${userQuota.quota} (Depleted)`
                      : "Credits"}
                  </span>
                </button>

                {/* 3-Dot Actions Menu (Consolidates Rename & Clear) */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-slate-400 hover:text-white hover:bg-white/10 dark:text-slate-500 dark:hover:text-slate-900 dark:hover:bg-slate-200 shrink-0 cursor-pointer"
                      title="Chat options"
                      aria-label="Chat options"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-44 rounded-xs bg-[#0E1729] border-[#1E2B45] text-slate-200 dark:bg-white dark:border-slate-200 dark:text-slate-800"
                  >
                    <DropdownMenuItem
                      onClick={handleStartEditHeader}
                      className="cursor-pointer text-xs flex items-center gap-2 rounded-xs hover:bg-white/10 dark:hover:bg-slate-100"
                    >
                      <Pencil className="h-3.5 w-3.5 text-[#2D9BF0]" />
                      <span>Rename Chat</span>
                    </DropdownMenuItem>

                    {activeTab === "chat" && messages.length > 0 && (
                      <DropdownMenuItem
                        onClick={handleClear}
                        disabled={isClearing}
                        className="cursor-pointer text-xs flex items-center gap-2 rounded-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 dark:text-red-600 dark:hover:bg-red-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Delete Chat</span>
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Mobile-Only Close (X) button: hidden on desktop for space readability */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="flex md:hidden h-8 w-8 text-slate-400 hover:text-white hover:bg-white/10 dark:text-slate-500 dark:hover:text-slate-900 dark:hover:bg-slate-200 shrink-0 cursor-pointer"
                  onClick={onClose}
                  title="Close Ichinose (Prava AI Assistant)"
                  aria-label="Close Ichinose (Prava AI Assistant)"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Subheader: Left: Chat tab | Right: + New Chat and Threads */}
            <div className="flex items-center justify-between px-3.5 py-2 bg-[#0B1222] dark:bg-slate-200/80 border-t border-[#152033] dark:border-slate-300 gap-2">
              {/* Left: Chat Tab */}
              <button
                type="button"
                onClick={() => setActiveTab("chat")}
                className={`px-3 py-1 rounded-xs text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "chat"
                    ? "bg-[#2D9BF0] text-white shadow-xs font-semibold"
                    : "text-slate-400 hover:text-white hover:bg-white/5 dark:text-slate-600 dark:hover:text-slate-900 dark:hover:bg-slate-300/60"
                }`}
              >
                <span>Chat</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-xs ${
                    isThreadLimitReached
                      ? "bg-red-500/20 text-red-400 font-bold"
                      : "bg-white/15 text-white dark:bg-slate-300 dark:text-slate-900"
                  }`}
                >
                  {messages.length}/{MAX_MESSAGES_LIMIT}
                </span>
              </button>

              {/* Right: + New Chat and Threads (shifted to the right side after New Chat) */}
              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 px-2.5 text-[11px] gap-1 font-medium text-[#2D9BF0] border-[#1E2B45] hover:bg-[#2D9BF0]/15 dark:border-slate-300 dark:hover:bg-slate-300/60 cursor-pointer bg-transparent rounded-xs"
                  onClick={handleNewChat}
                  disabled={isCreatingThread}
                  title="Start a new conversation thread"
                >
                  <Plus className="h-3 w-3" />
                  <span>New Chat</span>
                </Button>

                <button
                  type="button"
                  onClick={() => setActiveTab(activeTab === "history" ? "chat" : "history")}
                  className={`px-2.5 py-1 rounded-xs text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 border ${
                    activeTab === "history"
                      ? "bg-[#2D9BF0] text-white border-[#2D9BF0] shadow-xs font-semibold"
                      : "border-[#1E2B45] text-slate-400 hover:text-white hover:bg-white/5 dark:border-slate-300 dark:text-slate-600 dark:hover:text-slate-900 dark:hover:bg-slate-300/60"
                  }`}
                  title="View conversation threads history"
                >
                  <History className="h-3 w-3" />
                  <span>Threads</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-xs bg-white/15 text-white dark:bg-slate-300 dark:text-slate-900">
                    {threads.length}
                  </span>
                </button>
              </div>
            </div>
          </div>

        {/* VIEW 1: DEDICATED THREADS / HISTORY PANEL */}
        {activeTab === "history" && (
          <div
            className="flex-1 overflow-y-auto overscroll-contain p-3 space-y-2 bg-[#090E1A] dark:bg-slate-100 thin-scrollbar"
            style={{ overscrollBehavior: "contain" }}
          >
            <div className="flex items-center justify-between px-1 pb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400/80 dark:text-slate-500/90 select-none">
                All Threads ({threads.length})
              </span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500">
                Max {MAX_MESSAGES_LIMIT} msgs/thread
              </span>
            </div>

            {threads.length === 0 ? (
              <div className="p-6 text-center border border-dashed border-[#152033] dark:border-slate-300 rounded-xs bg-[#0E1729]/60 dark:bg-white/60 space-y-2">
                <MessageSquare className="w-6 h-6 text-slate-500/50 mx-auto" />
                <p className="text-xs text-slate-400 dark:text-slate-600">
                  No conversation threads yet.
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs gap-1 border-[#1E2B45] text-[#2D9BF0] hover:bg-[#2D9BF0]/15 dark:border-slate-300 rounded-xs"
                  onClick={handleNewChat}
                  disabled={isCreatingThread}
                >
                  <Plus className="h-3 w-3" /> Start First Chat
                </Button>
              </div>
            ) : (
              <div className="space-y-1.5">
                {threads.map((thread) => {
                  const isEditing = editingThreadId === thread.id;
                  const isActive = activeConversationId === thread.id;

                  return (
                    <div
                      key={thread.id}
                      onClick={() => {
                        if (!isEditing) handleSelectThread(thread.id);
                      }}
                      className={`group relative flex flex-col p-2.5 rounded-xs border transition-all cursor-pointer ${
                        isActive
                          ? "border-[#2D9BF0] bg-[#2D9BF0]/15 dark:bg-blue-50 dark:border-[#2D9BF0] shadow-xs"
                          : "border-[#152033] bg-[#0E1729] hover:border-slate-700 hover:bg-[#15223D] dark:border-slate-200 dark:bg-white dark:hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 min-w-0">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <MessageSquare
                            className={`h-3.5 w-3.5 shrink-0 ${
                              isActive ? "text-[#2D9BF0] font-bold" : "text-slate-400 dark:text-slate-500"
                            }`}
                          />
                          {isEditing ? (
                            <div
                              className="flex items-center gap-1 min-w-0 flex-1"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <input
                                type="text"
                                value={editingThreadTitle}
                                onChange={(e) => setEditingThreadTitle(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault();
                                    handleSaveThreadTitle(thread.id);
                                  } else if (e.key === "Escape") {
                                    setEditingThreadId(null);
                                  }
                                }}
                                onBlur={() => handleSaveThreadTitle(thread.id)}
                                autoFocus
                                className="h-6 w-full rounded-xs border border-[#2D9BF0] bg-[#090E1A] dark:bg-white px-1.5 py-0.5 text-xs text-white dark:text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#2D9BF0]"
                              />
                              <button
                                type="button"
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  handleSaveThreadTitle(thread.id);
                                }}
                                className="text-[#2D9BF0] hover:text-[#2D9BF0]/80 p-0.5 rounded-xs cursor-pointer shrink-0"
                                title="Save title"
                              >
                                <Check className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  setEditingThreadId(null);
                                }}
                                className="text-slate-400 hover:text-white dark:text-slate-600 dark:hover:text-slate-900 p-0.5 rounded-xs cursor-pointer shrink-0"
                                title="Cancel"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          ) : (
                            <span
                              className={`text-xs truncate font-medium ${
                                isActive ? "text-[#2D9BF0] font-semibold" : "text-slate-200 dark:text-slate-800"
                              }`}
                            >
                              {thread.title}
                            </span>
                          )}
                        </div>

                        {!isEditing && (
                          <div className="flex items-center gap-1 shrink-0">
                            {isActive && (
                              <Badge
                                variant="secondary"
                                className="text-[9px] px-1 py-0 h-4 bg-[#2D9BF0]/20 text-[#2D9BF0] border-[#2D9BF0]/30 font-semibold rounded-xs"
                              >
                                Active
                              </Badge>
                            )}
                            <button
                              type="button"
                              onClick={(e) => handleStartEditThread(e, thread)}
                              className="text-slate-400 hover:text-[#2D9BF0] p-1 rounded-xs transition-colors opacity-60 group-hover:opacity-100 cursor-pointer"
                              title="Rename chat"
                            >
                              <Pencil className="h-3 w-3" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => handleDeleteThread(e, thread.id)}
                              className="text-slate-400 hover:text-red-400 p-1 rounded-xs transition-colors opacity-60 group-hover:opacity-100 cursor-pointer"
                              title="Delete thread"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 pt-1.5 border-t border-[#152033] dark:border-slate-200 mt-1.5">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-2.5 h-2.5 opacity-70" />
                          {new Date(thread.updatedAt).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                        <span
                          className={`font-medium ${
                            thread.messageCount >= MAX_MESSAGES_LIMIT
                              ? "text-amber-400 dark:text-amber-600 font-semibold"
                              : ""
                          }`}
                        >
                          {thread.messageCount}/{MAX_MESSAGES_LIMIT} messages
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* VIEW 2: ACTIVE CHAT FEED & CONVERSATION */}
        {activeTab === "chat" && (
          <>
            {/* Depleted Credits Notice Banner */}
            {isCreditDepleted && (
              <div className="mx-3 mt-2.5 p-2 rounded-xs bg-rose-500/15 border border-rose-500/30 text-[11px] text-rose-300 dark:text-rose-800 flex items-start gap-1.5 shrink-0">
                <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                <div className="flex-1 leading-tight">
                  <span className="font-semibold">Monthly Credits Depleted: </span>
                  You have used all {userQuota?.quota}/{userQuota?.quota} AI assistant credits for this month. AI generation is paused until quota renewal on the 1st of next month.
                  <button
                    type="button"
                    onClick={() => setUpgradeDialogOpen(true)}
                    className="ml-1 font-bold underline hover:text-white dark:hover:text-black cursor-pointer"
                  >
                    Upgrade to Pro (150 Credits)
                  </button>
                </div>
              </div>
            )}

            {/* Messages Feed */}
            <div
              ref={chatScrollContainerRef}
              className="flex-1 overflow-y-auto overscroll-contain p-3 space-y-3.5 text-xs bg-[#090E1A] dark:bg-slate-100 thin-scrollbar"
              style={{ overscrollBehavior: "contain" }}
            >
              {messages.length === 0 ? (
                <div className="space-y-4 py-6 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full overflow-hidden ring-2 ring-[#2D9BF0]/60 shadow-md bg-[#0E1729]">
                    <Image
                      src="/ichinose-avatar.jpg"
                      alt="Ichinose"
                      width={56}
                      height={56}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="space-y-1.5 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <h4 className="text-base font-bold text-white dark:text-slate-900 tracking-tight">
                        Ichinose
                      </h4>
                      <Badge
                        variant="outline"
                        className="text-[10px] px-2 py-0.5 font-semibold text-[#2D9BF0] border-[#2D9BF0]/30 bg-[#2D9BF0]/15 rounded-xs"
                      >
                        Prava AI Assistant
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-400 dark:text-slate-600 max-w-xs mx-auto leading-relaxed">
                      Your Prava workspace assistant. Ask questions, explore live weather and exchange rates, or request <span className="font-semibold text-white dark:text-slate-900">structured proposals</span> to update your trip.
                    </p>
                  </div>

                  {/* Quick Prompt Chips */}
                  <div className="pt-2 space-y-1.5 text-left">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400/80 dark:text-slate-500/90 block px-1 select-none">
                      Suggested prompts:
                    </span>
                    {quickPrompts.map((prompt, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleSend(prompt)}
                        className="w-full text-left p-2.5 rounded-xs border border-[#152033] bg-[#0E1729] hover:border-[#2D9BF0]/50 hover:bg-[#15223D] text-slate-300 hover:text-white dark:border-slate-300 dark:bg-white dark:hover:bg-slate-50 dark:text-slate-700 dark:hover:text-slate-950 transition-colors text-xs flex items-center justify-between group cursor-pointer shadow-xs"
                      >
                        <span className="line-clamp-1">{prompt}</span>
                        <CornerDownLeft className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-1" />
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((msg) => (
                  <div key={msg.id} className="space-y-2">
                    <div
                      className={`flex gap-2 ${
                        msg.role === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      {msg.role !== "user" && (
                        <div
                          className="flex h-6 w-6 shrink-0 select-none items-center justify-center rounded-full overflow-hidden ring-1 ring-[#2D9BF0]/50 mt-0.5 shadow-xs bg-[#0E1729]"
                          title="Ichinose (Prava AI Assistant)"
                        >
                          <Image
                            src="/ichinose-avatar.jpg"
                            alt="Ichinose"
                            width={24}
                            height={24}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      )}

                      <div
                        className={`rounded-xs p-3 max-w-[88%] text-xs leading-relaxed space-y-1.5 break-words [overflow-wrap:anywhere] overflow-hidden ${
                          msg.role === "user"
                            ? "bg-[#2D9BF0] text-white font-medium shadow-xs"
                            : "bg-[#0E1729] border border-[#1E2B45] text-slate-100 dark:bg-white dark:border-slate-200 dark:text-slate-900 shadow-xs"
                        }`}
                      >
                        {/* Live Travel Essential Tool Badge */}
                        {msg.toolBadge && (
                          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-xs bg-[#152542] dark:bg-blue-100 border border-[#1E3A6B] dark:border-blue-200 text-blue-300 dark:text-blue-900 text-[10px] font-medium w-fit mb-1 not-italic">
                            {msg.toolBadge.toLowerCase().includes("weather") ? (
                              <CloudSun className="w-3 h-3 text-blue-400 dark:text-blue-600 shrink-0" />
                            ) : msg.toolBadge.toLowerCase().includes("free") ? (
                              <Zap className="w-3 h-3 text-amber-400 dark:text-amber-600 shrink-0" />
                            ) : (
                              <Coins className="w-3 h-3 text-amber-400 dark:text-amber-600 shrink-0" />
                            )}
                            <span>{msg.toolBadge}</span>
                          </div>
                        )}

                        <FormattedMessageContent
                          content={msg.content}
                          isUser={msg.role === "user"}
                        />

                        {/* Model attribution badge */}
                        {msg.role === "model" && msg.modelUsed && (
                          <div className="pt-1 flex items-center gap-1 text-[9px] text-slate-400 dark:text-slate-500 font-mono select-none">
                            <Cpu className="w-2.5 h-2.5" />
                            <span>{formatModelName(msg.modelUsed)}</span>
                          </div>
                        )}
                      </div>

                      {msg.role === "user" && (
                        <div
                          className="relative flex h-6 w-6 shrink-0 select-none items-center justify-center rounded-full overflow-hidden ring-1 ring-[#1E2B45] dark:ring-slate-300 mt-0.5 shadow-xs bg-[#0E1729]"
                          title="You"
                        >
                          <Image
                            src={userAvatarUrl || "/default-avatar.jpg"}
                            alt="You"
                            width={24}
                            height={24}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "/default-avatar.jpg";
                            }}
                          />
                        </div>
                      )}
                    </div>

                    {/* Render Structured Proposal Card if attached */}
                    {msg.proposal && (
                      <div className="pl-8 pr-1">
                        <AiProposalCard
                          proposal={msg.proposal}
                          tripId={tripId}
                          onProposalResolved={handleProposalResolved}
                        />
                      </div>
                    )}
                  </div>
                ))
              )}

              {isLoading && (
                <div className="flex gap-2 items-center text-xs text-slate-400 dark:text-slate-600 py-1.5">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full overflow-hidden ring-1 ring-[#2D9BF0]/40">
                    <Image
                      src="/ichinose-avatar.jpg"
                      alt="Ichinose"
                      width={24}
                      height={24}
                      className="h-full w-full object-cover opacity-80 animate-pulse"
                    />
                  </div>
                  <span>Ichinose is analyzing trip data...</span>
                </div>
              )}

              {error && (
                <div className="rounded-xs bg-red-500/10 border border-red-500/20 p-2.5 text-xs text-red-400 dark:text-red-700 flex flex-col gap-1.5">
                  <div className="flex items-start gap-1.5">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span className="leading-snug">{error}</span>
                  </div>
                  {(error.includes("limit") || error.includes("quota") || error.includes("depleted")) && (
                    <button
                      type="button"
                      onClick={() => setUpgradeDialogOpen(true)}
                      className="text-xs font-bold text-[#2D9BF0] hover:underline text-left pl-5 cursor-pointer"
                    >
                      Upgrade to Pro Wanderer for unlimited AI messages &rarr;
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Ceiling Warning & Start New Chat prompt */}
            {isThreadLimitReached && (
              <div className="mx-3 mb-2 p-2 rounded-xs bg-amber-500/15 border border-amber-500/30 text-xs text-amber-300 dark:text-amber-800 flex items-center justify-between gap-2 shrink-0">
                <div className="flex items-center gap-1.5 min-w-0">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                  <span className="text-[11px] font-medium truncate">
                    Chat limit reached ({MAX_MESSAGES_LIMIT}/{MAX_MESSAGES_LIMIT} msgs).
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="default"
                  className="h-6 text-[11px] px-2 gap-1 cursor-pointer shrink-0 bg-[#2D9BF0] text-white hover:bg-[#2087D6] rounded-xs"
                  onClick={handleNewChat}
                  disabled={isCreatingThread}
                >
                  <Plus className="w-3 h-3" />
                  New Chat
                </Button>
              </div>
            )}

            {/* Input Form & AI Disclaimer */}
            <div className="p-3 border-t border-[#152033] dark:border-slate-300 bg-[#090E1A] dark:bg-slate-100 shrink-0 space-y-1.5">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  placeholder={
                    isCreditDepleted
                      ? `Monthly credits exhausted (${userQuota?.quota}/${userQuota?.quota}). Upgrade to Pro.`
                      : isThreadLimitReached
                      ? "Thread limit reached. Start a new chat session."
                      : "Ask Ichinose or request changes (e.g. 'Add dinner at 7 PM')..."
                  }
                  className="flex-1 h-9 rounded-xs border border-[#1E2B45] bg-[#0E1729] px-3 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-[#2D9BF0] focus:border-[#2D9BF0] dark:border-slate-300 dark:bg-white dark:text-slate-900 dark:placeholder:text-slate-400 disabled:opacity-50"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={isLoading || isThreadLimitReached || isCreditDepleted}
                />
                {isCreditDepleted ? (
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => setUpgradeDialogOpen(true)}
                    className="h-9 px-3 shrink-0 cursor-pointer bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xs shadow-xs gap-1"
                  >
                    <Zap className="w-3.5 h-3.5 fill-current" />
                    Upgrade
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    size="sm"
                    className="h-9 px-3 shrink-0 cursor-pointer bg-[#2D9BF0] text-white hover:bg-[#2087D6] rounded-xs shadow-xs"
                    disabled={isLoading || !input.trim() || isThreadLimitReached}
                  >
                    {isLoading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Send className="w-3.5 h-3.5" />
                    )}
                  </Button>
                )}
              </form>
              <p className="text-[10px] text-center text-slate-400/80 dark:text-slate-500/80 select-none leading-none">
                AI can make mistakes. Cross-verify important travel details.
              </p>
            </div>
          </>
        )}

        {/* Upgrade Dialog */}
        <UpgradeDialog
          open={upgradeDialogOpen}
          onOpenChange={setUpgradeDialogOpen}
          title="Upgrade for Unlimited Ichinose AI Assistant"
          description="Free Explorer accounts include 30 AI credits per month. Upgrade to Pro Wanderer for 150 AI credits, priority Gemini generation, and unlimited workspace planning."
        />
        </div>
      </aside>
    </>
  );
}
