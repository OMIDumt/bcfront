import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { BackButton } from "@/components/back-button";
import { AnimatedLogo } from "@/components/animated-logo";
import { LangSwitcher } from "@/components/lang-switcher";
import { useI18n } from "@/lib/i18n";
import { toast } from "sonner";
import {
  Send, Sparkles, Mic, MicOff, Volume2, VolumeX,
  Copy, Check, ThumbsUp, ThumbsDown, Pencil, Mail, Captions,
} from "lucide-react";
import { StreamingMarkdown } from "@/components/streaming-markdown";
import { CoachAvatar } from "@/components/coach-avatar";
import { useSmartAutoScroll } from "@/hooks/use-smart-auto-scroll";
import logo from "@/assets/morshed-logo.png";

export const Route = createFileRoute("/try")({
  head: () => ({
    meta: [
      { title: "Try Morshed Free — No Signup" },
      { name: "description", content: "Experience Morshed AI executive coaching free, no signup required." },
    ],
  }),
  component: TryPage,
});

interface SRConstructor { new (): SpeechRecognitionLike }
interface SpeechRecognitionLike {
  lang: string; continuous: boolean; interimResults: boolean;
  start(): void; stop(): void;
  onresult: ((e: { results: ArrayLike<{ 0: { transcript: string }; isFinal: boolean }> }) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
}
function getSR(): SRConstructor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: SRConstructor; webkitSpeechRecognition?: SRConstructor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

function TryPage() {
  const { t, lang } = useI18n();
  const [input, setInput] = useState("");
  const [listening, setListening] = useState(false);
  const [voiceOn, setVoiceOn] = useState(false);
  const [captionsOn, setCaptionsOn] = useState(false);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Record<string, 1 | -1>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const taRef = useRef<HTMLTextAreaElement>(null);
  const recRef = useRef<SpeechRecognitionLike | null>(null);
  const spokenRef = useRef<Set<string>>(new Set());

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: "/api/public/demo-chat", body: { language: lang } }),
  });
  const busy = status === "submitted" || status === "streaming";
  const scrollRef = useSmartAutoScroll<HTMLDivElement>([messages, status]);

  useEffect(() => { taRef.current?.focus(); }, [status]);

  // TTS for completed assistant messages
  useEffect(() => {
    if (!voiceOn || typeof window === "undefined" || !window.speechSynthesis) return;
    const last = messages[messages.length - 1];
    if (!last || last.role !== "assistant" || busy) return;
    if (spokenRef.current.has(last.id)) return;
    const text = last.parts.filter(p => p.type === "text").map(p => (p as { text: string }).text).join("").replace(/[#*_`>\-]/g, "");
    if (!text.trim()) return;
    spokenRef.current.add(last.id);
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang === "fa" ? "fa-IR" : lang === "ar" ? "ar-SA" : "en-US";
    u.onstart = () => setSpeakingId(last.id);
    u.onend = () => setSpeakingId((s) => (s === last.id ? null : s));
    u.onerror = () => setSpeakingId(null);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  }, [messages, busy, voiceOn, lang]);

  useEffect(() => () => {
    if (typeof window !== "undefined") window.speechSynthesis?.cancel();
    recRef.current?.stop();
  }, []);

  const send = (text: string) => {
    if (!text.trim() || busy) return;
    recRef.current?.stop();
    if (typeof window !== "undefined") window.speechSynthesis?.cancel();
    sendMessage({ text: text.trim() });
    setInput("");
  };

  const toggleMic = () => {
    const SR = getSR();
    if (!SR) { toast.error(t("chat.voiceUnsupported") || "Voice input not supported"); return; }
    if (listening) { recRef.current?.stop(); return; }
    const rec = new SR();
    rec.lang = lang === "fa" ? "fa-IR" : lang === "ar" ? "ar-SA" : "en-US";
    rec.continuous = false; rec.interimResults = true;
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

  const copyText = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId((c) => (c === id ? null : c)), 1500);
      toast.success(t("chat.copied") || "Copied");
    } catch { toast.error("Copy failed"); }
  };

  const react = (id: string, r: 1 | -1) => {
    setFeedback((s) => {
      const n = { ...s };
      if (n[id] === r) delete n[id]; else n[id] = r;
      return n;
    });
    if (r === 1) toast.success(t("chat.thanks") || "Thanks for the feedback");
    else toast.message(t("try.signupForLearning") || "Sign up free so your coach learns from this");
  };

  const startEdit = (id: string, text: string) => { setEditingId(id); setEditText(text); };
  const submitEdit = () => {
    if (!editingId || !editText.trim()) return;
    const text = editText.trim();
    setEditingId(null); setEditText("");
    send(text);
  };

  const starters = [
    t("try.s1") || "I'm struggling to align my leadership team on Q3 priorities.",
    t("try.s2") || "How do I have a tough performance conversation with a senior manager?",
    t("try.s3") || "Help me build a 90-day plan to grow revenue by 20%.",
    t("try.s4") || "I feel overwhelmed. How do I focus on what truly matters this week?",
  ];

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <header className="bg-deep border-b border-cream/10 sticky top-0 z-20">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-3">
          <BackButton to="/" />
          <div className="hidden sm:flex items-center gap-2 text-cream/90 text-sm">
            <Sparkles className="size-4 text-gold animate-pulse" />
            <span>{t("try.badge") || "Free demo — no signup"}</span>
          </div>
          <div className="flex items-center gap-2">
            <LangSwitcher />
            <Button asChild size="sm" variant="ghost" className="text-cream hover:bg-cream/10 rounded-full gap-1.5">
              <Link to="/login"><Mail className="size-4" /> {t("nav.signin") || "Sign in"}</Link>
            </Button>
            <Button asChild size="sm" className="bg-gold text-gold-foreground hover:bg-gold/90 rounded-full">
              <Link to="/signup">{t("nav.start") || "Get started"}</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-6 max-w-3xl w-full flex flex-col">
        {/* Coach header */}
        {messages.length > 0 && (
          <div className="flex items-center gap-3 mb-4 px-2 animate-fade-in">
            <CoachAvatar src={logo} name="Morshed" size={44} speaking={speakingId !== null} />
            <div className="flex-1">
              <div className="text-sm font-semibold text-deep">Morshed</div>
              <div className="text-xs text-muted-foreground">
                {speakingId ? (t("chat.speaking") || "Speaking…") : (t("chat.online") || "Online · AI Coach")}
              </div>
            </div>
            <button
              onClick={() => setCaptionsOn(v => !v)}
              className={`size-10 rounded-full flex items-center justify-center transition-all ${captionsOn ? "bg-gold text-gold-foreground shadow-gold-glow" : "bg-secondary hover:bg-gold/20 text-deep"}`}
              title={t("chat.captions") || "Live captions"}
            >
              <Captions className="size-5" />
            </button>
            <button
              onClick={() => { setVoiceOn(v => !v); if (voiceOn && typeof window !== "undefined") window.speechSynthesis?.cancel(); }}
              className={`size-10 rounded-full flex items-center justify-center transition-all ${voiceOn ? "bg-gold text-gold-foreground shadow-gold-glow" : "bg-secondary hover:bg-gold/20 text-deep"}`}
              title={voiceOn ? t("chat.voiceOff") || "Mute voice" : t("chat.voiceOn") || "Enable voice"}
            >
              {voiceOn ? <Volume2 className="size-5" /> : <VolumeX className="size-5" />}
            </button>
          </div>
        )}

        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
            <AnimatedLogo size={200} />
            <h1 className="text-3xl md:text-4xl font-bold text-deep mt-6 animate-fade-in">
              {t("try.title") || "Meet your AI Executive Coach"}
            </h1>
            <p className="text-muted-foreground mt-3 max-w-lg animate-fade-in">
              {t("try.subtitle") || "Ask anything — leadership, strategy, hard decisions, team dynamics. No signup, no credit card."}
            </p>
            <div className="grid sm:grid-cols-2 gap-3 mt-8 w-full max-w-2xl">
              {starters.map((s, i) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="text-start text-sm p-4 rounded-2xl border border-deep/10 bg-card hover:border-gold hover:bg-gold/5 hover:-translate-y-0.5 hover:shadow-elegant transition-all animate-fade-in"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div ref={scrollRef} className="flex-1 space-y-5 mb-4 overflow-y-auto pr-1">
            {messages.map((m, idx) => {
              const text = m.parts.map((p) => (p.type === "text" ? p.text : "")).join("");
              const isUser = m.role === "user";
              const isLast = idx === messages.length - 1;
              const isStreaming = !isUser && isLast && status === "streaming";
              return (
                <div key={m.id} className={`group flex ${isUser ? "justify-end" : "justify-start"} animate-fade-in`}>
                  <div className={`max-w-[88%] ${isUser ? "items-end" : "items-start"} flex flex-col gap-1.5`}>
                    {editingId === m.id ? (
                      <div className="w-full rounded-2xl border border-gold bg-card p-2 shadow-elegant">
                        <Textarea
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          rows={3}
                          className="border-0 focus-visible:ring-0 resize-none"
                        />
                        <div className="flex justify-end gap-2 mt-1">
                          <Button size="sm" variant="ghost" onClick={() => { setEditingId(null); setEditText(""); }}>
                            {t("common.cancel") || "Cancel"}
                          </Button>
                          <Button size="sm" onClick={submitEdit} className="bg-deep text-cream hover:bg-deep/90">
                            {t("chat.resend") || "Resend"}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div
                        className={`rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm transition-all ${
                          isUser
                            ? "bg-deep text-cream rounded-br-md"
                            : "bg-card border border-deep/10 text-deep rounded-bl-md"
                        }`}
                      >
                        {isUser ? (
                          <div className="whitespace-pre-wrap">{text}</div>
                        ) : (
                          <div className="prose prose-sm max-w-none prose-p:my-1.5 prose-headings:my-2 prose-strong:text-deep">
                            <StreamingMarkdown text={text} isStreaming={isStreaming} />
                          </div>
                        )}
                      </div>
                    )}

                    {/* Action bar */}
                    {editingId !== m.id && text && !isStreaming && (
                      <div className={`flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ${isUser ? "flex-row-reverse" : ""}`}>
                        <button onClick={() => copyText(m.id, text)} className="p-1.5 rounded-md hover:bg-deep/5 text-muted-foreground hover:text-deep" title={t("chat.copy") || "Copy"}>
                          {copiedId === m.id ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5" />}
                        </button>
                        {isUser ? (
                          <button onClick={() => startEdit(m.id, text)} className="p-1.5 rounded-md hover:bg-deep/5 text-muted-foreground hover:text-deep" title={t("chat.edit") || "Edit"}>
                            <Pencil className="size-3.5" />
                          </button>
                        ) : (
                          <>
                            <button onClick={() => react(m.id, 1)} className={`p-1.5 rounded-md hover:bg-deep/5 ${feedback[m.id] === 1 ? "text-emerald-600" : "text-muted-foreground hover:text-deep"}`} title="Helpful">
                              <ThumbsUp className="size-3.5" />
                            </button>
                            <button onClick={() => react(m.id, -1)} className={`p-1.5 rounded-md hover:bg-deep/5 ${feedback[m.id] === -1 ? "text-rose-600" : "text-muted-foreground hover:text-deep"}`} title="Not helpful">
                              <ThumbsDown className="size-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            {status === "submitted" && (
              <div className="flex justify-start animate-fade-in">
                <div className="bg-card border border-deep/10 rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-gold animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="size-2 rounded-full bg-gold animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="size-2 rounded-full bg-gold animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Live captions / transcription */}
        {captionsOn && (speakingId || listening) && (() => {
          const speakingMsg = speakingId ? messages.find(m => m.id === speakingId) : null;
          const captionText = listening
            ? (input || (t("chat.listening") || "Listening…"))
            : speakingMsg
              ? speakingMsg.parts.filter(p => p.type === "text").map(p => (p as { text: string }).text).join("").replace(/[#*_`>]/g, "")
              : "";
          if (!captionText) return null;
          return (
            <div className="sticky bottom-20 mx-auto max-w-2xl mb-2 rounded-2xl bg-deep/95 backdrop-blur text-cream px-4 py-3 shadow-elegant border border-gold/30 animate-fade-in">
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-gold/90 mb-1">
                {listening ? <Mic className="size-3 animate-pulse" /> : <Volume2 className="size-3" />}
                <span>{listening ? (t("chat.transcribing") || "Transcribing") : (t("chat.captions") || "Captions")}</span>
              </div>
              <p className="text-sm leading-relaxed line-clamp-3">{captionText}</p>
            </div>
          );
        })()}

        <form
          onSubmit={(e) => { e.preventDefault(); send(input); }}
          className="sticky bottom-4 flex items-end gap-2 bg-card border border-deep/10 rounded-3xl p-2 shadow-elegant"
        >
          <button
            type="button"
            onClick={toggleMic}
            className={`shrink-0 size-10 rounded-full flex items-center justify-center transition-all ${listening ? "bg-rose-500 text-white animate-pulse" : "bg-secondary hover:bg-gold/20 text-deep"}`}
            title={listening ? "Stop" : t("chat.voiceIn") || "Voice input"}
          >
            {listening ? <MicOff className="size-4" /> : <Mic className="size-4" />}
          </button>
          <Textarea
            ref={taRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); }
            }}
            placeholder={t("try.placeholder") || "Ask your coach…"}
            rows={1}
            className="flex-1 min-h-10 max-h-40 resize-none border-0 focus-visible:ring-0 bg-transparent py-2"
            disabled={busy}
          />
          <Button
            type="submit"
            disabled={busy || !input.trim()}
            className="shrink-0 size-10 p-0 rounded-full bg-deep text-cream hover:bg-deep/90 disabled:opacity-50"
          >
            <Send className="size-4" />
          </Button>
        </form>

        {messages.length >= 4 && (
          <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-gold/15 to-gold/5 border border-gold/30 text-center animate-fade-in">
            <p className="text-sm text-deep">
              {t("try.upsell") || "Loving this? Create a free account to unlock memory, OKRs and action plans."}
            </p>
            <div className="flex items-center justify-center gap-2 mt-3">
              <Button asChild size="sm" variant="outline" className="rounded-full gap-1.5">
                <Link to="/login"><Mail className="size-4" /> {t("nav.signin") || "Sign in"}</Link>
              </Button>
              <Button asChild size="sm" className="rounded-full bg-gold text-gold-foreground hover:bg-gold/90">
                <Link to="/signup">{t("nav.start") || "Get started free"}</Link>
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
