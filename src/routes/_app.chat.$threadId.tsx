import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listThreads, createThread, deleteThread, loadMessages, saveMessages, archiveThread } from "@/lib/chat.functions";
import { listFeedback, setFeedback, clearFeedback } from "@/lib/feedback.functions";
import { ToolResultCard } from "@/components/tool-cards";
import { getProfile } from "@/lib/profile.functions";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus, Trash2, Send, Mic, MicOff, Volume2, VolumeX, Copy, Check, ThumbsUp, ThumbsDown, Pencil, X, Download, FileText, FileType2, FileDown, GraduationCap, Brain, Shuffle, Eye, ListChecks, FileText as FileSummary, Lightbulb, Archive, ArchiveRestore, Search, Sparkles } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { StreamingMarkdown } from "@/components/streaming-markdown";
import { CoachAvatar } from "@/components/coach-avatar";
import { useSmartAutoScroll } from "@/hooks/use-smart-auto-scroll";
import { CoachInsightsPanel } from "@/components/coach-insights-panel";
import coachFemale from "@/assets/coach-female.png.asset.json";
import coachMale from "@/assets/coach-male.png.asset.json";
import logo from "@/assets/morshed-logo.png";

export const Route = createFileRoute("/_app/chat/$threadId")({
  component: ChatPage,
});

function ChatPage() {
  const { threadId } = useParams({ from: "/_app/chat/$threadId" });
  const { t, lang } = useI18n();
  const { user, session } = useAuth();
  const nav = useNavigate();
  const qc = useQueryClient();

  const list = useServerFn(listThreads);
  const create = useServerFn(createThread);
  const del = useServerFn(deleteThread);
  const arch = useServerFn(archiveThread);
  const load = useServerFn(loadMessages);
  const save = useServerFn(saveMessages);
  const profileFn = useServerFn(getProfile);

  const { data: threads } = useQuery({ queryKey: ["threads"], queryFn: () => list() });
  const { data: initial } = useQuery({ queryKey: ["messages", threadId], queryFn: () => load({ data: { threadId } }) });
  const { data: profile } = useQuery({ queryKey: ["profile"], queryFn: () => profileFn() });

  const createM = useMutation({
    mutationFn: async () => create({ data: {} }),
    onSuccess: (th) => { qc.invalidateQueries({ queryKey: ["threads"] }); nav({ to: "/chat/$threadId", params: { threadId: th.id } }); },
  });

  const coachChoice = (profile?.coach_choice as "female" | "male" | "morshed" | undefined) ?? "morshed";
  const coachAvatar = coachChoice === "female" ? coachFemale.url : coachChoice === "male" ? coachMale.url : logo;
  const coachName = coachChoice === "female" ? "Layla" : coachChoice === "male" ? "Karim" : "Morshed";

  return <ChatInner key={threadId} threadId={threadId} initial={(initial as UIMessage[] | undefined) ?? []} threads={(threads as Array<{ id: string; title: string; archived?: boolean }> | undefined) ?? []} onNew={() => createM.mutate()} onArchive={async (id, archived) => {
    await arch({ data: { id, archived } });
    qc.invalidateQueries({ queryKey: ["threads"] });
    if (archived && id === threadId) {
      const remaining = (threads ?? []).filter(t => t.id !== id && !(t as { archived?: boolean }).archived);
      if (remaining[0]) nav({ to: "/chat/$threadId", params: { threadId: remaining[0].id }, replace: true });
      else createM.mutate();
    }
  }} onDelete={async (id) => {
    await del({ data: { id } });
    qc.invalidateQueries({ queryKey: ["threads"] });
    if (id === threadId) {
      const remaining = (threads ?? []).filter(t => t.id !== id);
      if (remaining[0]) nav({ to: "/chat/$threadId", params: { threadId: remaining[0].id }, replace: true });
      else createM.mutate();
    }
  }} lang={lang} t={t} userName={user?.email?.split("@")[0]} authToken={session?.access_token} save={save} coachAvatar={coachAvatar} coachName={coachName} />;
}

