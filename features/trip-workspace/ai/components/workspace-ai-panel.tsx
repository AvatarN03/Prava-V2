"use client";

import { useState, useEffect, useRef, useTransition } from "react";

import {
  Sparkles,
  Send,
  Loader2,
  Trash2,
  X,
  Bot,
  User,
  AlertCircle,
  CornerDownLeft,
  History,
  Plus,
  MessageSquare,
  CloudSun,
  Coins,
  Cpu,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { AiProposalCard } from "./ai-proposal-card";
import { UpgradeDialog } from "@/features/pricing/components/upgrade-dialog";

import {
  getTripConversation,
  getTripConversationThreads,
  createTripConversationThread,
  deleteTripConversationThread,
  sendTripMessage,
  clearTripConversation,
  MessageDTO,
  ConversationThreadDTO,
} from "../actions";

import { AiProposalDTO } from "../schema";

function formatModelName(model?: string): string | null {
  if (!model) return null;
  if (model.includes("gemma-4")) return "Gemma 4 31B (Free)";
  if (model.includes("nemotron")) return "Nemotron 3.5 (Free)";
  if (model.includes("openrouter/free")) return "OpenRouter Free";
  if (model.includes("gemini-2.0-flash-lite")) return "Gemini 2.0 Flash Lite";
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

  // Strip accidental developer JSON code blocks or citations
  const sanitized = content
    .replace(/(?:\*{0,2}Live Data Citation:?\*{0,2}\s*)?```(?:json)?\s*\{[\s\S]*?\}\s*```/gi, "")
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

    flushList();

    // Regular line / paragraph
    nodes.push(
      <p key={`p-${idx}`} className="leading-relaxed my-0.5 break-words [overflow-wrap:anywhere]">
        {renderInlineSpans(line)}
      </p>
    );
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
  const [messages, setMessages] = useState<MessageDTO[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [activeConversationTitle, setActiveConversationTitle] = useState<string>("");
  const [threads, setThreads] = useState<ConversationThreadDTO[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCreatingThread, setIsCreatingThread] = useState(false);
  const [isClearing, startClearing] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      loadInitialConversation();
      loadThreadsList();
    }
  }, [isOpen, tripId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const loadInitialConversation = async (targetId?: string) => {
    setError(null);
    const res = await getTripConversation(tripId, targetId);
    if (res.success && res.messages) {
      setMessages(res.messages);
      setActiveConversationId(res.conversationId || null);
      setActiveConversationTitle(res.conversationTitle || "Trip Assistant");
    }
  };

  const loadThreadsList = async () => {
    const res = await getTripConversationThreads(tripId);
    if (res.success && res.threads) {
      setThreads(res.threads);
    }
  };

  const handleSelectThread = async (threadId: string) => {
    setShowHistory(false);
    await loadInitialConversation(threadId);
  };

  const handleNewChat = async () => {
    setIsCreatingThread(true);
    setError(null);
    const res = await createTripConversationThread(tripId);
    setIsCreatingThread(false);
    if (res.success && res.conversationId) {
      setShowHistory(false);
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
      // Avoid repetitive roundtrips: only reload threads list on very first message
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 flex w-full sm:w-[480px] flex-col border-l border-border bg-card shadow-2xl animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="flex h-14 items-center justify-between border-b border-border px-3.5 bg-background gap-2 min-w-0">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm bg-primary/10 text-primary">
            <Sparkles className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-xs font-bold text-foreground truncate block">
                {activeConversationTitle || "Workspace AI"}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground truncate leading-tight">
              <span className="inline-flex items-center gap-1 text-emerald-600 font-medium shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Free Cascade
              </span>
              <span className="text-muted-foreground/40">•</span>
              <span className="shrink-0">{messages.length}/30 msgs</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {/* History Drawer Toggle Button */}
          <Button
            variant="ghost"
            size="sm"
            className={`h-8 px-2 text-xs gap-1 ${
              showHistory
                ? "bg-blue-50 text-blue-700 font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setShowHistory(!showHistory)}
            title="View Chat History"
          >
            <History className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">History</span>
          </Button>

          {/* New Chat Button */}
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-xs gap-1 text-primary hover:bg-blue-50"
            onClick={handleNewChat}
            disabled={isCreatingThread}
            title="Start New Chat"
          >
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">New</span>
          </Button>

          {messages.length > 0 && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
              onClick={handleClear}
              disabled={isClearing}
              title="Clear current chat"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground shrink-0"
            onClick={onClose}
            title="Close Assistant"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* History Drawer Overlay (when showHistory is true) */}
      {showHistory && (
        <div className="border-b border-border bg-muted/40 p-3 space-y-2 animate-in slide-in-from-top-2 duration-150 max-h-64 overflow-y-auto">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Conversation History ({threads.length})
            </span>
            <Button
              size="sm"
              variant="outline"
              className="h-6 text-[10px] px-2 gap-1"
              onClick={handleNewChat}
              disabled={isCreatingThread}
            >
              <Plus className="h-3 w-3" /> New Thread
            </Button>
          </div>

          <div className="space-y-1">
            {threads.length === 0 ? (
              <p className="text-xs text-muted-foreground p-3 text-center">
                No past conversation threads yet.
              </p>
            ) : (
              threads.map((thread) => (
                <div
                  key={thread.id}
                  onClick={() => handleSelectThread(thread.id)}
                  className={`flex items-center justify-between p-2 rounded-md text-xs cursor-pointer transition-colors ${
                    activeConversationId === thread.id
                      ? "bg-blue-100 text-blue-900 font-semibold border border-blue-200"
                      : "hover:bg-muted text-foreground"
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <MessageSquare className="h-3.5 w-3.5 shrink-0 text-primary/70" />
                    <span className="truncate">{thread.title}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] text-muted-foreground">
                      {thread.messageCount} msgs
                    </span>
                    <button
                      type="button"
                      onClick={(e) => handleDeleteThread(e, thread.id)}
                      className="text-muted-foreground hover:text-destructive p-1 rounded transition-colors"
                      title="Delete thread"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        {messages.length === 0 ? (
          <div className="space-y-4 py-6 text-center">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-semibold text-foreground">
                Trip Context & Action Assistant
              </h4>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed">
                I can review your workspace data and generate <span className="font-semibold text-foreground">structured proposals</span> to add, modify, or delete itinerary items and accommodations.
              </p>
            </div>

            {/* Quick Prompt Chips */}
            <div className="pt-2 space-y-1.5 text-left">
              <span className="text-[11px] font-semibold text-muted-foreground block px-1">
                Suggested prompts:
              </span>
              {quickPrompts.map((prompt, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSend(prompt)}
                  className="w-full text-left p-2.5 rounded-sm border border-border bg-background hover:border-primary/50 hover:bg-accent/40 transition-colors text-xs text-foreground flex items-center justify-between group cursor-pointer"
                >
                  <span className="line-clamp-1">{prompt}</span>
                  <CornerDownLeft className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-1" />
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className="space-y-2">
              <div
                className={`flex gap-2.5 ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {msg.role !== "user" && (
                  <div className="flex h-6 w-6 shrink-0 select-none items-center justify-center rounded-xs bg-primary/10 text-primary mt-0.5">
                    <Bot className="h-3.5 w-3.5" />
                  </div>
                )}

                <div
                  className={`rounded-sm p-3 max-w-[85%] text-xs leading-relaxed space-y-1.5 break-words [overflow-wrap:anywhere] overflow-hidden ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground font-medium"
                      : "bg-muted/40 border border-border text-foreground"
                  }`}
                >
                  {/* Live Travel Essential Tool Badge */}
                  {msg.toolBadge && (
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-blue-100/80 border border-blue-200 text-blue-900 text-[11px] font-medium w-fit mb-1 not-italic">
                      {msg.toolBadge.toLowerCase().includes("weather") ? (
                        <CloudSun className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      ) : (
                        <Coins className="w-3.5 h-3.5 text-amber-600 shrink-0" />
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
                    <div className="pt-1 flex items-center gap-1 text-[9px] text-muted-foreground/75 font-mono select-none">
                      <Cpu className="w-2.5 h-2.5" />
                      <span>{formatModelName(msg.modelUsed)}</span>
                    </div>
                  )}
                </div>

                {msg.role === "user" && (
                  <div className="flex h-6 w-6 shrink-0 select-none items-center justify-center rounded-xs bg-secondary text-foreground mt-0.5">
                    <User className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                )}
              </div>

              {/* Render Structured Proposal Card if attached */}
              {msg.proposal && (
                <div className="pl-8 pr-2">
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
          <div className="flex gap-2.5 items-center text-xs text-muted-foreground py-2">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-xs bg-primary/10 text-primary">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            </div>
            <span>Analyzing trip workspace context & preparing proposal...</span>
          </div>
        )}

        {error && (
          <div className="rounded-sm bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive flex flex-col gap-2">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
            {error.includes("limit reached") && (
              <button
                type="button"
                onClick={() => setUpgradeDialogOpen(true)}
                className="text-xs font-bold text-primary hover:underline text-left pl-6"
              >
                Upgrade to Pro Wanderer for unlimited AI messages &rarr;
              </button>
            )}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="p-3 border-t border-border bg-background">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="Ask AI or request a change (e.g. 'Add dinner at Kyoto Gion')..."
            className="flex-1 h-9 rounded-sm border border-border bg-card px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
          />
          <Button
            type="submit"
            size="sm"
            className="h-9 px-3 shrink-0"
            disabled={isLoading || !input.trim()}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
          </Button>
        </form>
      </div>

      {/* Upgrade Dialog */}
      <UpgradeDialog
        open={upgradeDialogOpen}
        onOpenChange={setUpgradeDialogOpen}
        title="Upgrade for Unlimited AI Assistant"
        description="Free Explorer accounts include up to 30 messages per conversation thread. Upgrade to Pro Wanderer for unlimited priority AI conversations and deep workspace mutations."
      />
    </div>
  );
}
