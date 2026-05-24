"use client";

import {
  useEffect,
  useState,
  type ComponentProps,
  type CSSProperties,
  type ReactNode,
} from "react";
import { ArrowUpRight, Star } from "lucide-react";

import { Counter, type CounterEffect } from "@/components/lazy-ui/counter";
import { cn } from "@/lib/utils";

export type GithubStarsVariant =
  | "default"
  | "star"
  | "ghost"
  | "solid"
  | "silver";

export type GithubStarsDisplayFormat = "full" | "compact" | "plus";

export type GithubStarsHoverMode = "none" | "label" | "full";

export interface GithubStarsButtonProps
  extends Omit<ComponentProps<"a">, "children" | "href"> {
  /** GitHub username or organization. */
  username: string;
  /** GitHub repository name. */
  repo: string;
  /** Button label. @default "GitHub" */
  label?: string;
  /** Controlled star value. Disables auto-fetch when provided. */
  value?: number;
  /** Fallback star value before the API request resolves. @default 0 */
  initialValue?: number;
  /** Fetch the repo star count automatically when `value` is not provided. */
  fetchStars?: boolean;
  /** Optional proxy endpoint. Receives `owner` and `repo` query params. */
  apiEndpoint?: string;
  /** Show the animated star count. @default true */
  showCount?: boolean;
  /** Counter animation effect. @default "3d" */
  counterEffect?: CounterEffect;
  /** Visual palette. @default "default" */
  variant?: GithubStarsVariant;
  /** Number format for the star count. @default "compact" */
  displayFormat?: GithubStarsDisplayFormat;
  /** Hover behavior. @default "none" */
  hoverMode?: GithubStarsHoverMode;
  /** Label shown on hover when `hoverMode="label"`. @default "Star this" */
  hoverLabel?: string;
  /** Inner text shown on hover when `hoverMode="full"`. @default "Star on GitHub" */
  hoverContent?: ReactNode;
  /**
   * Duration in ms of the hover content swap (`label` / `full` modes).
   * @default 300
   */
  hoverDuration?: number;
  /** Override the computed repository href. */
  href?: string;
}

type StarsResponse = {
  stars?: unknown;
  stargazers_count?: unknown;
};

const VARIANT_CLASSES: Record<GithubStarsVariant, string> = {
  default:
    "border-neutral-200 bg-white text-neutral-950 hover:border-neutral-300 hover:bg-neutral-50 " +
    "dark:border-white/10 dark:bg-white/[0.045] dark:text-white dark:hover:border-white/25 dark:hover:bg-white/[0.075]",
  star:
    "border-yellow-300/50 bg-yellow-50 text-yellow-900 hover:border-yellow-400/70 hover:bg-yellow-100 " +
    "dark:border-yellow-400/25 dark:bg-yellow-400/10 dark:text-yellow-50 dark:hover:border-yellow-400/50 dark:hover:bg-yellow-400/15",
  ghost:
    "border-transparent bg-transparent text-neutral-700 hover:border-neutral-200 hover:bg-neutral-50 " +
    "dark:border-white/[0.05] dark:bg-transparent dark:text-neutral-200 dark:hover:border-white/15 dark:hover:bg-white/[0.04]",
  solid:
    "border-neutral-900 bg-neutral-950 text-white hover:border-neutral-800 hover:bg-black " +
    "dark:border-white/15 dark:bg-black dark:hover:border-white/30 dark:hover:bg-neutral-950",
  silver:
    "border-white/30 bg-[linear-gradient(180deg,#fff,#d4d4d4,#8a8a8a)] text-black hover:border-white/55 hover:bg-[linear-gradient(180deg,#fff,#e5e5e5,#a3a3a3)]",
};

