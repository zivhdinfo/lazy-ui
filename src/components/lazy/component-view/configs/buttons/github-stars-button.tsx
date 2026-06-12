"use client";

import { useCallback, useEffect, useState } from "react";

import type { CounterEffect } from "@/components/lazy-ui/counter";
import {
  GithubStarsButton,
  type GithubStarsDisplayFormat,
  type GithubStarsHoverMode,
  type GithubStarsVariant,
} from "@/components/lazy-ui/github-stars-button";
import { select, slider, toggle } from "@/components/lazy/component-detail/controls";
import type { CustomizeValues } from "@/components/lazy/customize";
import type { ComponentView } from "@/components/lazy/component-view/types";
import { cn } from "@/lib/utils";

const STATIC_FALLBACK = 12_848;
const NAME_RE = /^[a-zA-Z0-9_.-]+$/;

const PRESETS: Array<{ owner: string; repo: string }> = [
  { owner: "shadcn-ui", repo: "ui" },
  { owner: "vercel", repo: "next.js" },
  { owner: "facebook", repo: "react" },
  { owner: "tailwindlabs", repo: "tailwindcss" },
  { owner: "anthropics", repo: "claude-code" },
];

export const view: ComponentView = {
  load: () => import("@/components/lazy-ui/github-stars-button"),
  export: "GithubStarsButton",
  stageMinHeight: 360,
  render: (v) => {
    const username = (v.username as string | undefined) ?? "shadcn-ui";
    const repo = (v.repo as string | undefined) ?? "ui";
    const showCount = (v.showCount ?? true) as boolean;
    const fetchStars = (v.fetchStars ?? true) as boolean;
    const counterEffect = (v.counterEffect ?? "3d") as CounterEffect;
    const variant = (v.variant ?? "default") as GithubStarsVariant;
    const displayFormat = (v.displayFormat ?? "compact") as GithubStarsDisplayFormat;
    const hoverMode = (v.hoverMode ?? "none") as GithubStarsHoverMode;
    const hoverDuration = (v.hoverDuration ?? 300) as number;

    // Remount on these so the counter animates from 0 instead of jumping.
    const replayKey = `${username}/${repo}|${counterEffect}|${fetchStars}|${variant}|${hoverMode}`;

    return (
      <div className="flex min-h-72 items-center justify-center">
        <GithubStarsButton
          key={replayKey}
          username={username}
          repo={repo}
          label="GitHub"
          initialValue={0}
          {...(fetchStars
            ? { fetchStars: true, apiEndpoint: "/api/github-stars" }
            : { value: STATIC_FALLBACK })}
          showCount={showCount}
          counterEffect={counterEffect}
          variant={variant}
          displayFormat={displayFormat}
          hoverMode={hoverMode}
          hoverLabel="Star this"
          hoverContent="Star on GitHub"
          hoverDuration={hoverDuration}
        />
      </div>
    );
  },
  controls: [
    select(
      "variant",
      "Variant",
      [
        { value: "default", label: "Default" },
        { value: "star", label: "Star" },
        { value: "ghost", label: "Ghost" },
        { value: "solid", label: "Solid" },
        { value: "silver", label: "Silver" },
      ],
      "default",
    ),
    select(
      "displayFormat",
      "Format",
      [
        { value: "compact", label: "14k" },
        { value: "full", label: "14,021" },
        { value: "plus", label: "14000+" },
      ],
      "compact",
    ),
    select(
      "counterEffect",
      "Counter",
      [
        { value: "3d", label: "3D" },
        { value: "fade", label: "Fade" },
        { value: "smooth", label: "Smooth" },
        { value: "wheel", label: "Wheel" },
        { value: "simple", label: "Simple" },
      ],
      "3d",
    ),
    select(
      "hoverMode",
      "Hover",
      [
        { value: "none", label: "None" },
        { value: "label", label: "Label" },
        { value: "full", label: "Full" },
      ],
      "none",
    ),
    slider("hoverDuration", "Hover duration", {
      min: 100,
      max: 1200,
      step: 50,
      defaultValue: 300,
      format: (n) => `${n}ms`,
    }),
    toggle("showCount", "Count", true),
    toggle("fetchStars", "Auto fetch", true),
  ],
  footer: {
    defaults: { username: "shadcn-ui", repo: "ui" },
    render: (values, onChange) => <Footer values={values} onChange={onChange} />,
  },
};

