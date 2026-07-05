import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listThreads, createThread } from "@/lib/chat.functions";

export const Route = createFileRoute("/_app/chat/")({
  component: ChatIndex,
});

function ChatIndex() {
  const nav = useNavigate();
  const list = useServerFn(listThreads);
  const create = useServerFn(createThread);
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["threads"], queryFn: () => list() });

  const m = useMutation({
    mutationFn: async () => create({ data: {} }),
    onSuccess: (t) => { qc.invalidateQueries({ queryKey: ["threads"] }); nav({ to: "/chat/$threadId", params: { threadId: t.id } }); },
  });

  useEffect(() => {
    if (isLoading) return;
    if (data && data.length > 0) nav({ to: "/chat/$threadId", params: { threadId: data[0].id }, replace: true });
    else m.mutate();
  }, [data, isLoading]);

  return <div className="p-8 text-muted-foreground">Loading conversation…</div>;
}
