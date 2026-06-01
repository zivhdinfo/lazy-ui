const DEFAULT_DURATION_MS = 5_000;
const DEFAULT_FPS = 60;
const VIDEO_BITS_PER_SECOND = 12_000_000;
const MAX_OUTPUT_PIXELS = 1920 * 1080;

type BrowserDisplayMediaOptions = DisplayMediaStreamOptions & {
  preferCurrentTab?: boolean;
  selfBrowserSurface?: "include" | "exclude";
  surfaceSwitching?: "include" | "exclude";
};

export type PreviewVideoExportOptions = {
  frame: HTMLElement;
  slug: string;
  durationMs?: number;
  fps?: number;
  signal?: AbortSignal;
  onProgress?: (progress: number) => void;
};

export function isPreviewVideoExportSupported() {
  return (
    typeof window !== "undefined" &&
    typeof navigator !== "undefined" &&
    typeof navigator.mediaDevices?.getDisplayMedia === "function" &&
    typeof MediaRecorder !== "undefined" &&
    typeof HTMLCanvasElement !== "undefined" &&
    typeof HTMLCanvasElement.prototype.captureStream === "function"
  );
}

export async function exportPreviewVideo({
  frame,
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

  const displayOptions: BrowserDisplayMediaOptions = {
    audio: false,
    video: {
      displaySurface: "browser",
      frameRate: fps,
    },
    preferCurrentTab: true,
    selfBrowserSurface: "include",
    surfaceSwitching: "exclude",
  };
  const displayStream =
    await navigator.mediaDevices.getDisplayMedia(displayOptions);

  let canvasStream: MediaStream | null = null;
  let recorder: MediaRecorder | null = null;
  let rafId: number | null = null;
  let timeoutId: number | null = null;
  let stoppedByAbort = false;

  const video = document.createElement("video");
  video.muted = true;
  video.playsInline = true;
  video.srcObject = displayStream;

  const abortRecording = () => {
    stoppedByAbort = true;
    if (recorder?.state === "recording") {
      recorder.stop();
    }
  };

  try {
    signal?.addEventListener("abort", abortRecording, { once: true });

    await startVideo(video, signal);

    const rect = frame.getBoundingClientRect();
    if (rect.width < 1 || rect.height < 1) {
      throw new Error("Preview frame is not visible.");
    }

    const { width, height } = outputSizeFor(rect);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) {
      throw new Error("Could not create video export canvas.");
    }

    const drawFrame = () => {
      const source = sourceRectFor(frame, video);
      ctx.drawImage(
        video,
        source.x,
        source.y,
        source.width,
        source.height,
        0,
        0,
        canvas.width,
        canvas.height,
      );
    };

    drawFrame();

    canvasStream = canvas.captureStream(fps);
    const mimeType = preferredMimeType();
    recorder = new MediaRecorder(canvasStream, {
      mimeType,
      videoBitsPerSecond: VIDEO_BITS_PER_SECOND,
    });

    const chunks: Blob[] = [];
    const stopped = new Promise<Blob>((resolve, reject) => {
      recorder?.addEventListener("dataavailable", (event) => {
        if (event.data.size > 0) chunks.push(event.data);
      });
      recorder?.addEventListener("error", () => {
        reject(new Error("Video recording failed."));
      });
      recorder?.addEventListener("stop", () => {
        resolve(new Blob(chunks, { type: mimeType || "video/webm" }));
      });
    });

    recorder.start(100);
    const startedAt = performance.now();
    onProgress?.(0);

    const render = (now: number) => {
      drawFrame();

      const elapsed = now - startedAt;
      onProgress?.(Math.min((elapsed / durationMs) * 100, 100));

      if (elapsed >= durationMs) {
        if (recorder?.state === "recording") recorder.stop();
        return;
      }

      rafId = requestAnimationFrame(render);
    };

    rafId = requestAnimationFrame(render);
    timeoutId = window.setTimeout(() => {
      if (recorder?.state === "recording") recorder.stop();
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
    video.pause();
    video.srcObject = null;
    canvasStream?.getTracks().forEach((track) => track.stop());
    displayStream.getTracks().forEach((track) => track.stop());
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

async function startVideo(video: HTMLVideoElement, signal?: AbortSignal) {
  await waitForMetadata(video, signal);
  throwIfAborted(signal);
  await video.play();
  await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
  throwIfAborted(signal);
}

function waitForMetadata(video: HTMLVideoElement, signal?: AbortSignal) {
  if (video.videoWidth > 0 && video.videoHeight > 0) {
    return Promise.resolve();
  }

  return new Promise<void>((resolve, reject) => {
    const cleanup = () => {
      video.removeEventListener("loadedmetadata", onLoaded);
      video.removeEventListener("error", onError);
      signal?.removeEventListener("abort", onAbort);
    };
    const onLoaded = () => {
      cleanup();
      resolve();
    };
    const onError = () => {
      cleanup();
      reject(new Error("Could not start screen capture preview."));
    };
    const onAbort = () => {
      cleanup();
      reject(abortError());
    };

    video.addEventListener("loadedmetadata", onLoaded, { once: true });
    video.addEventListener("error", onError, { once: true });
    signal?.addEventListener("abort", onAbort, { once: true });
  });
}

function outputSizeFor(rect: DOMRect) {
  const targetScale = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));
  const maxScale = Math.sqrt(MAX_OUTPUT_PIXELS / (rect.width * rect.height));
  const scale = Math.min(targetScale, maxScale);

  return {
    width: Math.max(1, Math.round(rect.width * scale)),
    height: Math.max(1, Math.round(rect.height * scale)),
  };
}

function sourceRectFor(frame: HTMLElement, video: HTMLVideoElement) {
  const rect = frame.getBoundingClientRect();
  const viewportWidth = Math.max(window.innerWidth, 1);
  const viewportHeight = Math.max(window.innerHeight, 1);
  const scaleX = video.videoWidth / viewportWidth;
  const scaleY = video.videoHeight / viewportHeight;

  const x = clamp(rect.left * scaleX, 0, video.videoWidth - 1);
  const y = clamp(rect.top * scaleY, 0, video.videoHeight - 1);
  const width = clamp(rect.width * scaleX, 1, video.videoWidth - x);
  const height = clamp(rect.height * scaleY, 1, video.videoHeight - y);

  return { x, y, width, height };
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

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function throwIfAborted(signal?: AbortSignal) {
  if (signal?.aborted) {
    throw abortError();
  }
}

function abortError() {
  return new DOMException("Video export was cancelled.", "AbortError");
}
