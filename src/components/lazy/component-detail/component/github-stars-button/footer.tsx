"use client";

import { useCallback, useEffect, useState } from "react";

import { cn } from "@/lib/utils";

import type { CustomizeValues } from "../../../customize";

const NAME_RE = /^[a-zA-Z0-9_.-]+$/;

const PRESETS: Array<{ owner: string; repo: string }> = [
  { owner: "shadcn-ui", repo: "ui" },
  { owner: "vercel", repo: "next.js" },
  { owner: "facebook", repo: "react" },
  { owner: "tailwindlabs", repo: "tailwindcss" },
  { owner: "anthropics", repo: "claude-code" },
];

type Props = {
  values: CustomizeValues;
  onChange: (key: string, value: number | string | boolean) => void;
};

/**
 * Repo picker for the GithubStarsButton preview. Renders below the Customize
 * panel and writes `username` / `repo` back into the shared customize values so
 * the live preview re-fetches.
 */
export function Footer({ values, onChange }: Props) {
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
    <div className="flex flex-col gap-2.5 rounded-xl border border-white/[0.06] bg-white/[0.015] p-2.5">
      <div className="flex items-center justify-between gap-3 px-1">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
          Repository
        </span>
        <span className="text-[10px] text-neutral-600">
          Live data via /api/github-stars
        </span>
      </div>

      <div className="flex h-12 items-center gap-1.5 rounded-lg border border-white/10 bg-neutral-950/80 px-3 font-mono text-xs text-neutral-300 focus-within:border-white/20">
        <span className="select-none text-neutral-500">github.com/</span>
        <input
          type="text"
          value={usernameInput}
          onChange={(e) => setUsernameInput(e.target.value)}
          placeholder="owner"
          spellCheck={false}
          autoComplete="off"
          aria-label="GitHub username"
          className="min-w-0 flex-1 bg-transparent text-neutral-100 placeholder:text-neutral-600 focus:outline-none"
        />
        <span className="select-none text-neutral-500">/</span>
        <input
          type="text"
          value={repoInput}
          onChange={(e) => setRepoInput(e.target.value)}
          placeholder="repo"
          spellCheck={false}
          autoComplete="off"
          aria-label="GitHub repository"
          className="min-w-0 flex-1 bg-transparent text-neutral-100 placeholder:text-neutral-600 focus:outline-none"
        />
        <span
          aria-hidden="true"
          className={cn(
            "ml-1 size-1.5 shrink-0 rounded-full transition-colors",
            valid ? "bg-white" : "bg-white/15",
          )}
        />
      </div>

      <div className="flex flex-wrap items-center gap-1 px-1">
        <span className="mr-1 text-[10px] uppercase tracking-wider text-neutral-600">
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
                  ? "border-white/20 bg-white/10 text-white"
                  : "border-white/[0.06] bg-neutral-900/60 text-neutral-400 hover:border-white/15 hover:bg-neutral-800/60 hover:text-neutral-100",
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

export const footer = {
  defaults: { username: "shadcn-ui", repo: "ui" } as Record<
    string,
    number | string | boolean
  >,
  render: (
    values: CustomizeValues,
    onChange: (key: string, value: number | string | boolean) => void,
  ) => <Footer values={values} onChange={onChange} />,
};
