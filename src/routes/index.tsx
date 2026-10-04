import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { Download, Eraser, ImageUp, Loader2, Paintbrush, RefreshCw, Trash2, Wand2, AlertCircle } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { generateFromSketch } from "@/lib/generate.functions";
import { addHistory, processSketch, RENDER_API_URL } from "@/lib/history";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sketch → AI Image Studio" },
      { name: "description", content: "Draw or upload a sketch, pick a style, and turn it into an AI-generated image." },
      { property: "og:title", content: "Sketch → AI Image Studio" },
      { property: "og:description", content: "Turn rough sketches into realistic, cartoon, watercolor or anime art." },
    ],
  }),
  component: Studio,
});

const STYLES = [
  { id: "realistic", label: "Realistic" },
  { id: "cartoon", label: "Cartoon" },
  { id: "watercolor", label: "Watercolor" },
  { id: "anime", label: "Anime" },
] as const;
type Style = (typeof STYLES)[number]["id"];

function Studio() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const [tool, setTool] = useState<"pen" | "eraser">("pen");
  const [size, setSize] = useState(6);
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState<Style>("realistic");
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasInput, setHasInput] = useState(false);
  const generate = useServerFn(generateFromSketch);

  const fillWhite = () => {
    const c = canvasRef.current!;
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, c.width, c.height);
  };
  useEffect(fillWhite, []);

  const pos = (e: React.PointerEvent) => {
    const c = canvasRef.current!;
    const r = c.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * c.width, y: ((e.clientY - r.top) / r.height) * c.height };
  };
  const down = (e: React.PointerEvent) => {
    drawing.current = true;
    (e.target as Element).setPointerCapture(e.pointerId);
    const ctx = canvasRef.current!.getContext("2d")!;
    const p = pos(e);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    move(e);
  };
  const move = (e: React.PointerEvent) => {
    if (!drawing.current) return;
    const ctx = canvasRef.current!.getContext("2d")!;
    const p = pos(e);
    ctx.lineCap = ctx.lineJoin = "round";
    ctx.strokeStyle = tool === "pen" ? "#111" : "#fff";
    ctx.lineWidth = tool === "pen" ? size : size * 4;
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    setHasInput(true);
  };

  const upload = (f?: File) => {
    if (!f) return;
    const img = new Image();
    img.onload = () => {
      fillWhite();
      const c = canvasRef.current!;
      const s = Math.min(c.width / img.width, c.height / img.height);
      const w = img.width * s, h = img.height * s;
      c.getContext("2d")!.drawImage(img, (c.width - w) / 2, (c.height - h) / 2, w, h);
      setHasInput(true);
      URL.revokeObjectURL(img.src);
    };
    img.src = URL.createObjectURL(f);
  };

  const clear = () => {
    fillWhite();
    setHasInput(false);
    setResult(null);
    setError(null);
    setPrompt("");
  };

  const run = async () => {
    if (!hasInput) return setError("Draw something or upload an image first.");
    setLoading(true);
    setError(null);
    try {
      const image = processSketch(canvasRef.current!);
      let out: string;
      if (RENDER_API_URL) {
        const r = await fetch(`${RENDER_API_URL}/api/generate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image, prompt, style }),
        });
        const j = await r.json().catch(() => ({}));
        if (!r.ok || !j.image) throw new Error(j.error || `Server error (${r.status})`);
        out = j.image;
      } else {
        out = (await generate({ data: { image, prompt, style } })).image;
      }
      setResult(out);
      addHistory({ id: crypto.randomUUID(), image: out, prompt, style, at: Date.now() });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-hero">
      <AppHeader />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">
          Sketch it. <span className="text-gradient">Make it real.</span>
        </h1>
        <p className="mt-2 text-muted-foreground">Draw or upload a sketch, choose a style, and generate — as many times as you like.</p>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <section className="panel">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <button className={tool === "pen" ? "chip chip-on" : "chip"} onClick={() => setTool("pen")}><Paintbrush className="h-4 w-4" />Pen</button>
              <button className={tool === "eraser" ? "chip chip-on" : "chip"} onClick={() => setTool("eraser")}><Eraser className="h-4 w-4" />Eraser</button>
              <input type="range" min={2} max={20} value={size} onChange={(e) => setSize(+e.target.value)} className="w-24 accent-primary" aria-label="Brush size" />
              <label className="chip ml-auto cursor-pointer"><ImageUp className="h-4 w-4" />Upload
                <input type="file" accept="image/*" hidden onChange={(e) => upload(e.target.files?.[0])} />
              </label>
            </div>
            <canvas
              ref={canvasRef}
              width={768}
              height={768}
              className="aspect-square w-full cursor-crosshair touch-none rounded-xl bg-canvas shadow-inner"
              onPointerDown={down}
              onPointerMove={move}
              onPointerUp={() => (drawing.current = false)}
              onPointerLeave={() => (drawing.current = false)}
            />
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Optional: describe it — e.g. a cozy cabin by a lake at sunset"
              rows={2}
              className="mt-4 w-full resize-none rounded-xl border border-input bg-input/30 p-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
            <div className="mt-3 grid grid-cols-4 gap-2">
              {STYLES.map((s) => (
                <button key={s.id} onClick={() => setStyle(s.id)} className={style === s.id ? "chip chip-on justify-center" : "chip justify-center"}>{s.label}</button>
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              <button className="btn-ghost" onClick={clear} disabled={loading}><Trash2 className="h-4 w-4" />Clear</button>
              <button className="btn-primary flex-1" onClick={run} disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                {loading ? "Generating…" : "Generate"}
              </button>
            </div>
          </section>

          <section className="panel flex flex-col">
            <h2 className="mb-3 font-display text-lg font-semibold">Preview</h2>
            <div className="relative grid aspect-square w-full place-items-center overflow-hidden rounded-xl border border-dashed border-border bg-muted/40">
              {result && <img src={result} alt="Generated" className={`h-full w-full object-contain ${loading ? "opacity-40" : ""}`} />}
              {loading && (
                <div className="absolute inset-0 grid place-items-center">
                  <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-8 w-8 animate-spin text-primary" />Processing sketch & painting…</div>
                </div>
              )}
              {!result && !loading && <p className="px-6 text-center text-sm text-muted-foreground">Your AI image will appear here.</p>}
            </div>
            {error && (
              <div className="mt-3 flex items-start gap-2 rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{error}</div>
            )}
            <div className="mt-4 flex gap-2">
              <button className="btn-ghost flex-1" onClick={run} disabled={loading || !result}><RefreshCw className="h-4 w-4" />Regenerate</button>
              <a className={`btn-primary flex-1 ${!result ? "pointer-events-none opacity-50" : ""}`} href={result ?? "#"} download={`sketch-ai-${style}.png`}><Download className="h-4 w-4" />Download</a>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
