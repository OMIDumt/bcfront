import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/logo";
import { LangSwitcher } from "@/components/lang-switcher";
import { BackButton } from "@/components/back-button";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Sign Up — Morshed" }] }),
  component: SignUpPage,
});

function SignUpPage() {
  const { t } = useI18n();
  const { user } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (user) nav({ to: "/onboarding" }); }, [user, nav]);

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { emailRedirectTo: `${window.location.origin}/onboarding` },
    });
    setLoading(false);
    if (error) toast.error(error.message);
    else {
      toast.success("Account created! Check your email to confirm.");
      nav({ to: "/onboarding" });
    }
  };

  const handleGoogle = async () => {
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/onboarding" });
    if (r.error) toast.error("Google sign-up failed");
  };

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <header className="bg-deep py-4">
        <div className="container mx-auto px-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <BackButton to="/" />
            <Link to="/" className="text-cream"><Logo textClass="text-cream" /></Link>
          </div>
          <LangSwitcher />
        </div>
      </header>
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-card rounded-3xl p-8 shadow-elegant border">
          <h1 className="text-2xl font-bold text-center">{t("auth.signup.title")}</h1>
          <p className="text-muted-foreground text-center text-sm mt-2 mb-6">{t("auth.signup.sub")}</p>

          <Button onClick={handleGoogle} variant="outline" className="w-full mb-4 rounded-full h-11">
            <svg className="size-4 me-2" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.83z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"/></svg>
            {t("auth.google")}
          </Button>

          <div className="flex items-center gap-3 my-4 text-xs text-muted-foreground">
            <div className="flex-1 h-px bg-border" />{t("auth.or")}<div className="flex-1 h-px bg-border" />
          </div>

          <form onSubmit={handle} className="space-y-4">
            <div><Label>{t("auth.email")}</Label><Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1" /></div>
            <div><Label>{t("auth.password")}</Label><Input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1" /></div>
            <Button type="submit" disabled={loading} className="w-full bg-deep text-cream hover:bg-deep/90 rounded-full h-11">
              {loading ? t("common.loading") : t("auth.signup.btn")}
            </Button>
          </form>
          <p className="text-center text-sm mt-6 text-muted-foreground">
            {t("auth.have")} <Link to="/login" className="text-primary font-semibold">{t("auth.signin.btn")}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
