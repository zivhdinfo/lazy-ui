const DEFAULT_DURATION_MS = 5_000;
const DEFAULT_FPS = 60;
const VIDEO_BITS_PER_SECOND = 12_000_000;

type CanvasWithCapture = HTMLCanvasElement & {
  captureStream?: (frameRate?: number) => MediaStream;
};

export type PreviewVideoExportOptions = {
  canvas: HTMLCanvasElement;
  slug: string;
  durationMs?: number;
  fps?: number;
  signal?: AbortSignal;
  onProgress?: (progress: number) => void;
};

export function isPreviewVideoExportSupported() {
  return (
    typeof window !== "undefined" &&
    typeof MediaRecorder !== "undefined" &&
    typeof HTMLCanvasElement !== "undefined" &&
    typeof (HTMLCanvasElement.prototype as CanvasWithCapture).captureStream ===
      "function"
  );
}

export async function exportPreviewVideo({
  canvas,
  slug,
  durationMs = DEFAULT_DURATION_MS,
  fps = DEFAULT_FPS,
  signal,
  onProgress,
}: PreviewVideoExportOptions) {
  if (!isPreviewVideoExportSupported()) {
    throw new Error("Video export is not supported in this browser.");
  }
  throwIfAborted(signal);

  const capture = (canvas as CanvasWithCapture).captureStream;
  if (typeof capture !== "function") {
    throw new Error("This preview cannot be recorded.");
  }
  const stream = capture.call(canvas, fps);

  const mimeType = preferredMimeType();
  const recorder = new MediaRecorder(stream, {
    mimeType: mimeType || undefined,
    videoBitsPerSecond: VIDEO_BITS_PER_SECOND,
  });

  const chunks: Blob[] = [];
  let rafId: number | null = null;
  let timeoutId: number | null = null;
  let stoppedByAbort = false;

  const abortRecording = () => {
    stoppedByAbort = true;
    if (recorder.state === "recording") recorder.stop();
  };

  const stopped = new Promise<Blob>((resolve, reject) => {
    recorder.addEventListener("dataavailable", (event) => {
      if (event.data.size > 0) chunks.push(event.data);
    });
    recorder.addEventListener("error", () => {
      reject(new Error("Video recording failed."));
    });
    recorder.addEventListener("stop", () => {
      resolve(new Blob(chunks, { type: mimeType || "video/webm" }));
    });
  });

  try {
    signal?.addEventListener("abort", abortRecording, { once: true });

    recorder.start(100);
    const startedAt = performance.now();
    onProgress?.(0);

    const render = (now: number) => {
      const elapsed = now - startedAt;
      onProgress?.(Math.min((elapsed / durationMs) * 100, 100));
      if (elapsed >= durationMs) {
        if (recorder.state === "recording") recorder.stop();
        return;
      }
      rafId = requestAnimationFrame(render);
    };

    rafId = requestAnimationFrame(render);
    timeoutId = window.setTimeout(() => {
      if (recorder.state === "recording") recorder.stop();
    }, durationMs + 250);

    const blob = await stopped;
    throwIfAborted(signal);

    if (!stoppedByAbort && blob.size > 0) {
      onProgress?.(100);
      downloadBlob(blob, `${safeFilePart(slug)}-preview-${Date.now()}.webm`);
    }
  } finally {
    signal?.removeEventListener("abort", abortRecording);
    if (rafId !== null) cancelAnimationFrame(rafId);
    if (timeoutId !== null) window.clearTimeout(timeoutId);
    stream.getTracks().forEach((track) => track.stop());
  }
}

function preferredMimeType() {
  const candidates = [
    "video/webm;codecs=vp9",
    "video/webm;codecs=vp8",
    "video/webm",
  ];
  return candidates.find((type) => MediaRecorder.isTypeSupported(type)) ?? "";
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function safeFilePart(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9-]+/g, "-") || "preview";
}

function throwIfAborted(signal?: AbortSignal) {
  if (signal?.aborted) {
    throw new DOMException("Video export was cancelled.", "AbortError");
  }
}