const SHIMMER_CLASSES: Record<GithubStarsVariant, string> = {
  default:
    "bg-[linear-gradient(110deg,transparent_0%,rgba(255,255,255,0.7)_48%,transparent_68%)] dark:bg-[linear-gradient(110deg,transparent_0%,rgba(255,255,255,0.18)_48%,transparent_68%)]",
  star:
    "bg-[linear-gradient(110deg,transparent_0%,rgba(255,255,255,0.7)_48%,transparent_68%)] dark:bg-[linear-gradient(110deg,transparent_0%,rgba(255,225,120,0.28)_48%,transparent_68%)]",
  ghost:
    "bg-[linear-gradient(110deg,transparent_0%,rgba(255,255,255,0.5)_48%,transparent_68%)] dark:bg-[linear-gradient(110deg,transparent_0%,rgba(255,255,255,0.12)_48%,transparent_68%)]",
  solid:
    "bg-[linear-gradient(110deg,transparent_0%,rgba(255,255,255,0.25)_48%,transparent_68%)]",
  silver:
    "bg-[linear-gradient(110deg,transparent_0%,rgba(255,255,255,0.85)_48%,transparent_68%)]",
};

const DIVIDER_CLASSES: Record<GithubStarsVariant, string> = {
  default:
    "bg-neutral-200 group-hover:bg-neutral-300 dark:bg-white/10 dark:group-hover:bg-white/20",
  star:
    "bg-yellow-300/50 group-hover:bg-yellow-400/70 dark:bg-yellow-400/20 dark:group-hover:bg-yellow-400/35",
  ghost:
    "bg-neutral-200 group-hover:bg-neutral-300 dark:bg-white/10 dark:group-hover:bg-white/20",
  solid: "bg-white/15 group-hover:bg-white/30",
  silver: "bg-black/15 group-hover:bg-black/30",
};

const COUNT_CLASSES: Record<GithubStarsVariant, string> = {
  default:
    "text-neutral-600 group-hover:text-neutral-900 dark:text-neutral-400 dark:group-hover:text-white",
  star:
    "text-yellow-700 group-hover:text-yellow-950 dark:text-yellow-100/70 dark:group-hover:text-yellow-50",
  ghost:
    "text-neutral-500 group-hover:text-neutral-800 dark:text-neutral-400 dark:group-hover:text-white",
  solid: "text-neutral-400 group-hover:text-white",
  silver: "text-neutral-700 group-hover:text-black",
};

const STAR_CLASSES: Record<GithubStarsVariant, string> = {
  default: "fill-yellow-400 text-yellow-400",
  star: "fill-yellow-400 text-yellow-400",
  ghost: "fill-yellow-400 text-yellow-400",
  solid: "fill-yellow-400 text-yellow-400",
  silver: "fill-yellow-500 text-yellow-500",
};

function formatStars(value: number, format: GithubStarsDisplayFormat) {
  const v = Math.max(0, Math.round(value));
  if (format === "full") return v.toLocaleString("en-US");
  if (format === "plus") return formatPlus(v);
  return formatCompact(v);
}

function formatCompact(v: number) {
  if (v < 1000) return String(v);
  return `${(v / 1000).toFixed(1).replace(/\.0$/, "")}k`;
}

function formatPlus(v: number) {
  if (v < 10) return String(v);
  // Round down keeping 2 leading significant digits, then append "+".
  const order = Math.pow(10, Math.floor(Math.log10(v)) - 1);
  return `${Math.floor(v / order) * order}+`;
}

function githubRepoHref(username: string, repo: string) {
  return `https://github.com/${username}/${repo}`;
}

function starsUrl(username: string, repo: string, apiEndpoint?: string) {
  if (!apiEndpoint) {
    return `https://api.github.com/repos/${encodeURIComponent(username)}/${encodeURIComponent(repo)}`;
  }

  const params = new URLSearchParams({ owner: username, repo });
  const separator = apiEndpoint.includes("?") ? "&" : "?";
  return `${apiEndpoint}${separator}${params.toString()}`;
}

