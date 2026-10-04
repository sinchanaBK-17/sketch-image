export type HistoryItem = { id: string; image: string; prompt: string; style: string; at: number };
const KEY = "sketch-ai-history";

export function loadHistory(): HistoryItem[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function addHistory(item: HistoryItem) {
  let list = [item, ...loadHistory()];
  // Trim oldest entries if browser storage fills up
  while (list.length) {
    try {
      localStorage.setItem(KEY, JSON.stringify(list));
      return;
    } catch {
      list = list.slice(0, -1);
    }
  }
}

export function clearHistory() {
  localStorage.removeItem(KEY);
}

/** Sketch cleanup (mirrors the OpenCV pipeline): grayscale, contrast threshold, white background. */
export function processSketch(src: HTMLCanvasElement): string {
  const max = 1024;
  const scale = Math.min(1, max / Math.max(src.width, src.height));
  const c = document.createElement("canvas");
  c.width = Math.round(src.width * scale);
  c.height = Math.round(src.height * scale);
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, c.width, c.height);
  ctx.drawImage(src, 0, 0, c.width, c.height);
  const img = ctx.getImageData(0, 0, c.width, c.height);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const g = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
    const v = g < 200 ? Math.max(0, g - 60) : 255;
    d[i] = d[i + 1] = d[i + 2] = v;
  }
  ctx.putImageData(img, 0, 0);
  return c.toDataURL("image/png");
}

/** If a Render (Python + OpenCV) backend URL is configured, use it. */
export const RENDER_API_URL = (import.meta.env.VITE_RENDER_API_URL as string | undefined)?.replace(/\/$/, "");
