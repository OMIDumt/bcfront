import { createFileRoute } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth-context";
import { LangSwitcher } from "@/components/lang-switcher";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_app/settings")({
  head: () => ({ meta: [{ title: "Settings" }] }),
  component: Settings,
});

function Settings() {
  const { t } = useI18n();
  const { user, signOut } = useAuth();
  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">{t("settings.title")}</h1>
      <div className="bg-card border rounded-2xl p-6 space-y-6">
        <div>
          <p className="text-sm text-muted-foreground mb-1">Email</p>
          <p className="font-medium">{user?.email}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground mb-2">{t("settings.lang")}</p>
          <LangSwitcher variant="compact" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground mb-1">{t("settings.plan")}</p>
          <p className="font-medium capitalize">Free</p>
        </div>
        <Button onClick={() => signOut()} variant="destructive">{t("common.signout")}</Button>
      </div>
    </div>
  );
}