// Web Speech API types
interface SRConstructor { new (): SpeechRecognitionLike }
interface SpeechRecognitionLike {
  lang: string; continuous: boolean; interimResults: boolean;
  start(): void; stop(): void;
  onresult: ((e: { results: ArrayLike<{ 0: { transcript: string }; isFinal: boolean }> }) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
}

function getSpeechRecognition(): SRConstructor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: SRConstructor; webkitSpeechRecognition?: SRConstructor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

function ChatInner({ threadId, initial, threads, onNew, onArchive, onDelete, lang, t, userName, authToken, save, coachAvatar, coachName }: {
  threadId: string;
  initial: UIMessage[];
  threads: Array<{ id: string; title: string; archived?: boolean }>;
  onNew: () => void;
  onArchive: (id: string, archived: boolean) => void;
  onDelete: (id: string) => void;
  lang: string;
  t: (k: string) => string;
  userName?: string;
  authToken?: string;
  save: (args: { data: { threadId: string; messages: { role: string; parts: unknown }[] } }) => Promise<unknown>;
  coachAvatar: string;
  coachName: string;
}) {
  const [input, setInput] = useState("");
  const [listening, setListening] = useState(false);
  const [voiceOn, setVoiceOn] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [feedback, setFeedbackState] = useState<Record<string, 1 | -1>>({});
  const [commentFor, setCommentFor] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [search, setSearch] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const recRef = useRef<SpeechRecognitionLike | null>(null);
  const spokenRef = useRef<Set<string>>(new Set());

  const listFb = useServerFn(listFeedback);
  const setFb = useServerFn(setFeedback);
  const clrFb = useServerFn(clearFeedback);
  useEffect(() => {
    listFb({ data: { threadId } }).then((rows) => {
      const map: Record<string, 1 | -1> = {};
      (rows as Array<{ message_id: string; rating: number }>).forEach(r => { map[r.message_id] = r.rating as 1 | -1; });
      setFeedbackState(map);
    }).catch(() => {});
  }, [threadId]);

  const { messages, sendMessage, status } = useChat({
    id: threadId,
    messages: initial,
    transport: new DefaultChatTransport({
      api: "https://web-production-8fe14.up.railway.app/api/chat",
      headers: async (): Promise<Record<string, string>> => {
        const { data } = await supabase.auth.getSession();
        const token = data.session?.access_token ?? authToken;
        return token ? { Authorization: `Bearer ${token}` } : {};
      },
      body: { language: lang, name: userName, threadId, coach: "executive" },
    }),
    onFinish: ({ messages: ms }) => {
      void save({ data: { threadId, messages: ms.map(m => ({ role: m.role, parts: m.parts })) } });
    },
    onError: (error) => setChatError(error.message || "Chat response failed"),
  });

  const scrollRef = useSmartAutoScroll<HTMLDivElement>([messages, status]);

  useEffect(() => { inputRef.current?.focus(); }, [threadId, status]);

  // TTS: speak completed assistant messages when voiceOn
  useEffect(() => {
    if (!voiceOn || typeof window === "undefined" || !window.speechSynthesis) return;
    const last = messages[messages.length - 1];
    if (!last || last.role !== "assistant") return;
    if (status === "streaming" || status === "submitted") return;
    if (spokenRef.current.has(last.id)) return;
    const text = last.parts.filter(p => p.type === "text").map(p => (p as { text: string }).text).join("").replace(/[#*_`>\-]/g, "");
    if (!text.trim()) return;
    spokenRef.current.add(last.id);
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang === "fa" ? "fa-IR" : lang === "ar" ? "ar-SA" : "en-US";
    u.rate = 1; u.pitch = 1;
    u.onstart = () => setSpeakingId(last.id);
    u.onend = () => setSpeakingId((s) => (s === last.id ? null : s));
    u.onerror = () => setSpeakingId(null);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  }, [messages, status, voiceOn, lang]);

  useEffect(() => () => {
    if (typeof window !== "undefined" && window.speechSynthesis) window.speechSynthesis.cancel();
    recRef.current?.stop();
  }, []);

  const toggleMic = () => {
    const SR = getSpeechRecognition();
    if (!SR) { alert(t("chat.voiceUnsupported") || "Voice input not supported in this browser"); return; }
    if (listening) { recRef.current?.stop(); return; }
    const rec = new SR();
    rec.lang = lang === "fa" ? "fa-IR" : lang === "ar" ? "ar-SA" : "en-US";
    rec.continuous = false;
    rec.interimResults = true;
    rec.onresult = (e) => {
      let txt = "";
      for (let i = 0; i < e.results.length; i++) txt += e.results[i][0].transcript;
      setInput(txt);
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recRef.current = rec;
    setListening(true);
    rec.start();
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || status === "submitted" || status === "streaming") return;
    if (!authToken) { setChatError("Please sign in again to continue coaching."); return; }
    recRef.current?.stop();
    if (typeof window !== "undefined" && window.speechSynthesis) window.speechSynthesis.cancel();
    setChatError(null);
    try {
      await sendMessage({ text: input.trim() });
      setInput("");
    } catch (error) {
      setChatError(error instanceof Error ? error.message : "Chat response failed");
    }
  };

  const sendQuickAction = async (instruction: string) => {
    if (status === "submitted" || status === "streaming") return;
    if (!authToken) { setChatError("Please sign in again to continue coaching."); return; }
    setChatError(null);
    const text = input.trim() ? `${input.trim()}\n\n${instruction}` : instruction;
    try { await sendMessage({ text }); setInput(""); } catch (error) {
      setChatError(error instanceof Error ? error.message : "Chat response failed");
    }
  };

  const copyText = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId((c) => (c === id ? null : c)), 1500);
      toast.success(t("chat.copied") || "Copied");
    } catch { toast.error("Copy failed"); }
  };