/**
 * Repo picker for the GithubStarsButton preview. Renders below the Customize
 * panel and writes `username` / `repo` back into the shared customize values so
 * the live preview re-fetches.
 */
function Footer({
  values,
  onChange,
}: {
  values: CustomizeValues;
  onChange: (key: string, value: number | string | boolean) => void;
}) {
  const username = (values.username as string | undefined) ?? "shadcn-ui";
  const repo = (values.repo as string | undefined) ?? "ui";

  const [usernameInput, setUsernameInput] = useState(username);
  const [repoInput, setRepoInput] = useState(repo);

  const trimmedUser = usernameInput.trim();
  const trimmedRepo = repoInput.trim();
  const valid =
    Boolean(trimmedUser) &&
    Boolean(trimmedRepo) &&
    NAME_RE.test(trimmedUser) &&
    NAME_RE.test(trimmedRepo);

  // Debounce commits to the shared values so we don't hammer the API on
  // every keystroke. 400ms felt right while typing.
  useEffect(() => {
    if (!valid) return;
    if (trimmedUser === username && trimmedRepo === repo) return;
    const id = setTimeout(() => {
      onChange("username", trimmedUser);
      onChange("repo", trimmedRepo);
    }, 400);
    return () => clearTimeout(id);
  }, [trimmedRepo, trimmedUser, valid, username, repo, onChange]);

  const applyPreset = useCallback(
    (owner: string, repoName: string) => {
      setUsernameInput(owner);
      setRepoInput(repoName);
      onChange("username", owner);
      onChange("repo", repoName);
    },
    [onChange],
  );

  return (
    <div className="flex flex-col gap-2.5 rounded-xl border border-[var(--border)] bg-[var(--panel)] p-2.5">
      <div className="flex items-center justify-between gap-3 px-1">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-3)]">
          Repository
        </span>
        <span className="text-[10px] text-[var(--text-3)]">
          Live data via /api/github-stars
        </span>
      </div>

      <div className="flex h-12 items-center gap-1.5 rounded-lg border border-[var(--border-2)] bg-[var(--surface)] px-3 font-mono text-xs text-[var(--text-2)] focus-within:border-[var(--text-3)]">
        <span className="select-none text-[var(--text-3)]">github.com/</span>
        <input
          type="text"
          value={usernameInput}
          onChange={(e) => setUsernameInput(e.target.value)}
          placeholder="owner"
          spellCheck={false}
          autoComplete="off"
          aria-label="GitHub username"
          className="min-w-0 flex-1 bg-transparent text-[var(--text)] placeholder:text-[var(--text-3)] focus:outline-none"
        />
        <span className="select-none text-[var(--text-3)]">/</span>
        <input
          type="text"
          value={repoInput}
          onChange={(e) => setRepoInput(e.target.value)}
          placeholder="repo"
          spellCheck={false}
          autoComplete="off"
          aria-label="GitHub repository"
          className="min-w-0 flex-1 bg-transparent text-[var(--text)] placeholder:text-[var(--text-3)] focus:outline-none"
        />
        <span
          aria-hidden="true"
          className={cn(
            "ml-1 size-1.5 shrink-0 rounded-full transition-colors",
            valid ? "bg-[var(--text)]" : "bg-[var(--border-2)]",
          )}
        />
      </div>

      <div className="flex flex-wrap items-center gap-1 px-1">
        <span className="mr-1 text-[10px] uppercase tracking-wider text-[var(--text-3)]">
          Try
        </span>
        {PRESETS.map((p) => {
          const active = p.owner === username && p.repo === repo;
          return (
            <button
              key={`${p.owner}/${p.repo}`}
              type="button"
              onClick={() => applyPreset(p.owner, p.repo)}
              aria-pressed={active}
              className={cn(
                "rounded-md border px-2 py-1 font-mono text-[11px] transition-colors",
                active
                  ? "border-[var(--text-3)] bg-[var(--panel-2)] text-[var(--text)]"
                  : "border-[var(--border)] bg-[var(--surface)] text-[var(--text-2)] hover:border-[var(--text-3)] hover:text-[var(--text)]",
              )}
            >
              {p.owner}/{p.repo}
            </button>
          );
        })}
      </div>
    </div>
  );
}