function readStarCount(data: StarsResponse) {
  const value = data.stars ?? data.stargazers_count;
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

export function GithubStarsButton({
  username,
  repo,
  label = "GitHub",
  value,
  initialValue = 0,
  fetchStars,
  apiEndpoint,
  showCount = true,
  counterEffect = "3d",
  variant = "default",
  displayFormat = "compact",
  hoverMode = "none",
  hoverLabel = "Star this",
  hoverContent = "Star on GitHub",
  hoverDuration = 300,
  href,
  className,
  style,
  target = "_blank",
  rel,
  "aria-label": ariaLabel,
  ...props
}: GithubStarsButtonProps) {
  const shouldFetch = (fetchStars ?? value === undefined) && value === undefined;
  const [fetchedStars, setFetchedStars] = useState(initialValue);
  const [failed, setFailed] = useState(false);
  // Reset fetched state when the target repo changes (instead of doing it
  // inside the effect, which lints as a cascading-render bug). This is the
  // React-recommended pattern for resetting state on prop change.
  const repoKey = `${username}/${repo}`;
  const [prevRepoKey, setPrevRepoKey] = useState(repoKey);
  if (prevRepoKey !== repoKey) {
    setPrevRepoKey(repoKey);
    setFetchedStars(initialValue);
    setFailed(false);
  }
  const displayValue = value ?? (shouldFetch ? fetchedStars : initialValue);
  const repoHref = href ?? githubRepoHref(username, repo);

  useEffect(() => {
    if (!shouldFetch) return;

    const controller = new AbortController();
    let active = true;

    async function loadStars() {
      try {
        const response = await fetch(starsUrl(username, repo, apiEndpoint), {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("Unable to load GitHub stars");

        const data = (await response.json()) as StarsResponse;
        const next = readStarCount(data);
        if (active && next !== undefined) {
          setFetchedStars(next);
          setFailed(false);
        }
      } catch {
        if (active && !controller.signal.aborted) setFailed(true);
      }
    }

    void loadStars();

    return () => {
      active = false;
      controller.abort();
    };
  }, [apiEndpoint, repo, shouldFetch, username]);

  const formatFn = (n: number) => formatStars(n, displayFormat);

  const rootStyle: CSSProperties = {
    ["--hover-dur" as string]: `${Math.max(0, hoverDuration)}ms`,
    ...style,
  };

  return (
    <a
      href={repoHref}
      target={target}
      rel={target === "_blank" ? (rel ?? "noreferrer") : rel}
      aria-label={ariaLabel ?? `Open ${username}/${repo} on GitHub`}
      data-github-stars-button=""
      data-variant={variant}
      data-fetch-error={failed || undefined}
      style={rootStyle}
      className={cn(
        "group relative isolate inline-flex h-9 items-center justify-center gap-2 overflow-hidden rounded-md border px-3 text-sm font-medium",
        "transition-[background,border-color,color] duration-[420ms] ease-[cubic-bezier(0.16,1,0.3,1)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950/25 dark:focus-visible:ring-white/30",
        VARIANT_CLASSES[variant],
        className,
      )}
      {...props}
    >
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-0 -translate-x-full opacity-0 transition-[transform,opacity] duration-[700ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-full group-hover:opacity-100",
          SHIMMER_CLASSES[variant],
        )}
      />

      {/* Default content. In hoverMode='full' it fades out so the overlay can
          take over. Duration comes from --hover-dur (the `hoverDuration`
          prop) so the consumer can fine-tune feel. */}
      <span
        className={cn(
          "relative z-10 inline-flex transform-gpu items-center gap-2 transition-[opacity,transform] ease-out [will-change:opacity,transform] [transition-duration:var(--hover-dur)]",
          hoverMode === "full" &&
            "group-hover:-translate-y-1 group-hover:opacity-0",
        )}
      >
        <span className="inline-grid size-4 place-items-center">
          <GithubMark />
        </span>

        {hoverMode === "label" ? (
          <span className="relative inline-grid overflow-hidden">
            <span className="col-start-1 row-start-1 transform-gpu transition-[opacity,transform] ease-out [transition-duration:var(--hover-dur)] [will-change:opacity,transform] group-hover:-translate-y-2 group-hover:opacity-0">
              {label}
            </span>
            <span className="col-start-1 row-start-1 translate-y-2 transform-gpu opacity-0 transition-[opacity,transform] ease-out [transition-duration:var(--hover-dur)] [will-change:opacity,transform] group-hover:translate-y-0 group-hover:opacity-100">
              {hoverLabel}
            </span>
          </span>
        ) : (
          <span>{label}</span>
        )}

        {showCount && (
          <>
            <span
              className={cn(
                "gs-divider h-3.5 w-px transition-colors duration-300",
                DIVIDER_CLASSES[variant],
              )}
              aria-hidden="true"
            />
            <Counter
              value={displayValue}
              speed={900}
              easing="ease-out"
              effect={counterEffect}
              format={formatFn}
              className={cn(
                "min-w-10 justify-end font-mono text-[11px] transition-colors duration-300",
                COUNT_CLASSES[variant],
              )}
            />
          </>
        )}

        {/* Star + soft halo. The halo blooms behind on hover. */}
        <span className="relative inline-grid size-3.5 place-items-center">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-[-5px] scale-75 rounded-full bg-yellow-400/0 opacity-0 blur-md transition-[opacity,transform,background-color] duration-[550ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-110 group-hover:bg-yellow-400/40 group-hover:opacity-100"
          />
          <Star
            aria-hidden="true"
            className={cn(
              "relative size-3.5 transition-[transform,filter] duration-[650ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:rotate-[144deg] group-hover:scale-[1.3] group-hover:drop-shadow-[0_0_8px_rgba(250,204,21,0.8)]",
              STAR_CLASSES[variant],
            )}
            strokeWidth={1.8}
          />
        </span>
      </span>

      {/* Hover overlay — cross-fades with the default content above. */}
      {hoverMode === "full" && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-10 flex translate-y-1 transform-gpu items-center justify-center gap-1.5 px-3 opacity-0 transition-[opacity,transform] ease-out [transition-duration:var(--hover-dur)] [will-change:opacity,transform] group-hover:translate-y-0 group-hover:opacity-100"
        >
          <Star
            className={cn(
              "size-3.5 transition-transform",
              STAR_CLASSES[variant],
            )}
            strokeWidth={1.8}
          />
          <span className="whitespace-nowrap text-sm font-medium">
            {hoverContent}
          </span>
          <ArrowUpRight
            className="size-3.5 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            strokeWidth={2}
          />
        </span>
      )}

      {/* Sparkle particles — staggered pop around the star on hover. */}
      <span
        className="pointer-events-none absolute inset-0 z-0"
        aria-hidden="true"
      >
        <span className="absolute right-8 top-1.5 size-1 rounded-full bg-yellow-400 opacity-0 transition-[opacity,transform] duration-[550ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-2 group-hover:translate-x-0.5 group-hover:opacity-100" />
        <span className="absolute right-5 top-6 size-0.5 rounded-full bg-yellow-300 opacity-0 transition-[opacity,transform] delay-[80ms] duration-[550ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-2.5 group-hover:opacity-100" />
        <span className="absolute right-2.5 top-2 size-0.5 rounded-full bg-yellow-200 opacity-0 transition-[opacity,transform] delay-[160ms] duration-[550ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-1.5 group-hover:translate-x-1 group-hover:opacity-100" />
      </span>
    </a>
  );
}

function GithubMark() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className="size-full"
    >
      <path d="M12 2C6.48 2 2 6.58 2 12.25c0 4.51 2.87 8.34 6.84 9.69.5.1.68-.22.68-.5v-1.73c-2.78.62-3.37-1.38-3.37-1.38-.45-1.18-1.1-1.5-1.1-1.5-.91-.63.06-.62.06-.62 1 .07 1.53 1.06 1.53 1.06.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.36-2.22-.26-4.55-1.14-4.55-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.28 2.75 1.05A9.3 9.3 0 0 1 12 6.94c.85 0 1.7.12 2.5.34 1.9-1.33 2.74-1.05 2.74-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.94-2.34 4.8-4.57 5.06.36.32.68.94.68 1.9v2.82c0 .28.18.6.69.5A10.15 10.15 0 0 0 22 12.25C22 6.58 17.52 2 12 2Z" />
    </svg>
  );
}

GithubStarsButton.displayName = "GithubStarsButton";