  const react = async (messageId: string, rating: 1 | -1) => {
    const current = feedback[messageId];
    if (current === rating) {
      setFeedbackState((s) => { const n = { ...s }; delete n[messageId]; return n; });
      await clrFb({ data: { messageId } }).catch(() => {});
      return;
    }
    setFeedbackState((s) => ({ ...s, [messageId]: rating }));
    await setFb({ data: { threadId, messageId, rating } }).catch(() => {});
    if (rating === -1) { setCommentFor(messageId); setCommentText(""); }
    else toast.success(t("chat.thanks") || "Thanks for the feedback");
  };

  const submitComment = async () => {
    if (!commentFor) return;
    await setFb({ data: { threadId, messageId: commentFor, rating: -1, comment: commentText.trim() || undefined } }).catch(() => {});
    toast.success(t("chat.thanks") || "Thanks — I'll learn from this");
    setCommentFor(null); setCommentText("");
  };

  const startEdit = (id: string, text: string) => { setEditingId(id); setEditText(text); };
  const submitEdit = async () => {
    if (!editingId || !editText.trim()) return;
    const text = editText.trim();
    setEditingId(null); setEditText("");
    try { await sendMessage({ text }); } catch (e) { setChatError(e instanceof Error ? e.message : "Failed"); }
  };

  const buildExport = () => {
    const lines: Array<{ role: string; text: string }> = [];
    messages.forEach((m) => {
      const text = m.parts.filter(p => p.type === "text").map(p => (p as { text: string }).text).join("").trim();
      if (text) lines.push({ role: m.role, text });
    });
    return lines;
  };
  const dateStr = () => new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
  const threadTitle = (threads.find(th => th.id === threadId)?.title || "conversation").replace(/[^\w\u0600-\u06FF\- ]+/g, "").slice(0, 60) || "conversation";

