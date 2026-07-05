import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/_app/experience")({
  head: () => ({ meta: [{ title: "Experience Bank" }] }),
  component: ExpPage,
});

function ExpPage() {
  const { t } = useI18n();
  const { user } = useAuth();
  const qc = useQueryClient();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const { data } = useQuery({
    queryKey: ["experiences"],
    queryFn: async () => (await supabase.from("experiences").select("*").order("created_at", { ascending: false })).data ?? [],
  });

  const add = useMutation({
    mutationFn: async () => {
      if (!user) return;
      await supabase.from("experiences").insert({ user_id: user.id, title, body });
    },
    onSuccess: () => { setTitle(""); setBody(""); qc.invalidateQueries({ queryKey: ["experiences"] }); },
  });

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">{t("exp.title")}</h1>
      <div className="bg-card border rounded-2xl p-5 mb-6 space-y-3">
        <Input placeholder={t("exp.titlePh")} value={title} onChange={(e) => setTitle(e.target.value)} />
        <Textarea placeholder={t("exp.bodyPh")} value={body} onChange={(e) => setBody(e.target.value)} rows={4} />
        <Button disabled={!title.trim() || add.isPending} onClick={() => add.mutate()} className="bg-deep text-cream hover:bg-deep/90 rounded-full">{t("exp.add")}</Button>
      </div>
      <div className="space-y-3">
        {data?.map((e) => (
          <div key={e.id} className="bg-card border rounded-xl p-4">
            <h3 className="font-semibold">{e.title}</h3>
            <p className="text-sm text-foreground/80 whitespace-pre-wrap mt-1">{e.body}</p>
            <p className="text-xs text-muted-foreground mt-2">{new Date(e.created_at).toLocaleDateString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
