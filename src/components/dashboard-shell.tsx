import { Link, useRouterState } from "@tanstack/react-router";
import { Logo } from "@/components/logo";
import { LangSwitcher } from "@/components/lang-switcher";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Trophy, MessageCircle, Target, BookOpen, Database, FileText, BarChart3, Settings as SettingsIcon, Crown, AlertCircle, LogOut, Sparkles, ListChecks, Brain, Shield, CalendarCheck, Users } from "lucide-react";
import type { ReactNode } from "react";

export function DashboardShell({ children }: { children: ReactNode }) {
  const { t } = useI18n();
  const { signOut } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const groups: Array<{ label: string; items: Array<{ to: string; label: string; Icon: typeof Trophy }> }> = [
    {
      label: "Executive OS",
      items: [
        { to: "/dashboard", label: t("sidebar.os"), Icon: Trophy },
        { to: "/coaches", label: "AI Coaches", Icon: Sparkles },
        { to: "/chat", label: t("sidebar.chat"), Icon: MessageCircle },
      ],
    },
    {
      label: "Coaching Engine",
      items: [
        { to: "/challenges", label: "Challenges", Icon: AlertCircle },
        { to: "/action-plans", label: "Action Plans", Icon: ListChecks },
        { to: "/okrs", label: "OKRs", Icon: Target },
        { to: "/decisions", label: "Decisions", Icon: Brain },
        { to: "/risks", label: "Risks", Icon: Shield },
        { to: "/reviews", label: "Weekly Reviews", Icon: CalendarCheck },
        { to: "/board", label: "AI Board", Icon: Users },
      ],
    },
    {
      label: "Knowledge",
      items: [
        { to: "/assessment", label: t("sidebar.assessment"), Icon: BarChart3 },
        { to: "/lessons", label: t("sidebar.lessons"), Icon: BookOpen },
        { to: "/experience", label: t("sidebar.experience"), Icon: Database },
        { to: "/notes", label: t("sidebar.notes"), Icon: FileText },
        { to: "/kpi", label: t("sidebar.kpi"), Icon: Target },
        { to: "/settings", label: t("sidebar.settings"), Icon: SettingsIcon },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-cream flex">
      <aside className="w-64 bg-sidebar text-sidebar-foreground flex flex-col shrink-0 sticky top-0 h-screen">
        <div className="p-5 border-b border-sidebar-border flex items-center justify-between">
          <Logo textClass="text-sidebar-foreground" />
        </div>
        <div className="px-5 py-3 border-b border-sidebar-border">
          <LangSwitcher />
        </div>
        <nav className="flex-1 overflow-y-auto p-3 space-y-4">
          {groups.map((g) => (
            <div key={g.label}>
              <div className="px-3 mb-1 text-[10px] uppercase tracking-widest text-sidebar-foreground/40 font-bold">{g.label}</div>
              <div className="space-y-1">
                {g.items.map((it) => {
                  const active = pathname === it.to || (it.to !== "/dashboard" && pathname.startsWith(it.to));
                  return (
                    <Link key={it.to} to={it.to} className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-colors ${
                      active
                        ? "bg-gold text-gold-foreground font-semibold shadow-gold-glow"
                        : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                    }`}>
                      <it.Icon className="size-4 shrink-0" />
                      <span>{it.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
        <div className="p-3 space-y-2 border-t border-sidebar-border">
          <Button className="w-full bg-gold text-gold-foreground hover:bg-gold/90 justify-start gap-2">
            <Crown className="size-4" />{t("sidebar.upgrade")}
          </Button>
          <Button variant="destructive" className="w-full justify-start gap-2">
            <AlertCircle className="size-4" />{t("sidebar.sos")}
          </Button>
          <Button onClick={() => signOut()} variant="ghost" className="w-full justify-start gap-2 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent">
            <LogOut className="size-4" />{t("common.signout")}
          </Button>
        </div>
      </aside>
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}