  const downloadBlob = (content: BlobPart, mime: string, ext: string) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${threadTitle}-${dateStr()}.${ext}`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const exportTxt = () => {
    const lines = buildExport();
    if (!lines.length) { toast.error(t("chat.exportEmpty") || "No messages to export"); return; }
    const body = lines.map(l => `[${l.role === "user" ? (userName || "You") : coachName}]\n${l.text}\n`).join("\n");
    const header = `${coachName} — ${threadTitle}\n${new Date().toLocaleString()}\n\n`;
    downloadBlob("\ufeff" + header + body, "text/plain;charset=utf-8", "txt");
    toast.success(t("chat.exported") || "Downloaded");
  };

  const escapeHtml = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
  const buildHtml = () => {
    const lines = buildExport();
    const rows = lines.map(l => {
      const who = l.role === "user" ? (userName || "You") : coachName;
      const color = l.role === "user" ? "#0f172a" : "#a47e2c";
      return `<div style="margin:0 0 14px 0;"><div style="font-weight:700;color:${color};margin-bottom:4px;font-size:13px;">${escapeHtml(who)}</div><div style="white-space:pre-wrap;line-height:1.6;color:#1a1a1a;font-size:14px;">${escapeHtml(l.text)}</div></div>`;
    }).join("");
    const dir = lang === "fa" || lang === "ar" ? "rtl" : "ltr";
    return `<!doctype html><html lang="${lang}" dir="${dir}"><head><meta charset="utf-8"><title>${escapeHtml(threadTitle)}</title></head><body style="font-family:Tahoma,Arial,sans-serif;max-width:780px;margin:24px auto;padding:0 16px;color:#1a1a1a;"><h1 style="color:#a47e2c;border-bottom:2px solid #d4af37;padding-bottom:8px;margin-bottom:4px;">${escapeHtml(coachName)} — ${escapeHtml(threadTitle)}</h1><div style="color:#666;font-size:12px;margin-bottom:20px;">${new Date().toLocaleString()}</div>${rows}</body></html>`;
  };

  const exportDoc = () => {
    if (!buildExport().length) { toast.error(t("chat.exportEmpty") || "No messages to export"); return; }
    downloadBlob(buildHtml(), "application/msword", "doc");
    toast.success(t("chat.exported") || "Downloaded");
  };

  const exportPdf = () => {
    if (!buildExport().length) { toast.error(t("chat.exportEmpty") || "No messages to export"); return; }
    const w = window.open("", "_blank");
    if (!w) { toast.error(t("chat.popupBlocked") || "Allow pop-ups to export PDF"); return; }
    w.document.open();
    w.document.write(buildHtml().replace("</body>", "<script>window.onload=function(){setTimeout(function(){window.print();},300);};</script></body>"));
    w.document.close();
  };




  return (
    <div className="flex h-screen bg-cream">
      {/* Thread list */}
      <div className="w-72 border-e bg-card flex flex-col shrink-0">
        <div className="p-3 border-b space-y-2">
          <Button onClick={onNew} className="w-full gap-2 btn-luxe-gold rounded-full h-11 font-semibold">
            <Plus className="size-4" />{t("chat.new")}
          </Button>
          <div className="relative">
            <Search className="size-3.5 absolute start-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t("chat.searchPlaceholder")} className="h-9 ps-8 rounded-full text-xs border-gold/20 focus-visible:ring-gold" />
          </div>
          <div className="flex bg-secondary rounded-full p-0.5 text-[11px] font-semibold">
            <button onClick={() => setShowArchived(false)} className={`flex-1 py-1 rounded-full transition-all ${!showArchived ? "bg-card text-deep shadow-sm" : "text-muted-foreground"}`}>
              {t("chat.active")} · {threads.filter(th => !th.archived).length}
            </button>
            <button onClick={() => setShowArchived(true)} className={`flex-1 py-1 rounded-full transition-all flex items-center justify-center gap-1 ${showArchived ? "bg-card text-deep shadow-sm" : "text-muted-foreground"}`}>
              <Archive className="size-3" />
              {threads.filter(th => th.archived).length}
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {threads
            .filter(th => !!th.archived === showArchived)
            .filter(th => !search.trim() || th.title.toLowerCase().includes(search.trim().toLowerCase()))
            .map((th) => (
              <div key={th.id} className={`group flex items-center gap-0.5 rounded-xl transition-colors ${th.id === threadId ? "bg-gold/15 shadow-sm" : "hover:bg-gold/5"}`}>
                <Link to="/chat/$threadId" params={{ threadId: th.id }} className={`flex-1 min-w-0 px-3 py-2 text-sm truncate ${th.id === threadId ? "text-deep font-semibold" : "text-muted-foreground hover:text-foreground"}`}>
                  {th.title}
                </Link>
                <button
                  onClick={() => onArchive(th.id, !th.archived)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 text-muted-foreground hover:text-deep hover:bg-gold/10 rounded-md transition-all"
                  title={th.archived ? t("chat.unarchive") : t("chat.archive")}
                >
                  {th.archived ? <ArchiveRestore className="size-3.5" /> : <Archive className="size-3.5" />}
                </button>
                <button
                  onClick={() => setConfirmDelete(th.id)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-all"
                  title={t("chat.confirmDelete.confirm")}
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            ))}
          {threads.filter(th => !!th.archived === showArchived).length === 0 && (
            <div className="text-center py-8 px-3">
              <div className="size-10 rounded-full bg-gold/10 mx-auto flex items-center justify-center mb-2">
                {showArchived ? <Archive className="size-4 text-gold-foreground" /> : <Sparkles className="size-4 text-gold-foreground" />}
              </div>
              <p className="text-xs text-muted-foreground">{showArchived ? t("chat.archivedSection") : t("chat.new")}</p>
            </div>
          )}
        </div>
      </div>

      <AlertDialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("chat.confirmDelete.title")}</AlertDialogTitle>
            <AlertDialogDescription>{t("chat.confirmDelete.desc")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("chat.confirmDelete.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={() => { if (confirmDelete) { onDelete(confirmDelete); setConfirmDelete(null); } }} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {t("chat.confirmDelete.confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Messages */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Coach header */}
        <div className="border-b bg-card/80 backdrop-blur px-4 py-3 flex items-center gap-3">
          <CoachAvatar src={coachAvatar} name={coachName} size={44} speaking={speakingId !== null} />
          <div className="flex-1">
            <div className="text-sm font-semibold text-deep">{coachName}</div>
            <div className="text-xs text-muted-foreground">{speakingId ? (t("chat.speaking") || "Speaking…") : (t("chat.online") || "Online · AI Coach")}</div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="size-10 rounded-full flex items-center justify-center transition-all bg-secondary hover:bg-gold/20 text-deep"
                title={t("chat.export") || "Export conversation"}
              >
                <Download className="size-5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-44">
              <DropdownMenuItem onClick={exportPdf} className="gap-2 cursor-pointer">
                <FileDown className="size-4 text-rose-600" /> {t("chat.exportPdf") || "Download as PDF"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={exportDoc} className="gap-2 cursor-pointer">
                <FileType2 className="size-4 text-blue-600" /> {t("chat.exportDoc") || "Download as Word"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={exportTxt} className="gap-2 cursor-pointer">
                <FileText className="size-4 text-slate-600" /> {t("chat.exportTxt") || "Download as Text"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <button
            onClick={() => {
              setVoiceOn(v => !v);
              if (voiceOn && typeof window !== "undefined") window.speechSynthesis?.cancel();
            }}
            className={`size-10 rounded-full flex items-center justify-center transition-all ${voiceOn ? "btn-luxe-gold" : "bg-secondary hover:bg-gold/20 text-deep"}`}
            title={voiceOn ? t("chat.voiceOff") || "Mute voice" : t("chat.voiceOn") || "Enable voice"}
          >
            {voiceOn ? <Volume2 className="size-5" /> : <VolumeX className="size-5" />}
          </button>

        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6">
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.length === 0 && (
              <div className="text-center py-12 animate-fade-up">
                <div className="size-24 rounded-full overflow-hidden mx-auto ring-4 ring-gold/30 shadow-gold-glow animate-float">
                  <img src={coachAvatar} alt={coachName} className="size-full object-cover" />
                </div>
                <h3 className="font-bold text-2xl mt-5 mb-2 text-gold-gradient">{t("chat.empty.title")}</h3>
                <p className="text-muted-foreground">{t("chat.empty.sub")}</p>
                <div className="mt-8">
                  <p className="text-[11px] uppercase tracking-widest text-gold-foreground font-bold mb-3">{t("chat.starters.title")}</p>
                  <div className="grid sm:grid-cols-2 gap-2.5 max-w-2xl mx-auto">
                    {["chat.starter.1", "chat.starter.2", "chat.starter.3", "chat.starter.4"].map((k) => (
                      <button
                        key={k}
                        type="button"
                        onClick={() => sendQuickAction(t(k))}
                        className="group text-start px-4 py-3 rounded-2xl border border-gold/25 bg-card hover:bg-gold/5 hover:border-gold/50 hover:shadow-elegant transition-all text-sm text-foreground"
                      >
                        <Sparkles className="size-3.5 inline-block me-2 text-gold-foreground opacity-60 group-hover:opacity-100" />
                        {t(k)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {messages.map((m) => {
              const text = m.parts.filter(p => p.type === "text").map(p => (p as { text: string }).text).join("");
              const toolParts = m.parts.filter(p => typeof p.type === "string" && p.type.startsWith("tool-")) as Array<{ type: string; state?: string; output?: Record<string, unknown> }>;
              if (m.role === "user") {
                const isEditing = editingId === m.id;
                return (
                  <div key={m.id} className="flex justify-end animate-fade-up group">
                    <div className="flex flex-col items-end gap-1 max-w-[80%]">
                      {isEditing ? (
                        <div className="w-full bg-card border border-gold/40 rounded-2xl p-3 shadow-elegant space-y-2">
                          <Textarea value={editText} onChange={(e) => setEditText(e.target.value)} rows={3} className="resize-none border-gold/20 focus-visible:ring-gold" autoFocus />
                          <div className="flex justify-end gap-2">
                            <Button size="sm" variant="ghost" onClick={() => { setEditingId(null); setEditText(""); }}><X className="size-4 me-1" />{t("chat.cancel") || "Cancel"}</Button>
                            <Button size="sm" onClick={submitEdit} disabled={!editText.trim() || status === "submitted" || status === "streaming"} className="btn-luxe-gold"><Send className="size-4 me-1" />{t("chat.resend") || "Resend"}</Button>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-gradient-deep text-cream rounded-2xl rounded-se-md px-4 py-3 shadow-elegant whitespace-pre-wrap">{text}</div>
                      )}
                      {!isEditing && (
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => copyText(m.id, text)} title={t("chat.copy") || "Copy"} className="p-1.5 rounded-md text-muted-foreground hover:text-deep hover:bg-gold/10">
                            {copiedId === m.id ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5" />}
                          </button>
                          <button onClick={() => startEdit(m.id, text)} title={t("chat.edit") || "Edit & resend"} className="p-1.5 rounded-md text-muted-foreground hover:text-deep hover:bg-gold/10">
                            <Pencil className="size-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              }
              const fb = feedback[m.id];
              return (
                <div key={m.id} className="flex gap-3 animate-fade-up group">
                  <div className="shrink-0">
                    <CoachAvatar src={coachAvatar} name={coachName} size={36} online={false} speaking={speakingId === m.id} />
                  </div>
                  <div className="flex-1 min-w-0">
                    {(text || (status === "streaming" && m.id === messages[messages.length - 1]?.id)) && (() => {
                      const stageMatch = text.match(/\[\[STAGE:(Goal|Reality|Options|Actions)\]\]/i);
                      const learnMatch = text.match(/\[\[LEARN:([^\]]+)\]\]/i);
                      const stage = stageMatch?.[1];
                      const learn = learnMatch?.[1]?.trim();
                      const cleanText = text
                        .replace(/\[\[STAGE:(Goal|Reality|Options|Actions)\]\]\s*/gi, "")
                        .replace(/\[\[LEARN:[^\]]+\]\]\s*/gi, "")
                        .trim();
                      const stageStyles: Record<string, string> = {
                        goal:    "bg-violet-100 text-violet-800 border-violet-300",
                        reality: "bg-amber-100 text-amber-800 border-amber-300",
                        options: "bg-blue-100 text-blue-800 border-blue-300",
                        actions: "bg-emerald-100 text-emerald-800 border-emerald-300",
                      };
                      const stageKey = stage?.toLowerCase() ?? "";
                      return (
                        <>
                          {stage && (
                            <div className="mb-2">
                              <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${stageStyles[stageKey] ?? stageStyles.goal}`}>
                                {stage}
                              </span>
                            </div>
                          )}
                          <div className="prose prose-sm max-w-none prose-headings:font-semibold prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-li:text-foreground bg-card border border-border/60 rounded-2xl rounded-ss-md px-4 py-3 shadow-sm">
                            <StreamingMarkdown text={cleanText} isStreaming={status === "streaming" && m.id === messages[messages.length - 1]?.id} />
                          </div>
                          {learn && !(status === "streaming" && m.id === messages[messages.length - 1]?.id) && (
                            <Link
                              to="/lessons"
                              search={{ topic: learn }}
                              className="inline-flex items-center gap-1.5 mt-2 text-xs text-deep hover:text-gold-foreground bg-gold/10 hover:bg-gold/20 border border-gold/30 rounded-full px-3 py-1 transition-colors"
                            >
                              <GraduationCap className="size-3.5" />
                              <span>2-min lesson available: <span className="font-semibold">{learn}</span></span>
                            </Link>
                          )}
                        </>
                      );
                    })()}
                    {toolParts.map((tp, i) => {
                      const name = tp.type.replace(/^tool-/, "");
                      if (tp.state !== "output-available" || !tp.output) {
                        return (
                          <div key={i} className="my-2 rounded-xl border border-gold/30 bg-gold/5 px-3 py-2 text-xs text-deep flex items-center gap-2">
                            <span className="size-2 rounded-full bg-gold animate-pulse" />
                            <span className="font-semibold uppercase tracking-wider">{name.replace(/_/g, " ")}</span>
                            <span className="text-muted-foreground">running…</span>
                          </div>
                        );
                      }
                      return <ToolResultCard key={i} name={name} output={tp.output} />;
                    })}
                    {text && !(status === "streaming" && m.id === messages[messages.length - 1]?.id) && (
                      <div className="flex items-center gap-1 mt-2 opacity-60 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => copyText(m.id, text.replace(/\[\[(STAGE|LEARN):[^\]]+\]\]\s*/gi, "").trim())} title={t("chat.copy") || "Copy"} className="p-1.5 rounded-md text-muted-foreground hover:text-deep hover:bg-gold/10">
                          {copiedId === m.id ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5" />}
                        </button>
                        <button onClick={() => react(m.id, 1)} title={t("chat.helpful") || "Helpful"} className={`p-1.5 rounded-md hover:bg-gold/10 ${fb === 1 ? "text-emerald-600" : "text-muted-foreground hover:text-deep"}`}>
                          <ThumbsUp className="size-3.5" />
                        </button>
                        <button onClick={() => react(m.id, -1)} title={t("chat.notHelpful") || "Not helpful"} className={`p-1.5 rounded-md hover:bg-gold/10 ${fb === -1 ? "text-destructive" : "text-muted-foreground hover:text-deep"}`}>
                          <ThumbsDown className="size-3.5" />
                        </button>
                      </div>
                    )}
                    {commentFor === m.id && (
                      <div className="mt-2 rounded-xl border border-destructive/30 bg-destructive/5 p-3 space-y-2">
                        <p className="text-xs text-muted-foreground">{t("chat.feedbackPrompt") || "What was wrong? Your feedback trains better answers."}</p>
                        <Textarea value={commentText} onChange={(e) => setCommentText(e.target.value)} rows={2} placeholder={t("chat.feedbackPlaceholder") || "Optional: tell me what to improve…"} className="resize-none text-sm" />
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="ghost" onClick={() => setCommentFor(null)}>{t("chat.skip") || "Skip"}</Button>
                          <Button size="sm" onClick={submitComment} className="btn-luxe-gold">{t("chat.send") || "Send"}</Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            {(status === "submitted" || status === "streaming") && messages[messages.length - 1]?.role === "user" && (
              <div className="flex gap-3 animate-fade-up">
                <div className="size-9 rounded-full overflow-hidden ring-2 ring-gold/50 shrink-0">
                  <img src={coachAvatar} alt="" className="size-full object-cover" />
                </div>
                <div className="bg-card border rounded-2xl rounded-ss-md px-4 py-3 flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-gold animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="size-2 rounded-full bg-gold animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="size-2 rounded-full bg-gold animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}
            {chatError && (
              <div className="mx-auto max-w-xl rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive shadow-sm">
                {chatError === "Unauthorized" ? "Your coaching session expired. Please sign in again." : chatError}
              </div>
            )}
          </div>
        </div>
        {messages.length > 0 && (
          <div className="border-t bg-gradient-to-b from-card/80 to-card/40 backdrop-blur px-4 pt-3 pb-1">
            <div className="max-w-3xl mx-auto">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="size-3 text-gold-foreground" />
                <span className="text-[10px] uppercase tracking-widest font-bold text-gold-foreground">{t("chat.starters.title").split(" ").slice(0, 2).join(" ")}</span>
                <div className="flex-1 h-px bg-gradient-to-e from-gold/30 to-transparent" />
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  { key: "reflect",     icon: Brain,       tone: "from-violet-50 to-violet-100 text-violet-900 border-violet-200 hover:border-violet-400", iconTone: "text-violet-600", instr: "[Reflect emotion and go deeper on this point — mirror what you sense, name the underlying feeling, then ask one powerful open question.]" },
                  { key: "challenge",   icon: Shuffle,     tone: "from-rose-50 to-rose-100 text-rose-900 border-rose-200 hover:border-rose-400",          iconTone: "text-rose-600",   instr: "[Respectfully challenge the assumption beneath my last message. Name the assumption explicitly, offer a counterpoint, then invite me to test it.]" },
                  { key: "perspective", icon: Eye,         tone: "from-blue-50 to-blue-100 text-blue-900 border-blue-200 hover:border-blue-400",          iconTone: "text-blue-600",   instr: "[Offer a broader executive perspective — what would a wise board member or seasoned CEO see in this situation that I'm missing?]" },
                  { key: "capture",     icon: ListChecks,  tone: "from-emerald-50 to-emerald-100 text-emerald-900 border-emerald-200 hover:border-emerald-400", iconTone: "text-emerald-600", instr: "[Extract every concrete action item from this conversation as a clean checklist with owner and suggested due date.]" },
                  { key: "summarize",   icon: FileSummary, tone: "from-amber-50 to-amber-100 text-amber-900 border-amber-200 hover:border-amber-400",      iconTone: "text-amber-600",  instr: "[Summarize this session: situation, key insights, decisions made, and open questions — in under 120 words.]" },
                  { key: "reframe",     icon: Lightbulb,   tone: "from-gold/10 to-gold/20 text-deep border-gold/30 hover:border-gold/60",                  iconTone: "text-gold-foreground", instr: "[Offer a completely different frame for this situation — flip the problem on its head and show me an angle I would not have considered.]" },
                ].map((b) => {
                  const I = b.icon;
                  const label = t(`chat.qa.${b.key}`);
                  const desc = t(`chat.qa.${b.key}.desc`);
                  return (
                    <button
                      key={b.key}
                      type="button"
                      onClick={() => sendQuickAction(b.instr)}
                      disabled={status === "submitted" || status === "streaming"}
                      title={desc}
                      className={`group inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-full border bg-gradient-to-br ${b.tone} shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0`}
                    >
                      <I className={`size-3.5 ${b.iconTone}`} />
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
        <form onSubmit={submit} className="border-t p-4 bg-card/80 backdrop-blur">
          <div className="max-w-3xl mx-auto flex gap-2 items-center">
            <button
              type="button"
              onClick={toggleMic}
              className={`size-12 rounded-full flex items-center justify-center shrink-0 transition-all ${listening ? "btn-luxe-gold animate-pulse-gold" : "bg-secondary hover:bg-gold/20 text-deep"}`}
              title={listening ? "Stop" : "Speak"}
            >
              {listening ? <MicOff className="size-5" /> : <Mic className="size-5" />}
            </button>
            <Input ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} placeholder={listening ? (t("chat.listening") || "Listening…") : t("chat.placeholder")} className="rounded-full h-12 px-5 border-gold/30 focus-visible:ring-gold" />
            <Button type="submit" disabled={!input.trim() || status === "submitted" || status === "streaming"} className="rounded-full size-12 p-0 btn-luxe-gold">
              <Send className="size-5" />
            </Button>
          </div>
        </form>
      </div>
      <CoachInsightsPanel
        threadId={threadId}
        language={(lang as "en" | "fa" | "ar") ?? "en"}
        messageCount={(status === "ready" ? messages.length : Math.max(0, messages.length - 1))}
      />
    </div>
  );
}
