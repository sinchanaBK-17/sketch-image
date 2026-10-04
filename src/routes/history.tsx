import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Download, Trash2 } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { clearHistory, loadHistory, type HistoryItem } from "@/lib/history";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "History — Sketch → AI" },
      { name: "description", content: "Browse and download your past AI images generated from sketches." },
      { property: "og:title", content: "History — Sketch → AI" },
      { property: "og:description", content: "Your past sketch-to-image generations." },
    ],
  }),
  component: HistoryPage,
});

function HistoryPage() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  useEffect(() => setItems(loadHistory()), []);
  return (
    <div className="min-h-screen bg-hero">
      <AppHeader />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-3xl font-bold">History</h1>
          {items.length > 0 && (
            <button className="btn-ghost" onClick={() => { clearHistory(); setItems([]); }}><Trash2 className="h-4 w-4" />Clear all</button>
          )}
        </div>
        {items.length === 0 ? (
          <p className="mt-10 text-muted-foreground">No images yet. <Link to="/" className="text-primary underline">Create your first one</Link>.</p>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((it) => (
              <figure key={it.id} className="panel p-3">
                <img src={it.image} alt={it.prompt || it.style} className="aspect-square w-full rounded-lg object-cover" />
                <figcaption className="mt-2 flex items-center justify-between gap-2 text-sm">
                  <span className="truncate"><span className="chip chip-on mr-2 py-0.5 capitalize">{it.style}</span>{it.prompt || "No prompt"}</span>
                  <a href={it.image} download={`sketch-ai-${it.id}.png`} aria-label="Download" className="text-primary"><Download className="h-4 w-4" /></a>
                </figcaption>
              </figure>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
