import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/_app/notes")({
  head: () => ({ meta: [{ title: "Personal Notes" }] }),
  component: NotesPage,
});

function NotesPage() {
  const { t } = useI18n();
  const { user } = useAuth();
  const qc = useQueryClient();
  const [text, setText] = useState("");

  const { data } = useQuery({
    queryKey: ["notes"],
    queryFn: async () => (await supabase.from("notes").select("*").order("created_at", { ascending: false })).data ?? [],
  });

  const add = useMutation({
    mutationFn: async () => {
      if (!user) return;
      await supabase.from("notes").insert({ user_id: user.id, content: text });
    },
    onSuccess: () => { setText(""); qc.invalidateQueries({ queryKey: ["notes"] }); },
  });

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">{t("notes.title")}</h1>
      <div className="bg-card border rounded-2xl p-5 mb-6">
        <Textarea value={text} onChange={(e) => setText(e.target.value)} placeholder={t("notes.placeholder")} rows={3} className="mb-3" />
        <Button disabled={!text.trim() || add.isPending} onClick={() => add.mutate()} className="bg-deep text-cream hover:bg-deep/90 rounded-full">{t("notes.add")}</Button>
      </div>
      <div className="space-y-3">
        {data?.map((n) => (
          <div key={n.id} className="bg-card border rounded-xl p-4">
            <p className="whitespace-pre-wrap">{n.content}</p>
            <p className="text-xs text-muted-foreground mt-2">{new Date(n.created_at).toLocaleString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
